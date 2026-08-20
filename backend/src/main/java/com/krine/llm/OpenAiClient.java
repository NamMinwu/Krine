package com.krine.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
public class OpenAiClient implements LlmPort {
    private static final String URL = "https://api.openai.com/v1/chat/completions";

    private final String apiKey;
    private final String model;
    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String generate(String systemPrompt, String userPrompt) {
        try {
            return callOnce(systemPrompt, userPrompt);
        } catch (LlmParseException first) {
            // 일시적 과부하에 대비한 1회 재시도
            log.warn("OpenAI 1차 호출 실패, 재시도합니다: {}", first.getMessage());
            try {
                Thread.sleep(1500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw first;
            }
            return callOnce(systemPrompt, userPrompt);
        }
    }

    private String callOnce(String systemPrompt, String userPrompt) {
        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)));
        try {
            String raw = restClient.post()
                    .uri(URL)
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);
            JsonNode root = objectMapper.readTree(raw);
            JsonNode text = root.path("choices").path(0).path("message").path("content");
            if (text.isMissingNode()) {
                throw new LlmParseException("OpenAI 응답에 텍스트가 없습니다: " + raw);
            }
            logUsage(root, userPrompt);
            return text.asText();
        } catch (LlmParseException e) {
            throw e;
        } catch (Exception e) {
            log.error("OpenAI 호출 실패", e);
            throw new LlmParseException("OpenAI 호출에 실패했습니다", e);
        }
    }

    // 운영 지표: 호출 단계별 토큰 사용량
    private void logUsage(JsonNode root, String userPrompt) {
        JsonNode usage = root.path("usage");
        if (usage.isMissingNode()) {
            return;
        }
        String step = userPrompt.startsWith("[")
                ? userPrompt.substring(0, userPrompt.indexOf(']') + 1)
                : "[?]";
        log.info("LLM_USAGE step={} prompt={} output={} total={}",
                step,
                usage.path("prompt_tokens").asInt(),
                usage.path("completion_tokens").asInt(),
                usage.path("total_tokens").asInt());
    }
}
