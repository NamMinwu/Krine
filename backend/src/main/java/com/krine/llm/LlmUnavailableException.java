package com.krine.llm;

import lombok.Getter;

// LLM 쿼터/과부하로 일시적으로 응답할 수 없는 상태. retryAfterSeconds 뒤 재시도 가능.
@Getter
public class LlmUnavailableException extends RuntimeException {
    private final int retryAfterSeconds;

    public LlmUnavailableException(int retryAfterSeconds, String message) {
        super(message);
        this.retryAfterSeconds = retryAfterSeconds;
    }
}
