package backend.controller;

import backend.exception.AchievementsNotFoundException;
import backend.model.AchievementsModel;
import backend.repository.AchievementsRepository;
import backend.service.AWSService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin("http://localhost:3000")
public class AchievementsController {
    @Autowired
    private AchievementsRepository achievementsRepository;

    @Autowired
    private AWSService awsService;

    private final Path root = Paths.get("uploads/progressUpdate");
    private final String S3_FOLDER_PATH = "learningProgressUpdates/";

    //Insert
    @PostMapping("/achievements")
    public AchievementsModel newAchievementsModel(@RequestBody AchievementsModel newAchievementsModel) {
        return achievementsRepository.save(newAchievementsModel);
    }

    @PostMapping("/achievements/upload")
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

    @PostMapping("/achievements/with-image")
    public AchievementsModel createAchievementWithImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("postOwnerID") String postOwnerID,
            @RequestParam("postOwnerName") String postOwnerName,
            @RequestParam("date") String date,
            @RequestParam("category") String category) {

        try {
            // Upload image to S3
            String extension = file.getOriginalFilename()
                    .substring(file.getOriginalFilename().lastIndexOf("."));
            String filename = UUID.randomUUID() + extension;

            // Upload to S3 bucket and get URL directly
            String s3Key = S3_FOLDER_PATH + filename;
            String s3Url = awsService.upload(file, s3Key);

            // Create and save achievement with S3 image URL
            AchievementsModel achievement = new AchievementsModel();
            achievement.setTitle(title);
            achievement.setDescription(description);
            achievement.setPostOwnerID(postOwnerID);
            achievement.setPostOwnerName(postOwnerName);
            achievement.setDate(date);
            achievement.setCategory(category);
            achievement.setImageUrl(s3Url);

            return achievementsRepository.save(achievement);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create achievement with image: " + e.getMessage());
        }
    }

    @GetMapping("/achievements")
    List<AchievementsModel> getAll() {
        return achievementsRepository.findAll();
    }

    @GetMapping("/achievements/{id}")
    AchievementsModel getById(@PathVariable String id) {
        return achievementsRepository.findById(id)
                .orElseThrow(() -> new AchievementsNotFoundException(id));
    }

    @PutMapping("/achievements/{id}")
    AchievementsModel update(@RequestBody AchievementsModel newAchievementsModel, @PathVariable String id) {
        return achievementsRepository.findById(id)
                .map(achievementsModel -> {
                    achievementsModel.setTitle(newAchievementsModel.getTitle());
                    achievementsModel.setDescription(newAchievementsModel.getDescription());
                    achievementsModel.setPostOwnerID(newAchievementsModel.getPostOwnerID());
                    achievementsModel.setPostOwnerName(newAchievementsModel.getPostOwnerName());
                    achievementsModel.setDate(newAchievementsModel.getDate());
                    achievementsModel.setCategory(newAchievementsModel.getCategory());
                    achievementsModel.setImageUrl(newAchievementsModel.getImageUrl());
                    return achievementsRepository.save(achievementsModel);
                }).orElseThrow(() -> new AchievementsNotFoundException(id));
    }

    @PutMapping("/achievements/{id}/update-image")
    public AchievementsModel updateAchievementImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {

        return achievementsRepository.findById(id)
                .map(achievementsModel -> {
                    try {
                        // Get the previous image URL to extract the key for deletion later if needed
                        String previousUrl = achievementsModel.getImageUrl();

                        // Upload new image to S3
                        String extension = file.getOriginalFilename()
                                .substring(file.getOriginalFilename().lastIndexOf("."));
                        String filename = UUID.randomUUID() + extension;

                        // Upload to S3 bucket and get URL directly
                        String s3Key = S3_FOLDER_PATH + filename;
                        String s3Url = awsService.upload(file, s3Key);

                        // Update achievement with new S3 image URL
                        achievementsModel.setImageUrl(s3Url);

                        // Option: Delete the previous image file from S3 if it exists
                        // This would require parsing the previous URL to get the key
                        // You could implement this if needed

                        return achievementsRepository.save(achievementsModel);
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to update achievement image: " + e.getMessage());
                    }
                }).orElseThrow(() -> new AchievementsNotFoundException(id));
    }

    @DeleteMapping("/achievements/{id}")
    public void delete(@PathVariable String id) {
        achievementsRepository.deleteById(id);
    }

    @GetMapping("/achievements/images/{filename:.+}")
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
}