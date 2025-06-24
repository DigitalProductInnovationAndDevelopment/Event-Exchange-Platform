package com.itestra.eep.mappers;

import com.itestra.eep.dtos.EmployeeCreateDTO;
import com.itestra.eep.dtos.EmployeeDetailsDTO;
import com.itestra.eep.dtos.EmployeeUpdateDTO;
import com.itestra.eep.enums.Role;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.UserRole;
import org.mapstruct.*;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = ParticipationMapper.class)
public interface EmployeeMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void createEmployeeFromDto(EmployeeCreateDTO dto, @MappingTarget Employee employee);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEmployeeFromDto(EmployeeUpdateDTO dto, @MappingTarget Employee employee);

    EmployeeDetailsDTO toDetailsDto(Employee employee);

    List<EmployeeDetailsDTO> toDetailsDto(List<Employee> employees);

    default String map(UserRole userRole) {
        return userRole != null && userRole.getRole() != null ? userRole.getRole().name() : null;
    }

    default Set<UserRole> map(Set<Role> roles, @Context Employee employee) {
        if (roles == null) {
            return Collections.emptySet();
        }
        return roles.stream()
                .map(role -> new UserRole(null, employee.getProfile(), role))
                .collect(Collectors.toSet());
    }

    @AfterMapping
    default void linkUserRoles(@MappingTarget Employee employee, EmployeeUpdateDTO dto) {
        if (dto.getProfile() != null && dto.getProfile().getAuthorities() != null) {
            Set<UserRole> authorities = employee.getProfile().getAuthorities();
            authorities.clear();
            authorities.addAll(map(dto.getProfile().getAuthorities(), employee));
        }
    }

    @AfterMapping
    default void linkUserRoles(@MappingTarget Employee employee, EmployeeCreateDTO dto) {
        if (dto.getProfile() != null && dto.getProfile().getAuthorities() != null) {
            Set<UserRole> authorities = employee.getProfile().getAuthorities();
            authorities.clear();
            authorities.addAll(map(dto.getProfile().getAuthorities(), employee));
        }
    }
}
