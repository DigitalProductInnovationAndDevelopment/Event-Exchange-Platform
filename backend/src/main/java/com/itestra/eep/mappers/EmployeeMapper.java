package com.itestra.eep.mappers;

import com.itestra.eep.dtos.EmployeeCreateDTO;
import com.itestra.eep.dtos.EmployeeDetailsDTO;
import com.itestra.eep.dtos.EmployeeUpdateDTO;
import com.itestra.eep.dtos.ProfileDetailsDTO;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.Profile;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = EmployeeParticipationMapper.class)
public interface EmployeeMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void createEmployeeFromDto(EmployeeCreateDTO dto, @MappingTarget Employee employee);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEmployeeFromDto(EmployeeUpdateDTO dto, @MappingTarget Employee employee);

    EmployeeDetailsDTO toDetailsDto(Employee employee);

    List<EmployeeDetailsDTO> toDetailsDto(List<Employee> employees);

    ProfileDetailsDTO toProfileDetailsDto(Profile profile);
}
