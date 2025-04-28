package backend.model;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "Courses")
public class CoursesModel {
    @Id
    @GeneratedValue
    private String id;

    private String courseID;
    private String title;
    private String description;
    private List<String> tags;
    private String courseImageUrl;
    private String creatorID;
    private String createdDateTime;
    private LocalDateTime lastUpdatedDateTime;
    private List<Topic> topics;

    // Getters and Setters
    public CoursesModel() {}

    public CoursesModel(String id, String courseID, String title, String description, List<String> tags, String courseImageUrl, String creatorID, String createdDateTime, List<Topic> topics) {
        this.id = id;
        this.courseID = courseID;
        this.title = title;
        this.description = description;
        this.tags = tags;
        this.courseImageUrl = courseImageUrl;
        this.creatorID = creatorID;
        this.createdDateTime = createdDateTime;
        this.lastUpdatedDateTime = LocalDateTime.now();
        this.topics = topics;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCourseID() { return courseID; }
    public void setCourseID(String courseID) { this.courseID = courseID; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getCourseImageUrl() { return courseImageUrl; }
    public void setCourseImageUrl(String courseImageUrl) { this.courseImageUrl = courseImageUrl; }

    public String getCreatorID() { return creatorID; }
    public void setCreatorID(String creatorID) { this.creatorID = creatorID; }

    public String getCreatedDateTime() { return createdDateTime; }
    public void setCreatedDateTime(String createdDateTime) { this.createdDateTime = createdDateTime; }

    public LocalDateTime getLastUpdatedDateTime() { return lastUpdatedDateTime; }
    public void setLastUpdatedDateTime(LocalDateTime lastUpdatedDateTime) { this.lastUpdatedDateTime = lastUpdatedDateTime; }

    public List<Topic> getTopics() { return topics; }
    public void setTopics(List<Topic> topics) { this.topics = topics; }

    public static class Topic {
        private String id;
        private String title;
        private List<SubTopic> subTopics;

        // Getters and Setters
        public Topic() {}

        public Topic(String id, String title, List<SubTopic> subTopics) {
            this.id = id;
            this.title = title;
            this.subTopics = subTopics;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public List<SubTopic> getSubTopics() { return subTopics; }
        public void setSubTopics(List<SubTopic> subTopics) { this.subTopics = subTopics; }
    }

    public static class SubTopic {
        private String id;
        private String title;
        private List<Content> contents;

        // Getters and Setters
        public SubTopic() {}

        public SubTopic(String id, String title, List<Content> contents) {
            this.id = id;
            this.title = title;
            this.contents = contents;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public List<Content> getContents() { return contents; }
        public void setContents(List<Content> contents) { this.contents = contents; }
    }

    public static class Content {
        private String id;
        private String type; // text, image, or video
        private String data; // text content or S3 URL

        // Getters and Setters
        public Content() {}

        public Content(String id, String type, String data) {
            this.id = id;
            this.type = type;
            this.data = data;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getData() { return data; }
        public void setData(String data) { this.data = data; }
    }
}