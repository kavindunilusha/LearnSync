package backend.service;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.S3Object;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
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

    public void upload(MultipartFile file, String path) throws AmazonServiceException, SdkClientException, IOException {

        String fileName = file.getOriginalFilename();
        // String key = (path != null && !path.isEmpty()) ? path + "/" + fileName : fileName;
        if (path != null && !path.trim().isEmpty()) {
            path = path.replaceAll("/+$", ""); // remove trailing slashes
            fileName = path + "/" + fileName; // build the full S3 key
        }

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());

        //amazonS3.putObject(bucketName, key, file.getInputStream(), metadata);
        amazonS3.putObject(bucketName, fileName, file.getInputStream(), metadata);
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
}
