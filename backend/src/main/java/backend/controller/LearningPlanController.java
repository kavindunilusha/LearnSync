package backend.controller;

import backend.exception.LearningPlanNotFoundException;
import backend.exception.UserNotFoundException;
import backend.model.LearningPlanModel;
import backend.model.NotificationModel;
import backend.repository.LearningPlanRepository;
import backend.repository.NotificationRepository;
import backend.repository.UserRepository;
import backend.service.AWSService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin("http://localhost:3000")
public class LearningPlanController {
    @Autowired
    private LearningPlanRepository learningPlanRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AWSService awsService;

    private final Path root = Paths.get("uploads/plan");
    private final String S3_FOLDER_PATH = "learningPlans/";

    //Insert function
    @PostMapping("/learningPlan")
    public LearningPlanModel newLearningSystemModel(@RequestBody LearningPlanModel newLearningPlanModel) {
        System.out.println("Received data: " + newLearningPlanModel); // Debugging line
        if (newLearningPlanModel.getPostOwnerID() == null || newLearningPlanModel.getPostOwnerID().isEmpty()) {
            throw new IllegalArgumentException("PostOwnerID is required."); // Ensure postOwnerID is provided
        }
        // Fetch user's full name from UserRepository
        String postOwnerName = userRepository.findById(newLearningPlanModel.getPostOwnerID())
                .map(user -> user.getFullname())
                .orElseThrow(() -> new UserNotFoundException("User not found for ID: " + newLearningPlanModel.getPostOwnerID()));
        newLearningPlanModel.setPostOwnerName(postOwnerName);

        // Set current date and time
        String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        newLearningPlanModel.setCreatedAt(currentDateTime);

        return learningPlanRepository.save(newLearningPlanModel);
    }

    @PostMapping("/learningPlan/planUpload")
    public String uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String extension = file.getOriginalFilename()
                    .substring(file.getOriginalFilename().lastIndexOf("."));
            String filename = UUID.randomUUID() + extension;

            // Upload to S3 bucket using the folder path + generated filename
            String s3Key = S3_FOLDER_PATH + filename;
            String s3Url = awsService.upload(file, s3Key);

            return s3Url; // Return the full S3 URL directly from the service
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }

    @PostMapping("/learningPlan/with-image")
    public LearningPlanModel createLearningPlanWithImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("contentURL") String contentURL,
            @RequestParam("tags") List<String> tags,
            @RequestParam("postOwnerID") String postOwnerID,
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate,
            @RequestParam("category") String category,
            @RequestParam(value = "templateID", required = false) int templateID) {

        try {
            // Upload image to S3
            String extension = file.getOriginalFilename()
                    .substring(file.getOriginalFilename().lastIndexOf("."));
            String filename = UUID.randomUUID() + extension;

            // Upload to S3 bucket and get URL directly
            String s3Key = S3_FOLDER_PATH + filename;
            String s3Url = awsService.upload(file, s3Key);

            // Fetch user's full name from UserRepository
            String postOwnerName = userRepository.findById(postOwnerID)
                    .map(user -> user.getFullname())
                    .orElseThrow(() -> new UserNotFoundException("User not found for ID: " + postOwnerID));

            // Set current date and time
            String currentDateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

            // Create and save learning plan with S3 image URL
            LearningPlanModel learningPlan = new LearningPlanModel();
            learningPlan.setTitle(title);
            learningPlan.setDescription(description);
            learningPlan.setContentURL(contentURL);
            learningPlan.setTags(tags);
            learningPlan.setPostOwnerID(postOwnerID);
            learningPlan.setPostOwnerName(postOwnerName);
            learningPlan.setStartDate(startDate);
            learningPlan.setEndDate(endDate);
            learningPlan.setCategory(category);
            learningPlan.setTemplateID(templateID);
            learningPlan.setImageUrl(s3Url);
            learningPlan.setCreatedAt(currentDateTime);

            return learningPlanRepository.save(learningPlan);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create learning plan with image: " + e.getMessage());
        }
    }

    @GetMapping("/learningPlan")
    List<LearningPlanModel> getAll() {
        List<LearningPlanModel> posts = learningPlanRepository.findAll();
        posts.forEach(post -> {
            if (post.getPostOwnerID() != null) {
                String postOwnerName = userRepository.findById(post.getPostOwnerID())
                        .map(user -> user.getFullname())
                        .orElse("Unknown User");
                post.setPostOwnerName(postOwnerName);
            }
        });
        return posts;
    }

    @GetMapping("/learningPlan/{id}")
    LearningPlanModel getById(@PathVariable String id) {
        LearningPlanModel post = learningPlanRepository.findById(id)
                .orElseThrow(() -> new LearningPlanNotFoundException(id));
        if (post.getPostOwnerID() != null) {
            String postOwnerName = userRepository.findById(post.getPostOwnerID())
                    .map(user -> user.getFullname())
                    .orElse("Unknown User");
            post.setPostOwnerName(postOwnerName);
        }
        return post;
    }

    @PutMapping("/learningPlan/{id}")
    LearningPlanModel update(@RequestBody LearningPlanModel newLearningPlanModel, @PathVariable String id) {
        return learningPlanRepository.findById(id)
                .map(learningPlanModel -> {
                    learningPlanModel.setTitle(newLearningPlanModel.getTitle());
                    learningPlanModel.setDescription(newLearningPlanModel.getDescription());
                    learningPlanModel.setContentURL(newLearningPlanModel.getContentURL());
                    learningPlanModel.setTags(newLearningPlanModel.getTags());
                    learningPlanModel.setImageUrl(newLearningPlanModel.getImageUrl());
                    learningPlanModel.setStartDate(newLearningPlanModel.getStartDate()); // Update startDate
                    learningPlanModel.setEndDate(newLearningPlanModel.getEndDate());     // Update endDate
                    learningPlanModel.setCategory(newLearningPlanModel.getCategory());  // Update category

                    if (newLearningPlanModel.getPostOwnerID() != null && !newLearningPlanModel.getPostOwnerID().isEmpty()) {
                        learningPlanModel.setPostOwnerID(newLearningPlanModel.getPostOwnerID());
                        // Fetch and update the real name of the post owner
                        String postOwnerName = userRepository.findById(newLearningPlanModel.getPostOwnerID())
                                .map(user -> user.getFullname())
                                .orElseThrow(() -> new UserNotFoundException("User not found for ID: " + newLearningPlanModel.getPostOwnerID()));
                        learningPlanModel.setPostOwnerName(postOwnerName);
                    }

                    learningPlanModel.setTemplateID(newLearningPlanModel.getTemplateID()); // Update templateID
                    return learningPlanRepository.save(learningPlanModel);
                }).orElseThrow(() -> new LearningPlanNotFoundException(id));
    }

    @PutMapping("/learningPlan/{id}/update-image")
    public LearningPlanModel updateLearningPlanImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {

        return learningPlanRepository.findById(id)
                .map(learningPlanModel -> {
                    try {
                        // Get the previous image URL to extract the key for deletion later if needed
                        String previousUrl = learningPlanModel.getImageUrl();

                        // Upload new image to S3
                        String extension = file.getOriginalFilename()
                                .substring(file.getOriginalFilename().lastIndexOf("."));
                        String filename = UUID.randomUUID() + extension;

                        // Upload to S3 bucket and get URL directly
                        String s3Key = S3_FOLDER_PATH + filename;
                        String s3Url = awsService.upload(file, s3Key);

                        // Update learning plan with new S3 image URL
                        learningPlanModel.setImageUrl(s3Url);

                        // Option: Delete the previous image file from S3 if it exists
                        // This would require parsing the previous URL to get the key
                        // You could implement this if needed

                        return learningPlanRepository.save(learningPlanModel);
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to update learning plan image: " + e.getMessage());
                    }
                }).orElseThrow(() -> new LearningPlanNotFoundException(id));
    }

    //Delete function
    @DeleteMapping("/learningPlan/{id}")
    public void delete(@PathVariable String id) {
        learningPlanRepository.deleteById(id);
    }

    @GetMapping("/learningPlan/planImages/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path file = root.resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("Error loading image: " + e.getMessage());
        }
    }

    @Scheduled(cron = "0 0 0 * * ?") // Runs daily at midnight
    public void sendExpiryNotifications() {
        List<LearningPlanModel> plans = learningPlanRepository.findAll();
        String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        plans.forEach(plan -> {
            if (plan.getEndDate() != null && plan.getPostOwnerID() != null) {
                try {
                    LocalDateTime endDate = LocalDateTime.parse(plan.getEndDate(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                    LocalDateTime threeDaysBefore = endDate.minusDays(3);

                    if (threeDaysBefore.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")).equals(currentDate)) {
                        // Check if  notification already exists for this plan and user
                        boolean notificationExists = notificationRepository.findByUserId(plan.getPostOwnerID())
                                .stream()
                                .anyMatch(notification -> notification.getMessage().contains(plan.getTitle()));

                        if (!notificationExists) {
                            NotificationModel notification = new NotificationModel();
                            notification.setUserId(plan.getPostOwnerID());
                            notification.setMessage("Your learning plan \"" + plan.getTitle() + "\" will expire soon.");
                            notification.setCreatedAt(currentDate);
                            notification.setRead(false);
                            notificationRepository.save(notification);
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error processing plan with ID: " + plan.getId() + ". Error: " + e.getMessage());
                }
            }
        });
    }
}