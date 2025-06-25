package com.itestra.eep.webcontroller;

import com.itestra.eep.dtos.FileDetailsDTO;
import com.itestra.eep.mappers.EventMapper;
import com.itestra.eep.models.FileEntity;
import com.itestra.eep.services.FileService;
import com.itestra.eep.services.SchematicsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@CrossOrigin
@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/files")
public class FileController {

    private final FileService fileService;
    private final SchematicsService schematicsService;
    private final EventMapper eventMapper;

    @PostMapping("/upload")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<FileDetailsDTO> uploadFile(@RequestParam("file") MultipartFile file,
                                                     @RequestParam(value = "eventId", required = false) UUID eventId,
                                                     @RequestParam(value = "schematicsId", required = false) UUID schematicsId) throws IOException {

        if (eventId != null) {
            FileEntity savedFile = fileService.storeFile(file, eventId);
            return new ResponseEntity<>(eventMapper.toFileDetailsDto(savedFile), HttpStatus.OK);
        } else if (schematicsId != null) {
            schematicsService.updateSchematicOverview(schematicsId, file);
            return new ResponseEntity<>(null, HttpStatus.OK);
        }
        return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);

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

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setCacheControl(CacheControl.maxAge(1, TimeUnit.HOURS));

        return new ResponseEntity<>(fileEntity.getContent(), headers, HttpStatus.OK);
    }


}
