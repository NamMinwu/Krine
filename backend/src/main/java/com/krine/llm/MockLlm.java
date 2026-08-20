package com.krine.llm;

import java.time.LocalDate;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * API 키 없이 전체 플로우가 동작하도록 하는 결정적 구현.
 * FlowService가 붙이는 마커([DISCOVER] 등)와 카운트 힌트("질문 수: n", "반론 수: n")를 보고
 * 스키마에 맞는 프리셋 JSON을 돌려준다.
 */
public class MockLlm implements LlmPort {
    private static final Pattern QUESTION_COUNT = Pattern.compile("질문 수: (\\d+)");
    private static final Pattern CHALLENGE_COUNT = Pattern.compile("반론 수: (\\d+)");

    private static final List<String> QUESTIONS = List.of(
            "{\"question\":\"그 선택 말고 고민했던 다른 길이 있었나요?\",\"choices\":[\"있었지만 접었어요\",\"딱히 없었어요\",\"직접 입력\"],\"targets\":\"alternatives\"}",
            "{\"question\":\"이번 선택에서 가장 중요하게 본 기준은 무엇이었나요?\",\"choices\":[\"비용\",\"시간\",\"마음 편함\",\"직접 입력\"],\"targets\":\"criteria\"}",
            "{\"question\":\"이 선택으로 포기하게 된 것이 있다면 무엇인가요?\",\"choices\":[\"다른 기회\",\"비용 절약\",\"딱히 없음\",\"직접 입력\"],\"targets\":\"sacrifices\"}",
            "{\"question\":\"어떤 상황이 생기면 이 판단을 다시 생각해볼 것 같나요?\",\"choices\":[\"상황이 크게 바뀌면\",\"기한이 지나면\",\"직접 입력\"],\"targets\":\"conditions\"}");

    private static final List<String> CHALLENGES = List.of(
            "{\"perspective\":\"비용을 가장 중요하게 본다면?\",\"objection\":\"이 선택이 만드는 추가 비용이 얻는 것보다 클 수 있습니다. 그 비용을 어떻게 평가하셨나요?\"}",
            "{\"perspective\":\"시간이 지난 뒤를 생각한다면?\",\"objection\":\"조금 더 기다리면 지금보다 나은 선택지가 생길 수도 있습니다. 기다리는 쪽은 왜 배제하셨나요?\"}");

    @Override
    public String generate(String systemPrompt, String userPrompt) {
        if (userPrompt.contains("[DISCOVER]")) {
            return "{\"title\":\"이 선택을 유지할까, 바꿀까?\",\"optionA\":\"지금 선택 유지\",\"optionB\":\"다른 길 선택\","
                    + "\"message\":\"이 이야기는 '지금 선택 유지 vs 다른 길 선택' 판단으로 기록해볼 수 있어요.\"}";
        }
        if (userPrompt.contains("[QUESTION]")) {
            int asked = extract(QUESTION_COUNT, userPrompt);
            return QUESTIONS.get(Math.min(asked, QUESTIONS.size() - 1));
        }
        if (userPrompt.contains("[STRUCTURE]")) {
            LocalDate suggested = LocalDate.now().plusDays(30);
            return "{\"title\":\"이 선택을 유지할까, 바꿀까?\",\"situation\":\"일상 속에서 내린 선택을 돌아보는 상황\","
                    + "\"topicTag\":\"일상\",\"criteria\":[\"마음 편함\",\"시간\"],"
                    + "\"options\":[{\"label\":\"지금 선택 유지\",\"gains\":[\"익숙함\",\"당장의 안정\"],\"sacrifices\":[\"다른 기회\"],\"premises\":[\"현재 방식이 아직 유효하다\"]},"
                    + "{\"label\":\"다른 길 선택\",\"gains\":[\"새로운 가능성\"],\"sacrifices\":[\"전환 비용\"],\"premises\":[\"바꿀 만큼 불만이 크다\"]}],"
                    + "\"conditions\":[{\"text\":\"상황이 크게 바뀌는 사건 발생\",\"type\":\"EVENT\",\"dueDate\":null}],"
                    + "\"suggestedReviewDate\":\"" + suggested + "\"}";
        }
        if (userPrompt.contains("[CHALLENGE]")) {
            int count = extract(CHALLENGE_COUNT, userPrompt);
            return CHALLENGES.get(Math.min(count, CHALLENGES.size() - 1));
        }
        if (userPrompt.contains("[REFLECT]")) {
            return "{\"reflectBack\":\"답변을 보면 당장의 이득보다 스스로 감당할 수 있는 리스크를 더 중요하게 보고 계신 것 같아요. 맞나요?\"}";
        }
        throw new LlmParseException("알 수 없는 프롬프트 마커: " + userPrompt.substring(0, Math.min(40, userPrompt.length())));
    }

    private static int extract(Pattern pattern, String text) {
        Matcher m = pattern.matcher(text);
        return m.find() ? Integer.parseInt(m.group(1)) : 0;
    }
}
