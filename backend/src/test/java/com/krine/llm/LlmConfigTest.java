package com.krine.llm;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LlmConfigTest {
    @Test
    void auto는_키가_없으면_mock을_고른다() {
        assertThat(LlmConfig.resolveProvider("auto", "", "")).isEqualTo("mock");
        assertThat(LlmConfig.resolveProvider("auto", "g-key", "")).isEqualTo("gemini");
        assertThat(LlmConfig.resolveProvider("auto", "", "o-key")).isEqualTo("openai");
        assertThat(LlmConfig.resolveProvider("mock", "g-key", "o-key")).isEqualTo("mock");
    }
}
