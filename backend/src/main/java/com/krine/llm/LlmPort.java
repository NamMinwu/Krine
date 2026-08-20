package com.krine.llm;

public interface LlmPort {
    String generate(String systemPrompt, String userPrompt);
}
