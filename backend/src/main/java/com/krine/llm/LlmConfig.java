package com.krine.llm;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class LlmConfig {
    @Bean
    public LlmPort llmPort(@Value("${llm.provider}") String provider,
                           @Value("${llm.gemini.api-key}") String geminiKey,
                           @Value("${llm.gemini.model}") String geminiModel,
                           @Value("${llm.openai.api-key}") String openAiKey,
                           @Value("${llm.openai.model}") String openAiModel) {
        String resolved = resolveProvider(provider, geminiKey, openAiKey);
        log.info("LLM provider: {}", resolved);
        return switch (resolved) {
            case "gemini" -> new GeminiClient(geminiKey, geminiModel);
            case "openai" -> new OpenAiClient(openAiKey, openAiModel);
            default -> new MockLlm();
        };
    }

    static String resolveProvider(String provider, String geminiKey, String openAiKey) {
        if (!"auto".equals(provider)) {
            return provider;
        }
        if (geminiKey != null && !geminiKey.isBlank()) {
            return "gemini";
        }
        if (openAiKey != null && !openAiKey.isBlank()) {
            return "openai";
        }
        return "mock";
    }
}
