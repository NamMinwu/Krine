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
public class GeminiClient implements LlmPort {
    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";

    private final String apiKey;
    private final String model;
    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String generate(String systemPrompt, String userPrompt) {
        try {
            return callOnce(systemPrompt, userPrompt);
        } catch (LlmParseException first) {
            // 일시적 과부하(503 등)에 대비한 1회 재시도
            log.warn("Gemini 1차 호출 실패, 재시도합니다: {}", first.getMessage());
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
                "system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                "contents", List.of(Map.of("parts", List.of(Map.of("text", userPrompt)))));
        try {
            String raw = restClient.post()
                    .uri(BASE_URL + model + ":generateContent?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);
            JsonNode root = objectMapper.readTree(raw);
            JsonNode text = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            if (text.isMissingNode()) {
                throw new LlmParseException("Gemini 응답에 텍스트가 없습니다: " + raw);
            }
            logUsage(root, userPrompt);
            return text.asText();
        } catch (LlmParseException e) {
            throw e;
        } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e) {
            int retryAfter = parseRetrySeconds(e.getResponseBodyAsString());
            log.warn("Gemini 쿼터 초과(429), {}초 후 재시도 가능", retryAfter);
            throw new LlmUnavailableException(retryAfter, "Gemini 쿼터 초과");
        } catch (Exception e) {
            log.error("Gemini 호출 실패", e);
            throw new LlmParseException("Gemini 호출에 실패했습니다", e);
        }
    }

    // 429 본문의 "Please retry in 24.85s" / retryDelay 힌트에서 대기 시간을 추출
    private static int parseRetrySeconds(String body) {
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("retry in ([0-9]+(?:\\.[0-9]+)?)s").matcher(body == null ? "" : body);
        if (m.find()) {
            return Math.min(60, (int) Math.ceil(Double.parseDouble(m.group(1))) + 1);
        }
        return 20;
    }

    // 운영 지표: 호출 단계별 토큰 사용량 (usageMetadata)
    private void logUsage(JsonNode root, String userPrompt) {
        JsonNode usage = root.path("usageMetadata");
        if (usage.isMissingNode()) {
            return;
        }
        String step = userPrompt.startsWith("[")
                ? userPrompt.substring(0, userPrompt.indexOf(']') + 1)
                : "[?]";
        log.info("LLM_USAGE step={} prompt={} output={} total={}",
                step,
                usage.path("promptTokenCount").asInt(),
                usage.path("candidatesTokenCount").asInt(),
                usage.path("totalTokenCount").asInt());
    }
}
