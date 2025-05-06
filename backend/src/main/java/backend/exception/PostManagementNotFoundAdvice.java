package backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

/** Global exception handler for PostManagementNotFoundException. When this exception is thrown, a 404 Not Found status is returned along with the exception message.*/

@ControllerAdvice
public class PostManagementNotFoundAdvice {
    //Handles PostManagementNotFoundException thrown from any controller.
    @ExceptionHandler(PostManagementNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)

    public String postNotFoundHandler(PostManagementNotFoundException ex) {

        return ex.getMessage();// Sends the exception's message as the response body
    }

}
