package backend.controller;

import backend.model.CoursesModel;
import backend.repository.CoursesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin("http://localhost:3000")
public class CoursesController {
    @Autowired
    private CoursesRepository coursesRepository;
    private final Path root = Paths.get("uploads/courses");

    @PostMapping("/courses")
    public CoursesModel newCoursesModel(@RequestBody CoursesModel newCoursesModel) {
        return coursesRepository.save(newCoursesModel);
    }

    @PostMapping("/courses/upload")
    public String uploadCourseImage(@RequestParam("file") MultipartFile file) {
        try {
            String extension = file.getOriginalFilename()
                    .substring(file.getOriginalFilename().lastIndexOf("."));
            String filename = UUID.randomUUID() + extension;
            Files.copy(file.getInputStream(), this.root.resolve(filename));
            return filename; // Returns just the random filename
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }

    @GetMapping("/courses")
    List<CoursesModel> getAll() {return coursesRepository.findAll();}
}
