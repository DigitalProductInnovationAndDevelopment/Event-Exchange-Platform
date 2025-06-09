package com.itestra.eep.mappers;

import com.itestra.eep.dtos.ProjectCreateDTO;
import com.itestra.eep.dtos.ProjectUpdateDTO;
import com.itestra.eep.models.Project;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;


@Mapper(componentModel = "spring")
public interface ProjectMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void createProjectFromDto(ProjectCreateDTO dto, @MappingTarget Project project);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateProjectFromDto(ProjectUpdateDTO dto, @MappingTarget Project project);

    ProjectCreateDTO toDto(Project project);


}
