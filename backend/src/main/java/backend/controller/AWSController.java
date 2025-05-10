package backend.controller;

import backend.service.AWSService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLConnection;

@RestController("/app")
public class AWSController {
    @Autowired
    AWSService service;

    @PostMapping("/upload")
    public String upload(@RequestParam("file")MultipartFile file,
                         @RequestParam(value = "path", required = false, defaultValue = "") String path) throws Exception {
        service.upload(file, path);
        return "File Uploaded Successfully";
    }


    @GetMapping(value = "/download")
    public ResponseEntity<Resource> downloadFile(@RequestParam("filename") String filename,
                                                 @RequestParam(value = "path", required = false, defaultValue = "") String path) {
        try {
            Resource resource = service.download(filename, path);

            // Determine content type
            String contentType = "application/octet-stream";
            try {
                contentType = URLConnection.guessContentTypeFromName(resource.getFilename());
            } catch (Exception e) {
                // Use default content type if type cannot be determined
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
