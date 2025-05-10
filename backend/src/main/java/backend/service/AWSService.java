package backend.service;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.S3Object;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
public class AWSService {
    @Autowired
    private AmazonS3 amazonS3;

    @Value("${aws.s3.bucket.name}")
    private String bucketName;

    /**
     * Uploads a file to the specified path in the S3 bucket
     * @param file The file to upload
     * @param path The path within the bucket (can be file name or path/filename)
     * @return The URL of the uploaded file
     */
    public String upload(MultipartFile file, String path) throws AmazonServiceException, SdkClientException, IOException {
        String key = path;

        if (path == null || path.trim().isEmpty()) {
            key = file.getOriginalFilename();
        }

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType());

        amazonS3.putObject(bucketName, key, file.getInputStream(), metadata);

        // Return the S3 URL of the uploaded file
        return amazonS3.getUrl(bucketName, key).toString();
    }

    public Resource download(String filename, String path) throws IOException {
        String key = filename;

        if (path != null && !path.trim().isEmpty()) {
            path = path.replaceAll("/+$", ""); // remove trailing slashes
            key = path + "/" + filename;
        }

        S3Object s3Object = amazonS3.getObject(bucketName, key);
        try (InputStream inputStream = s3Object.getObjectContent()) {
            // Read the entire file into a byte array
            byte[] bytes = inputStream.readAllBytes();

            // Return a ByteArrayResource with filename override
            return new ByteArrayResource(bytes) {
                @Override
                public String getFilename() {
                    return filename;
                }
            };
        }
    }

    /**
     * Deletes a file from the S3 bucket
     * @param key The key (path/filename) of the file to delete
     */
    public void deleteFile(String key) {
        if (key != null && !key.isEmpty()) {
            amazonS3.deleteObject(bucketName, key);
        }
    }

    /**
     * Gets the publicly accessible URL for a file in S3
     * @param key The key (path/filename) of the file
     * @return The public URL
     */
    public String getFileUrl(String key) {
        return amazonS3.getUrl(bucketName, key).toString();
    }
}