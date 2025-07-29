package com.itestra.eep.mappers;

import com.itestra.eep.dtos.EmployeeCreateDTO;
import com.itestra.eep.dtos.EmployeeDetailsDTO;
import com.itestra.eep.dtos.EmployeeMinimalDetailsDTO;
import com.itestra.eep.dtos.EmployeeUpdateDTO;
import com.itestra.eep.enums.Role;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.Profile;
import org.mapstruct.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {EmployeeParticipationMapper.class, ProfileMapper.class})
public interface EmployeeMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void createEmployeeFromDto(EmployeeCreateDTO dto, @MappingTarget Employee employee);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEmployeeFromDto(EmployeeUpdateDTO dto, @MappingTarget Employee employee);

    @Mapping(target = "profile.notes", expression = "java(filterNotes(profile, authentication))")
    EmployeeDetailsDTO toDetailsDto(Employee employee, @Context Authentication authentication);

    List<EmployeeMinimalDetailsDTO> toMinimalDetailsDto(List<Employee> employees);

    default String filterNotes(Profile profile, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().contains(Role.ADMIN);
        return isAdmin ? profile.getNotes() : null;
    }
}
