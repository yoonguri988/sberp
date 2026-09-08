package com.sb.erp.global.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 전역 예외 처리.
 */
@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final MessageSource messageSource;

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(createErrorBody(ex.getMessage()));
    }

    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<Map<String, String>> handleBadRequest(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(createErrorBody(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    /**
     * 지금까지 전용 핸들러가 없어 그대로 500으로 흘러가던 DeptTransferException을 처리한다.
     * (단, DeptTransferController처럼 컨트롤러가 이미 자체 try/catch로 이 예외를 잡는 경우는
     * 이 핸들러까지 오지 않고 컨트롤러의 처리 결과가 그대로 응답된다 — 이번 작업에서 그 컨트롤러
     * 로직 자체는 건드리지 않았다.)
     */
    @ExceptionHandler(DeptTransferException.class)
    public ResponseEntity<Map<String, Object>> handleDeptTransfer(DeptTransferException ex) {
        String message = messageSource.getMessage(
                ex.getErrorCode(), null, ex.getMessage(), LocaleContextHolder.getLocale());
        Map<String, Object> body = new HashMap<>();
        body.put("error", message);
        body.put("code", ex.getErrorCode());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /**
     * 지금까지 전용 핸들러가 없어 그대로 500으로 흘러가던 FileUploadException을 처리한다.
     * (FileUploadUtil을 직접 호출하는 컨트롤러 중 일부는 이미 자체 try/catch를 갖고 있어
     *  이 핸들러까지 오지 않을 수 있다 — 해당 컨트롤러 로직은 이번 작업에서 건드리지 않았다.)
     */
    @ExceptionHandler(FileUploadException.class)
    public ResponseEntity<Map<String, String>> handleFileUpload(FileUploadException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(createErrorBody(ex.getMessage()));
    }

    /**
     * 그 외 예상하지 못한 모든 예외에 대한 안전망. 원인 메시지를 그대로 노출하지 않고
     * 로케일에 맞는 일반 메시지(error.internal)를 내려준다.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleUnexpected(Exception ex) {
    	log.error("처리되지 않은 예외 발생", ex);
        String message = messageSource.getMessage("error.internal", null, LocaleContextHolder.getLocale());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(createErrorBody(message));
    }

    private Map<String, String> createErrorBody(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}
