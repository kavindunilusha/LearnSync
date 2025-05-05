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

@Service
public class AWSService {
    @Autowired
    private AmazonS3 amazonS3;

    @Value("${aws.s3.bucket.name}")
    private String bucketName;

    public String upload(MultipartFile file) throws AmazonServiceException, SdkClientException, IOException {

        ObjectMetadata metadata = new ObjectMetadata();
        amazonS3.putObject(bucketName, file.getName(), file.getInputStream(), metadata);
        return "File Uploaded Successfully";
    }

    public Resource download(String filename) throws IOException {
        S3Object s3Object = amazonS3.getObject(bucketName, filename);
        var bytes = s3Object.getObjectContent().readAllBytes();
        Resource resource = new ByteArrayResource(bytes);
        return resource;
    }
}
