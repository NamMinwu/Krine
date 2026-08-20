package com.krine.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> notFound(NotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail(e.getMessage()));
    }

    @ExceptionHandler(InvalidStateException.class)
    public ResponseEntity<ApiResponse<Void>> invalidState(InvalidStateException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.fail(e.getMessage()));
    }

    @ExceptionHandler(com.krine.llm.LlmParseException.class)
    public ResponseEntity<ApiResponse<Void>> llmFailure(com.krine.llm.LlmParseException e) {
        log.warn("LLM 호출/파싱 실패: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.fail("AI 응답이 지연되고 있어요. 잠시 후 다시 시도해주세요"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> internal(Exception e) {
        log.error("Unhandled exception", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.fail("서버 오류가 발생했습니다"));
    }
}
