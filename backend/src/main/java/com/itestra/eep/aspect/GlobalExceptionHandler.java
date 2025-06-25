package com.itestra.eep.aspect;

import com.itestra.eep.exceptions.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.nio.channels.ClosedChannelException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Map<String, String> CONSTRAINT_TO_MESSAGE = Map.of(
            "profile_gitlab_username_key", "There is a user with the given GitLab username"
    );

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseBody
    public ResponseEntity<List<String>> handleValidationExceptions(final MethodArgumentNotValidException ex) {
        List<String> errors = new ArrayList<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String errorMessage = error.getDefaultMessage();
            errors.add(errorMessage);
        });
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({ClosedChannelException.class})
    public ResponseEntity<Object> handleClosedChannelException(ClosedChannelException exception) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(exception.getMessage());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<String> handleMaxSizeException(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body("File is too large! Max upload size exceeded.");
    }

    @ExceptionHandler({
            EmployeeNotFoundException.class,
            EventNotFoundException.class,
            ParticipationNotFoundException.class,
            ProjectNotFoundException.class,
            SchematicsNotFoundException.class,
            UserProfileNotFoundException.class,
            EventCapacityExceededException.class})
    public ResponseEntity<Object> handleCustomRuntimeException(RuntimeException exception) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(exception.getMessage());
    }

    @ExceptionHandler({RuntimeException.class})
    public ResponseEntity<Object> handleRuntimeException(RuntimeException exception) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Internal Server Error");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        List<String> messages = new ArrayList<>();
        messages.add("A data integrity error occurred. Please check your input.");
        Throwable rootCause = ex.getRootCause();

        if (rootCause instanceof SQLException sqlEx) {
            String sqlMessage = sqlEx.getMessage();

            for (Map.Entry<String, String> entry : CONSTRAINT_TO_MESSAGE.entrySet()) {
                if (sqlMessage != null && sqlMessage.contains(entry.getKey())) {
                    messages.add(entry.getValue());
                    break;
                }
            }

        }

        log.warn("Data integrity violation", ex);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(messages.toString());
    }

    // This handles illegal accesses stemming from @PreAuthorized
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDeniedException(AccessDeniedException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "You are unauthorized for this action"));
    }

}
