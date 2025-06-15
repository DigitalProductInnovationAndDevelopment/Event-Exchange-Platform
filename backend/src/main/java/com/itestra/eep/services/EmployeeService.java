package com.itestra.eep.services;

import com.itestra.eep.dtos.EmployeeCreateDTO;
import com.itestra.eep.dtos.EmployeeUpdateDTO;
import com.itestra.eep.models.Employee;

import java.util.UUID;

public interface EmployeeService {

    Employee findById(UUID id);

    Employee create(EmployeeCreateDTO dto);

    Employee update(UUID id, EmployeeUpdateDTO dto);

    void delete(UUID id);

    void importEmployeesFromCSV(List<@Valid EmployeeCreateDTO> employees);
}
