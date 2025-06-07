package com.itestra.eep.services;

import com.itestra.eep.dtos.ProjectCreateDTO;
import com.itestra.eep.dtos.ProjectUpdateDTO;
import com.itestra.eep.models.Project;

import java.util.List;
import java.util.UUID;

public interface ProjectService {

    Project findById(UUID id);

    Project create(ProjectCreateDTO dto);

    Project update(UUID projectId, ProjectUpdateDTO dto);

    Project addMembersToProject(UUID projectId, List<UUID> membersList);

    Project removeMembersFromProject(UUID projectId, List<UUID> membersList);

    void delete(UUID id);

}
