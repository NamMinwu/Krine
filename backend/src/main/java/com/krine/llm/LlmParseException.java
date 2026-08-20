package com.krine.llm;

public class LlmParseException extends RuntimeException {
    public LlmParseException(String message, Throwable cause) {
        super(message, cause);
    }

    public LlmParseException(String message) {
        super(message);
    }
}
