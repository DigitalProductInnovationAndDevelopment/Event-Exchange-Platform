package com.itestra.eep.mappers;

import com.itestra.eep.dtos.EmployeeCreateDTO;
import com.itestra.eep.dtos.EmployeeDetailsDTO;
import com.itestra.eep.dtos.EmployeeMinimalDetailsDTO;
import com.itestra.eep.dtos.EmployeeUpdateDTO;
import com.itestra.eep.models.Employee;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {EmployeeParticipationMapper.class, ProfileMapper.class})
public interface EmployeeMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void createEmployeeFromDto(EmployeeCreateDTO dto, @MappingTarget Employee employee);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEmployeeFromDto(EmployeeUpdateDTO dto, @MappingTarget Employee employee);

    EmployeeDetailsDTO toDetailsDto(Employee employee);

    List<EmployeeMinimalDetailsDTO> toMinimalDetailsDto(List<Employee> employees);

}
