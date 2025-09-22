package cdu.zjy.topictwo.handler;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Map<String, Object> handleAllExceptions(Exception ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", ex.getClass().getName());
        error.put("message", ex.getMessage());
        error.put("stackTrace", ex.getStackTrace()[0].toString());
        return error;
    }
}
