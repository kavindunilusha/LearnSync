package backend.repository;

import backend.model.PostManagementModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostManagementRepository extends MongoRepository<PostManagementModel, String> {
    void deleteByUserID(String userID); // Ensure this method exists
}
