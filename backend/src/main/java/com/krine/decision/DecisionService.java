package com.krine.decision;

import com.krine.common.InvalidStateException;
import com.krine.common.NotFoundException;
import com.krine.decision.dto.DecisionResponse;
import com.krine.decision.dto.DecisionSummaryResponse;
import com.krine.decision.dto.ReviewInput;
import com.krine.decision.dto.StructureInput;
import com.krine.decision.enums.ConditionStatus;
import com.krine.decision.enums.ConditionType;
import com.krine.decision.enums.DecisionStatus;
import com.krine.decision.enums.FlowStep;
import com.krine.decision.enums.Verdict;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DecisionService {
    private final DecisionRepository repository;

    public Decision createDraft(String rawDiary) {
        return repository.save(Decision.builder().rawDiary(rawDiary).build());
    }

    @Transactional(readOnly = true)
    public Decision get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("판단을 찾을 수 없습니다: " + id));
    }

    @Transactional(readOnly = true)
    public List<Decision> list() {
        return repository.findAll();
    }

    public Decision updateStructure(Long id, StructureInput input) {
        Decision d = get(id);
        requireDraft(d);
        d.setTitle(input.title());
        d.setSituation(input.situation());
        d.setTopicTag(input.topicTag());
        d.getCriteria().clear();
        if (input.criteria() != null) {
            d.getCriteria().addAll(input.criteria());
        }
        d.getOptions().clear();
        input.options().forEach(o -> d.getOptions().add(DecisionOption.builder()
                .label(o.label())
                .gains(nn(o.gains()))
                .sacrifices(nn(o.sacrifices()))
                .premises(nn(o.premises()))
                .build()));
        d.getConditions().clear();
        input.conditions().forEach(c -> d.getConditions().add(Condition.builder()
                .text(c.text())
                .type(ConditionType.valueOf(c.type()))
                .dueDate(c.dueDate())
                .build()));
        d.setFlowStep(FlowStep.STRUCTURE);
        d.setUpdatedAt(LocalDateTime.now());
        return repository.saveAndFlush(d);
    }

    public Decision confirm(Long id, String conclusion, String firstExpression) {
        Decision d = get(id);
        requireDraft(d);
        d.setStatus(DecisionStatus.ACTIVE);
        d.setFlowStep(FlowStep.DONE);
        d.setFirstExpression(firstExpression);
        d.getVersions().add(DecisionVersion.builder()
                .versionNo(1).conclusion(conclusion).verdict(Verdict.INITIAL).build());
        d.setUpdatedAt(LocalDateTime.now());
        return repository.saveAndFlush(d);
    }

    public Decision review(Long id, ReviewInput input) {
        Decision d = get(id);
        if (d.getStatus() != DecisionStatus.ACTIVE) {
            throw new InvalidStateException("확정된 판단만 재검토할 수 있습니다");
        }
        Verdict verdict = Verdict.valueOf(input.verdict());
        String conclusion = verdict == Verdict.MAINTAINED
                ? d.getVersions().get(d.getVersions().size() - 1).getConclusion()
                : input.newConclusion();
        d.getVersions().add(DecisionVersion.builder()
                .versionNo(d.getVersions().size() + 1)
                .conclusion(conclusion).verdict(verdict).reason(input.reason()).build());
        if (input.triggeredConditionId() != null) {
            d.getConditions().stream()
                    .filter(c -> c.getId().equals(input.triggeredConditionId()))
                    .findFirst()
                    .ifPresent(c -> c.setStatus(ConditionStatus.TRIGGERED));
        }
        d.setUpdatedAt(LocalDateTime.now());
        return repository.saveAndFlush(d);
    }

    // dto 매핑은 lazy 컬렉션 초기화가 필요하므로 트랜잭션 안에서 수행한다 (open-in-view: false)
    public DecisionResponse createDraftResponse(String rawDiary) {
        return DecisionResponse.from(createDraft(rawDiary));
    }

    @Transactional(readOnly = true)
    public DecisionResponse getResponse(Long id) {
        return DecisionResponse.from(get(id));
    }

    @Transactional(readOnly = true)
    public List<DecisionSummaryResponse> listSummaries() {
        return list().stream().map(DecisionSummaryResponse::from).toList();
    }

    public DecisionResponse updateStructureResponse(Long id, StructureInput input) {
        return DecisionResponse.from(updateStructure(id, input));
    }

    public DecisionResponse confirmResponse(Long id, String conclusion, String firstExpression) {
        return DecisionResponse.from(confirm(id, conclusion, firstExpression));
    }

    public DecisionResponse reviewResponse(Long id, ReviewInput input) {
        return DecisionResponse.from(review(id, input));
    }

    private void requireDraft(Decision d) {
        if (d.getStatus() != DecisionStatus.DRAFT) {
            throw new InvalidStateException("확정된 판단은 수정할 수 없습니다 (append-only)");
        }
    }

    private static List<String> nn(List<String> values) {
        return values == null ? new ArrayList<>() : new ArrayList<>(values);
    }
}
