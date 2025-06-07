package com.itestra.eep.services.impl;

import com.itestra.eep.dtos.ProjectCreateDTO;
import com.itestra.eep.dtos.ProjectUpdateDTO;
import com.itestra.eep.exceptions.ProjectNotFoundException;
import com.itestra.eep.mappers.ProjectMapper;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.Project;
import com.itestra.eep.repositories.EmployeeRepository;
import com.itestra.eep.repositories.ProjectRepository;
import com.itestra.eep.services.ProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;


@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectMapper projectMapper;

    @Override
    public Project findById(UUID projectId) {
        return projectRepository.findById(projectId).orElseThrow(ProjectNotFoundException::new);
    }

    @Override
    public Project create(ProjectCreateDTO dto) {
        Project project = new Project();
        projectMapper.createProjectFromDto(dto, project);
        return projectRepository.save(project);
    }

    @Override
    public Project update(UUID projectId, ProjectUpdateDTO dto) {
        Project project = projectRepository.findById(projectId).orElseThrow(ProjectNotFoundException::new);
        projectMapper.updateProjectFromDto(dto, project);
        return projectRepository.save(project);
    }

    @Override
    public void delete(UUID projectId) {
        projectRepository.deleteById(projectId);
    }

    @Override
    public Project addMembersToProject(UUID projectId, List<UUID> membersList) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(ProjectNotFoundException::new);

        List<Employee> employeesToAdd = employeeRepository.findByIdIn(membersList);

        if (employeesToAdd.size() != membersList.size()) {
            throw new IllegalStateException("Some employees couldn't be found");
        }

        Set<Employee> currentEmployees = project.getEmployees();
        currentEmployees.addAll(employeesToAdd);
        project.setEmployees(currentEmployees);
        return projectRepository.save(project);
    }

    @Override
    public Project removeMembersFromProject(UUID projectId, List<UUID> membersList) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(ProjectNotFoundException::new);

        List<Employee> employeesToAdd = employeeRepository.findByIdIn(membersList);

        if (employeesToAdd.size() != membersList.size()) {
            throw new IllegalStateException("Some employees couldn't be found");
        }

        Set<Employee> currentEmployees = project.getEmployees();
        employeesToAdd.forEach(currentEmployees::remove);
        project.setEmployees(currentEmployees);
        return projectRepository.save(project);
    }
}
