package backend.repository;

import backend.model.CoursesModel;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CoursesRepository extends MongoRepository<CoursesModel, String>{
    void deleteByCourseId(String courseId);
}
