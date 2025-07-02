package com.itestra.eep.services;

import com.itestra.eep.dtos.ProjectCreateDTO;
import com.itestra.eep.dtos.ProjectUpdateDTO;
import com.itestra.eep.mappers.ProjectMapper;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.Project;
import com.itestra.eep.repositories.EmployeeRepository;
import com.itestra.eep.repositories.ProjectRepository;
import com.itestra.eep.services.impl.ProjectServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;


//TODO
class ProjectServiceTest {
    @Mock private ProjectRepository projectRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private ProjectMapper projectMapper;
    @InjectMocks private ProjectServiceImpl projectService;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void testFindByIdReturnsProject() {
        UUID id = UUID.randomUUID();
        Project project = new Project();
        when(projectRepository.findById(id)).thenReturn(Optional.of(project));
        assertEquals(project, projectService.findById(id));
    }

    @Test
    void testCreateProject() {
        ProjectCreateDTO dto = mock(ProjectCreateDTO.class);
        Project project = new Project();
        doNothing().when(projectMapper).createProjectFromDto(dto, project);
        when(projectRepository.save(any(Project.class))).thenReturn(project);
        Project result = projectService.create(dto);
        assertNotNull(result);
    }

    @Test
    void testUpdateProject() {
        UUID id = UUID.randomUUID();
        ProjectUpdateDTO dto = mock(ProjectUpdateDTO.class);
        Project project = new Project();
        when(projectRepository.findById(id)).thenReturn(Optional.of(project));
        doNothing().when(projectMapper).updateProjectFromDto(dto, project);
        when(projectRepository.save(any(Project.class))).thenReturn(project);
        Project result = projectService.update(id, dto);
        assertNotNull(result);
    }

    @Test
    void testDeleteProject() {
        UUID id = UUID.randomUUID();
        doNothing().when(projectRepository).deleteById(id);
        projectService.delete(id);
        verify(projectRepository).deleteById(id);
    }

    @Test
    void testAddMembersToProject() {
        UUID projectId = UUID.randomUUID();
        List<UUID> memberIds = Arrays.asList(UUID.randomUUID(), UUID.randomUUID());
        Project project = new Project();
        Set<Employee> employees = new HashSet<>();
        project.setEmployees(employees);
        List<Employee> employeesToAdd = Arrays.asList(new Employee(), new Employee());
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(employeeRepository.findByIdIn(memberIds)).thenReturn(employeesToAdd);
        when(projectRepository.save(any(Project.class))).thenReturn(project);
        Project result = projectService.addMembersToProject(projectId, memberIds);
        assertNotNull(result);
        assertEquals(2, result.getEmployees().size());
    }

    @Test
    void testRemoveMembersFromProject() {
        UUID projectId = UUID.randomUUID();
        List<UUID> memberIds = Arrays.asList(UUID.randomUUID(), UUID.randomUUID());
        Project project = new Project();
        Set<Employee> employees = new HashSet<>(Arrays.asList(new Employee(), new Employee()));
        project.setEmployees(employees);
        List<Employee> employeesToRemove = new ArrayList<>(employees);
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(employeeRepository.findByIdIn(memberIds)).thenReturn(employeesToRemove);
        when(projectRepository.save(any(Project.class))).thenReturn(project);
        Project result = projectService.removeMembersFromProject(projectId, memberIds);
        assertNotNull(result);
    }
} 