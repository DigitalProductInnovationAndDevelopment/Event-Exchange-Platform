package com.itestra.eep.webcontroller;

import com.itestra.eep.models.FileEntity;
import com.itestra.eep.services.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin
@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/files")
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file,
                                             @RequestParam("eventId") UUID eventId) {
        try {
            fileService.storeFile(file, eventId);
            return ResponseEntity.ok("File uploaded successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading file");
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Boolean> deleteFile(@PathVariable UUID id) {
        fileService.deleteFile(id);
        return ResponseEntity.ok(true);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@fileSecurity.canDownloadFile(#id, authentication)")
    public ResponseEntity<byte[]> downloadFile(@PathVariable UUID id) {

        Optional<FileEntity> fileOptional = fileService.getFile(id);

        if (fileOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        FileEntity fileEntity = fileOptional.get();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + id + "\"")
                .body(fileEntity.getContent());
    }


}
