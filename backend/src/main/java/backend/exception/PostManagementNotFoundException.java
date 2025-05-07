package backend.exception;

//Custom exception thrown when a post is not found in the system.
public class PostManagementNotFoundException extends RuntimeException {

    //Constructs a new PostManagementNotFoundException with the specified detail message.
    public PostManagementNotFoundException(String message) {

        super(message);
    }
}
