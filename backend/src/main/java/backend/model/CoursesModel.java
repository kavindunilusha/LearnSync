package backend.model;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "Courses")
public class CoursesModel {
    @Id
    @GeneratedValue
    private String id;
    private String title;
    private String description;
    private String category;
    private String courseImageUrl;
    private String creatorID;
    private String createdDate;
    private String lastUpdatedDate;

    public CoursesModel() {}

    public CoursesModel(String id, String title, String description, String category, String courseImageUrl, String creatorID, String createdDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.courseImageUrl = courseImageUrl;
        this.creatorID = creatorID;
        this.createdDate = createdDate;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getCourseImageUrl() { return courseImageUrl; }
    public void setCourseImageUrl(String courseImageUrl) { this.courseImageUrl = courseImageUrl; }

    public String getCreatorID() { return creatorID; }
    public void setCreatorID(String creatorID) { this.creatorID = creatorID; }

    public String getCreatedDate() { return createdDate; }
    public void setCreatedDate(String createdDate) { this.createdDate = createdDate; }

    public String getLastUpdatedDate() { return lastUpdatedDate; }
    public void setLastUpdatedDate(String lastUpdatedDate) { this.lastUpdatedDate = lastUpdatedDate; }
}