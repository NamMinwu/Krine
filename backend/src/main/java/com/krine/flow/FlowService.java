package com.krine.flow;

import com.krine.common.InvalidStateException;
import com.krine.common.NotFoundException;
import com.krine.decision.Challenge;
import com.krine.decision.Decision;
import com.krine.decision.DecisionRepository;
import com.krine.decision.DecisionService;
import com.krine.decision.FlowMessage;
import com.krine.decision.dto.DecisionResponse;
import com.krine.decision.enums.ChallengeResolution;
import com.krine.decision.enums.FlowStep;
import com.krine.decision.enums.MessageRole;
import com.krine.flow.dto.AnswerResult;
import com.krine.flow.dto.ChallengeResult;
import com.krine.flow.dto.DiscoverResult;
import com.krine.flow.dto.NextQuestion;
import com.krine.flow.dto.StructureDraft;
import com.krine.llm.LlmPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FlowService {
    static final int MAX_QUESTIONS = 4;
    static final int MAX_CHALLENGES = 2;

    private final LlmPort llm;
    private final DecisionService decisions;
    private final DecisionRepository repository;

    public DiscoverResult discover(Long id) {
        Decision d = decisions.get(id);
        String out = llm.generate(Prompts.GUARDRAILS + Prompts.DISCOVER,
                "[DISCOVER]\n일기:\n" + d.getRawDiary());
        DiscoverResult result = JsonUtil.parse(out, DiscoverResult.class);
        d.setTitle(result.title());
        d.setFlowStep(FlowStep.QUESTIONS);
        d.getMessages().add(FlowMessage.builder()
                .role(MessageRole.ASSISTANT).content(result.message()).build());
        return result;
    }

    public NextQuestion answer(Long id, String answer) {
        Decision d = decisions.get(id);
        if (answer != null && !answer.isBlank()) {
            d.getMessages().add(FlowMessage.builder().role(MessageRole.USER).content(answer).build());
        }
        long asked = d.getMessages().stream()
                .filter(m -> m.getRole() == MessageRole.ASSISTANT && m.getChoicesJson() != null)
                .count();
        if (asked >= MAX_QUESTIONS) {
            return new NextQuestion(null, List.of(), true, (int) asked, MAX_QUESTIONS);
        }
        String out = llm.generate(Prompts.GUARDRAILS + Prompts.QUESTION,
                "[QUESTION]\n지금까지 질문 수: " + asked + "\n대화:\n" + transcriptOf(d));
        QuestionJson q = JsonUtil.parse(out, QuestionJson.class);
        d.getMessages().add(FlowMessage.builder()
                .role(MessageRole.ASSISTANT).content(q.question())
                .choicesJson(JsonUtil.toJson(q.choices())).build());
        return new NextQuestion(q.question(), q.choices(), false, (int) asked + 1, MAX_QUESTIONS);
    }

    public StructureDraft structureDraft(Long id) {
        Decision d = decisions.get(id);
        String out = llm.generate(Prompts.GUARDRAILS + Prompts.STRUCTURE,
                "[STRUCTURE]\n오늘 날짜: " + LocalDate.now() + "\n대화:\n" + transcriptOf(d));
        StructureDraft draft = JsonUtil.parse(out, StructureDraft.class);
        d.setFlowStep(FlowStep.STRUCTURE);
        return draft;
    }

    public ChallengeResult challenge(Long id) {
        Decision d = decisions.get(id);
        int count = d.getChallenges().size();
        if (count >= MAX_CHALLENGES) {
            throw new InvalidStateException("반론은 " + MAX_CHALLENGES + "개까지만 제시합니다");
        }
        String existing = d.getChallenges().stream()
                .map(Challenge::getObjection)
                .reduce("", (a, b) -> a + "\n- " + b);
        String out = llm.generate(Prompts.GUARDRAILS + Prompts.CHALLENGE,
                "[CHALLENGE]\n지금까지 반론 수: " + count
                        + "\n이미 제시한 반론:" + (existing.isBlank() ? " 없음" : existing)
                        + "\n판단 구조:\n" + structureSummaryOf(d)
                        + "\n대화:\n" + transcriptOf(d));
        ChallengeJson c = JsonUtil.parse(out, ChallengeJson.class);
        Challenge challenge = Challenge.builder()
                .perspective(c.perspective()).objection(c.objection()).build();
        d.getChallenges().add(challenge);
        d.setFlowStep(FlowStep.CHALLENGE);
        // 관리 중인 엔티티이므로 flush로 cascade persist — 같은 인스턴스에 id가 할당된다
        repository.flush();
        return new ChallengeResult(challenge.getId(), c.perspective(), c.objection(),
                MAX_CHALLENGES - d.getChallenges().size());
    }

    public AnswerResult answerChallenge(Long challengeId, String answer) {
        Decision d = findByChallengeId(challengeId);
        Challenge challenge = challengeIn(d, challengeId);
        challenge.setUserAnswer(answer);
        String out = llm.generate(Prompts.GUARDRAILS + Prompts.REFLECT,
                "[REFLECT]\n반론: " + challenge.getObjection() + "\n사용자 답변: " + answer);
        AnswerResult result = JsonUtil.parse(out, AnswerResult.class);
        challenge.setReflectBack(result.reflectBack());
        return result;
    }

    public DecisionResponse resolveChallenge(Long challengeId, String resolution) {
        Decision d = findByChallengeId(challengeId);
        Challenge challenge = challengeIn(d, challengeId);
        challenge.setResolution(ChallengeResolution.valueOf(resolution));
        repository.flush();
        return DecisionResponse.from(d);
    }

    private Decision findByChallengeId(Long challengeId) {
        return repository.findByChallengeId(challengeId)
                .orElseThrow(() -> new NotFoundException("반론을 찾을 수 없습니다: " + challengeId));
    }

    private static Challenge challengeIn(Decision d, Long challengeId) {
        return d.getChallenges().stream()
                .filter(c -> c.getId().equals(challengeId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("반론을 찾을 수 없습니다: " + challengeId));
    }

    private static String transcriptOf(Decision d) {
        StringBuilder sb = new StringBuilder("(일기) ").append(d.getRawDiary());
        for (FlowMessage m : d.getMessages()) {
            sb.append('\n')
                    .append(m.getRole() == MessageRole.USER ? "(사용자) " : "(질문) ")
                    .append(m.getContent());
        }
        return sb.toString();
    }

    private static String structureSummaryOf(Decision d) {
        StringBuilder sb = new StringBuilder("제목: ").append(d.getTitle());
        sb.append("\n기준: ").append(String.join(", ", d.getCriteria()));
        d.getOptions().forEach(o -> sb.append("\n선택지 ").append(o.getLabel())
                .append(" | 전제: ").append(String.join(", ", o.getPremises())));
        return sb.toString();
    }

    private record QuestionJson(String question, List<String> choices, String targets) {
    }

    private record ChallengeJson(String perspective, String objection) {
    }
}
