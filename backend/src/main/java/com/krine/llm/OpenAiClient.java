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
            JsonNode text = objectMapper.readTree(raw).path("choices").path(0).path("message").path("content");
            if (text.isMissingNode()) {
                throw new LlmParseException("OpenAI 응답에 텍스트가 없습니다: " + raw);
            }
            return text.asText();
        } catch (LlmParseException e) {
            throw e;
        } catch (Exception e) {
            log.error("OpenAI 호출 실패", e);
            throw new LlmParseException("OpenAI 호출에 실패했습니다", e);
        }
    }
}
