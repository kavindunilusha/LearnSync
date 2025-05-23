package backend.controller;

import backend.exception.UserNotFoundException;
import backend.model.NotificationModel;
import backend.model.UserModel;
import backend.model.LearningPlanModel; // Import LearningPlanModel
import backend.repository.NotificationRepository;
import backend.repository.UserRepository;
import backend.repository.AchievementsRepository; // Import the repository
import backend.repository.LearningPlanRepository; // Import the repository
import backend.repository.PostManagementRepository; // Import the repository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@RestController
@CrossOrigin("http://localhost:3000")
public class UserController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AchievementsRepository achievementsRepository; // Inject the repository

    @Autowired
    private LearningPlanRepository learningPlanRepository; // Inject the repository

    @Autowired
    private PostManagementRepository postManagementRepository; // Inject the repository

    @Autowired
    private JavaMailSender mailSender; // Add JavaMailSender for sending emails

    private static final String PROFILE_UPLOAD_DIR = "uploads/profile"; // Relative path

    //Insert User
    @PostMapping("/user")
    public ResponseEntity<?> newUserModel(@RequestBody UserModel newUserModel) {
        if (newUserModel.getEmail() == null || newUserModel.getFullname() == null || 
            newUserModel.getPassword() == null || newUserModel.getBio() == null || // Validate bio
            newUserModel.getSkills() == null) { // Validate skills
            System.out.println("Missing required fields in registration."); // Log the error
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Missing required fields."));
        }

        if (userRepository.existsByEmail(newUserModel.getEmail())) {
            System.out.println("Registration failed: Email already exists."); // Log the error
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already exists!"));
        }
        
        //issue: account is added to database before email is verified
        try {
            UserModel savedUser = userRepository.save(newUserModel);
            System.out.println("User registered successfully: " + savedUser.getId()); // Log success
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (Exception e) {
            System.out.println("Error saving user: " + e.getMessage()); // Log the error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to save user."));
        }
    }




    // Uncomment the following code and comment the above to fix the email verification issue:

    //Replace the above code with the following to fix the email verification issue:
    // @PostMapping("/user")
    // public ResponseEntity<?> newUserModel(@RequestBody UserModel newUserModel) {
    //     System.out.println("\n\nEndpoint /user called for user registration.\n\n"); // Log endpoint usage
    //     if (newUserModel.getEmail() == null || newUserModel.getFullname() == null || 
    //         newUserModel.getPassword() == null || newUserModel.getBio() == null || 
    //         newUserModel.getSkills() == null) {
    //         System.out.println("Missing required fields in registration."); // Log the error
    //         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Missing required fields."));
    //     }
    
    //     if (userRepository.existsByEmail(newUserModel.getEmail())) {
    //         System.out.println("Registration failed: Email already exists."); // Log the error
    //         return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already exists!"));
    //     }
    
    //     // Generate OTP
    //     String otp = generateOtp();
    //     newUserModel.setOtp(otp);
    //     newUserModel.setVerified(false); // Mark user as unverified
    
    //     // Send OTP to user's email
    //     try {
    //         sendOtpEmail(newUserModel.getEmail(), otp);
    //         // Temporarily store user details in memory
    //         temporaryUserStorage.put(newUserModel.getEmail(), newUserModel);
    //         System.out.println("Temporary storage contents: " + temporaryUserStorage); // Log temporary storage
    
    //         System.out.println("User added to temporary storage: " + newUserModel); // Log success
    //         return ResponseEntity.ok(Map.of("message", "OTP sent to your email. Please verify to complete registration."));
    //     } catch (Exception e) {
    //         System.out.println("Error sending OTP: " + e.getMessage()); // Log the error
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to send OTP."));
    //     }
    // }

    // Utility method to generate OTP
    // private String generateOtp() {
    //     Random random = new Random();
    //     int otp = 100000 + random.nextInt(900000); // Generate a 6-digit OTP
    //     return String.valueOf(otp);
    // }

    // // Utility method to send OTP email
    // private void sendOtpEmail(String email, String otp) {
    //     SimpleMailMessage message = new SimpleMailMessage();
    //     message.setTo(email);
    //     message.setSubject("Your OTP for Email Verification");
    //     message.setText("Your OTP is: " + otp);
    //     mailSender.send(message);
    //     System.out.println("OTP sent to email: " + email + ", OTP: " + otp); // Log the OTP
    // }



    // Temporary storage for unverified users (for demonstration purposes)
    // private final Map<String, UserModel> temporaryUserStorage = new HashMap<>();

    // New endpoint to verify OTP and complete registration
    // @PostMapping("/verifyOtp")
    // public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
    //     System.out.println("\n\nEndpoint /verifyOtp called for OTP verification.\n\n"); // Log endpoint usage
    //     String email = request.get("email") != null ? request.get("email").trim() : null;
    //     String otp = request.get("otp") != null ? request.get("otp").trim() : null;
    
    //     if (email == null) {
    //         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Email is required."));
    //     }
    
    //     // Check if OTP is provided (verification step)
    //     if (otp != null) {
    //         System.out.println("Verifying OTP for email: " + email + ", OTP: " + otp);
    
    //         UserModel user = temporaryUserStorage.get(email);
    //         if (user == null) {
    //             System.out.println("User not found in temporary storage for email: " + email);
    //             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found or OTP expired."));
    //         }
    
    //         System.out.println("Stored OTP for email: " + email + " is: " + user.getOtp());
    
    //         if (user.getOtp().equals(otp)) {
    //             user.setVerified(true); // Mark user as verified
    //             user.setOtp(null); // Clear OTP
    
    //             try {
    //                 System.out.println("Attempting to save user to database: " + user);
    //                 userRepository.save(user); // Save user to the database
    //                 temporaryUserStorage.remove(email); // Remove from temporary storage
    //                 System.out.println("User saved to database: " + user.getEmail());
    //                 return ResponseEntity.ok(Map.of("message", "Email verified successfully!"));
    //             } catch (Exception e) {
    //                 System.out.println("Error saving user to database: " + e.getMessage());
    //                 return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to save user to database."));
    //             }
    //         } else {
    //             System.out.println("Invalid OTP for email: " + email);
    //             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid OTP."));
    //         }
    //     }
    
    //     // If OTP is not provided, generate and send a new OTP (registration step)
    //     String generatedOtp = generateOtp();
    //     UserModel user = temporaryUserStorage.get(email);
    //     if (user == null) {
    //         return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found in temporary storage."));
    //     }
    
    //     user.setOtp(generatedOtp);
    //     try {
    //         sendOtpEmail(email, generatedOtp);
    //         System.out.println("OTP sent to email: " + email + ", OTP: " + generatedOtp);
    //         return ResponseEntity.ok(Map.of("message", "OTP sent to your email. Please verify to complete registration."));
    //     } catch (Exception e) {
    //         System.out.println("Error sending OTP: " + e.getMessage());
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to send OTP."));
    //     }
    // }

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------

    

    //User Login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody UserModel loginDetails) {
        System.out.println("Login attempt for email: " + loginDetails.getEmail()); // Log email for debugging

        UserModel user = userRepository.findByEmail(loginDetails.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Email not found: " + loginDetails.getEmail()));

        if (user.getPassword().equals(loginDetails.getPassword())) {
            System.out.println("Login successful for email: " + loginDetails.getEmail()); // Log success
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login Successful");
            response.put("id", user.getId());
            response.put("fullName", user.getFullname());
            return ResponseEntity.ok(response);
        } else {
            System.out.println("Invalid password for email: " + loginDetails.getEmail()); // Log invalid password
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials!"));
        }
    }

    //Display 
    @GetMapping("/user")
    List<UserModel> getAllUsers() {
        System.out.println("Fetching all users"); // Log fetching all users
        // Fetch all users from the repository
        return userRepository.findAll();
    }

    @GetMapping("/user/{id}")
    UserModel getUserId(@PathVariable String id) {
        System.out.println("Fetching user with ID: " + id); // Log fetching user by ID
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    //update profile
    @PutMapping("/user/{id}")
    UserModel updateProfile(@RequestBody UserModel newUserModel, @PathVariable String id) {
        System.out.println("Updating profile for user ID: " + id); // Log updating profile
        return userRepository.findById(id)
                .map(userModel -> {
                    userModel.setFullname(newUserModel.getFullname());
                    userModel.setEmail(newUserModel.getEmail());
                    userModel.setPassword(newUserModel.getPassword());
                    userModel.setPhone(newUserModel.getPhone());
                    userModel.setProfilePicturePath(newUserModel.getProfilePicturePath());
                    userModel.setSkills(newUserModel.getSkills()); // Update skills
                    userModel.setBio(newUserModel.getBio()); // Update bio
                    
                    // Update postOwnerName in all related posts
                    List<LearningPlanModel> userPosts = learningPlanRepository.findByPostOwnerID(id);
                    System.out.println("Updating fullname in " + userPosts.size() + " user posts."); // Log the number of posts updated
                    userPosts.forEach(post -> {
                        post.setPostOwnerName(newUserModel.getFullname());
                        learningPlanRepository.save(post);
                    });
                    
                    return userRepository.save(userModel);
                }).orElseThrow(() -> new UserNotFoundException(id));
    }

    @PutMapping("/user/{id}/uploadProfilePicture")
    public ResponseEntity<?> uploadProfilePicture(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        return userRepository.findById(id).map(user -> {
            try {
                // Resolve the upload directory as an absolute path
                File uploadDir = new File(System.getProperty("user.dir"), PROFILE_UPLOAD_DIR);

                // Ensure the upload directory exists
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }

                // Generate a unique file name
                String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
                String uniqueFileName = System.currentTimeMillis() + "_" + UUID.randomUUID() + "." + extension;

                // Save the file to the upload directory
                Path filePath = uploadDir.toPath().resolve(uniqueFileName);
                Files.copy(file.getInputStream(), filePath);

                // Save only the file name in the database
                user.setProfilePicturePath(uniqueFileName);
                userRepository.save(user);

                return ResponseEntity.ok(Map.of("message", "Profile picture uploaded successfully."));
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to upload profile picture."));
            }
        }).orElseThrow(() -> new UserNotFoundException("User not found: " + id));
    }

    @GetMapping("/uploads/profile/{fileName}")
    public ResponseEntity<Resource> getProfilePicture(@PathVariable String fileName) {
        try {
            // Resolve the upload directory as an absolute path
            File uploadDir = new File(System.getProperty("user.dir"), PROFILE_UPLOAD_DIR);
            Path filePath = uploadDir.toPath().resolve(fileName);

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //delete profile
    @DeleteMapping("/user/{id}")
    public ResponseEntity<?> deleteProfile(@PathVariable String id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException(id);
        }

        // Delete user-related data
        userRepository.findById(id).ifPresent(user -> {
            // Delete user's posts
            achievementsRepository.deleteByPostOwnerID(id);
            learningPlanRepository.deleteByPostOwnerID(id);
            postManagementRepository.deleteByUserID(id); // Delete user's posts
            notificationRepository.deleteByUserId(id);

            // Remove user from followers and following lists
            userRepository.findAll().forEach(otherUser -> {
                otherUser.getFollowedUsers().remove(id);
                userRepository.save(otherUser);
            });
        });

        // Delete the user account
        userRepository.deleteById(id);

        return ResponseEntity.ok(Map.of("message", "User account and related data deleted successfully."));
    }

    // check email
    @GetMapping("/checkEmail")
    public boolean checkEmailExists(@RequestParam String email) {
        return userRepository.existsByEmail(email);
    }

    //follow user
    @PutMapping("/user/{userID}/follow")
    public ResponseEntity<?> followUser(@PathVariable String userID, @RequestBody Map<String, String> request) {
        String followUserID = request.get("followUserID");
        return userRepository.findById(userID).map(user -> {
            user.getFollowedUsers().add(followUserID);
            userRepository.save(user);

            // Create a notification for the followed user
            String followerFullName = userRepository.findById(userID)
                    .map(follower -> follower.getFullname())
                    .orElse("Someone");
            String message = String.format("%s started following you.", followerFullName);
            String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            NotificationModel notification = new NotificationModel(followUserID, message, false, currentDateTime);
            notificationRepository.save(notification);

            return ResponseEntity.ok(Map.of("message", "User followed successfully"));
        }).orElseThrow(() -> new UserNotFoundException("User not found: " + userID));
    }

    //unfollow user
    @PutMapping("/user/{userID}/unfollow")
    public ResponseEntity<?> unfollowUser(@PathVariable String userID, @RequestBody Map<String, String> request) {
        String unfollowUserID = request.get("unfollowUserID");
        return userRepository.findById(userID).map(user -> {
            user.getFollowedUsers().remove(unfollowUserID);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "User unfollowed successfully"));
        }).orElseThrow(() -> new UserNotFoundException("User not found: " + userID));
    }

    // Get followed users
    @GetMapping("/user/{userID}/followedUsers")
    public List<String> getFollowedUsers(@PathVariable String userID) {
        return userRepository.findById(userID)
                .map(user -> new ArrayList<>(user.getFollowedUsers())) // Convert Set to List
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userID));
    }

    // email verification code issue persists. user added to database before email is verified------------------------------
    @PostMapping("/sendVerificationCode")
    public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, String> request) {
        System.out.println("\n\nEndpoint /sendVerificationCode called.\n\n"); // Log endpoint usage
        String email = request.get("email");
        String code = request.get("code");

        if (email == null || code == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Email and code are required."));
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Your Verification Code");
            message.setText("Your verification code is: " + code);
            mailSender.send(message);

            return ResponseEntity.ok(Map.of("message", "Verification code sent successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to send verification code."));
        }
    }


    // below is the new code to fix the email verification issue:----------------------------------------------------
    // @PostMapping("/sendVerificationCode")
    // public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, String> request) {
    //     System.out.println("\n\nEndpoint /verifyOtp (/sendVerificationCode) called for OTP verification.\n\n"); // Log endpoint usage
    //     String email = request.get("email") != null ? request.get("email").trim() : null;
    //     String code = request.get("code") != null ? request.get("code").trim() : null;
    
    //     if (email == null) {
    //         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Email is required."));
    //     }
    
    //     // Check if OTP is provided (verification step)
    //     if (code != null) {
    //         System.out.println("Verifying OTP for email: " + email + ", OTP: " + code);
    
    //         UserModel user = temporaryUserStorage.get(email);
    //         if (user == null) {
    //             System.out.println("User not found in temporary storage for email: " + email);
    //             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found or OTP expired."));
    //         }
    
    //         System.out.println("Stored OTP for email: " + email + " is: " + user.getOtp());
    
    //         if (user.getOtp().equals(code)) {
    //             user.setVerified(true); // Mark user as verified
    //             user.setOtp(null); // Clear OTP
    
    //             try {
    //                 System.out.println("Attempting to save user to database: " + user);
    //                 userRepository.save(user); // Save user to the database
    //                 temporaryUserStorage.remove(email); // Remove from temporary storage
    //                 System.out.println("User saved to database: " + user.getEmail());
    //                 return ResponseEntity.ok(Map.of("message", "Email verified successfully!"));
    //             } catch (Exception e) {
    //                 System.out.println("Error saving user to database: " + e.getMessage());
    //                 return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to save user to database."));
    //             }
    //         } else {
    //             System.out.println("Invalid OTP for email: " + email);
    //             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid OTP."));
    //         }
    //     }
    
    //     // If OTP is not provided, generate and send a new OTP (registration step)
    //     String generatedOtp = generateOtp();
    //     UserModel user = temporaryUserStorage.get(email);
    //     if (user == null) {
    //         return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found in temporary storage."));
    //     }
    
    //     user.setOtp(generatedOtp);
    //     try {
    //         sendOtpEmail(email, generatedOtp);
    //         System.out.println("OTP sent to email: " + email + ", OTP: " + generatedOtp);
    //         return ResponseEntity.ok(Map.of("message", "OTP sent to your email. Please verify to complete registration."));
    //     } catch (Exception e) {
    //         System.out.println("Error sending OTP: " + e.getMessage());
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to send OTP."));
    //     }
    // }
}
