package com.itestra.eep.webcontroller;

import com.itestra.eep.dtos.SchematicsCreateDTO;
import com.itestra.eep.dtos.SchematicsDetailsDTO;
import com.itestra.eep.dtos.SchematicsUpdateDTO;
import com.itestra.eep.mappers.SchematicsMapper;
import com.itestra.eep.models.Schematics;
import com.itestra.eep.services.SchematicsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;


@CrossOrigin
@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/schematics")
public class SchematicsController {

    private final SchematicsService schematicsService;
    private final SchematicsMapper schematicsMapper;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<SchematicsCreateDTO> getSchematics(@PathVariable UUID id) {
        Schematics schematics = schematicsService.findById(id);
        return new ResponseEntity<>(schematicsMapper.toSchematicsCreateDTO(schematics), HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<SchematicsDetailsDTO> createSchematics(@RequestBody @Valid SchematicsCreateDTO dto) {
        Schematics schematics = schematicsService.create(dto);
        return new ResponseEntity<>(schematicsMapper.toSchematicsDetailsDTO(schematics), HttpStatus.OK);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<SchematicsDetailsDTO> updateSchematics(@PathVariable UUID id,
                                                                 @RequestBody @Valid SchematicsUpdateDTO dto) {
        Schematics schematics = schematicsService.update(id, dto);
        return new ResponseEntity<>(schematicsMapper.toSchematicsDetailsDTO(schematics), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Boolean> deleteProject(@PathVariable UUID id) {
        schematicsService.delete(id);
        return ResponseEntity.ok(true);
    }

}
