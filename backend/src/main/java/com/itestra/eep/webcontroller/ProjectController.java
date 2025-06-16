package com.itestra.eep.webcontroller;

import com.itestra.eep.dtos.ProjectCreateDTO;
import com.itestra.eep.dtos.ProjectUpdateDTO;
import com.itestra.eep.mappers.ProjectMapper;
import com.itestra.eep.models.Project;
import com.itestra.eep.services.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@CrossOrigin
@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectMapper projectMapper;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'EMPLOYEE', 'VISITOR')")
    public ResponseEntity<ProjectCreateDTO> getProject(@PathVariable UUID id) {
        Project project = projectService.findById(id);
        return new ResponseEntity<>(projectMapper.toDto(project), HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ProjectCreateDTO> createProject(@RequestBody @Valid ProjectCreateDTO projectCreateDTO) {
        Project project = projectService.create(projectCreateDTO);
        return new ResponseEntity<>(projectMapper.toDto(project), HttpStatus.OK);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ProjectCreateDTO> updateProject(@PathVariable UUID id, @RequestBody @Valid ProjectUpdateDTO projectUpdateDTO) {
        Project updatedProject = projectService.update(id, projectUpdateDTO);
        return new ResponseEntity<>(projectMapper.toDto(updatedProject), HttpStatus.OK);

    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Boolean> deleteProject(@PathVariable UUID id) {
        projectService.delete(id);
        return ResponseEntity.ok(true);

    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ProjectCreateDTO> addMembersToProject(@PathVariable UUID id, @RequestBody List<UUID> membersList) {
        Project updatedProject = projectService.addMembersToProject(id, membersList);
        return new ResponseEntity<>(projectMapper.toDto(updatedProject), HttpStatus.OK);

    }

    @PostMapping("/{id}/members/remove")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ProjectCreateDTO> removeMembersFromProject(@PathVariable UUID id, @RequestBody List<UUID> membersList) {
        Project updatedProject = projectService.removeMembersFromProject(id, membersList);
        return new ResponseEntity<>(projectMapper.toDto(updatedProject), HttpStatus.OK);
    }


}
