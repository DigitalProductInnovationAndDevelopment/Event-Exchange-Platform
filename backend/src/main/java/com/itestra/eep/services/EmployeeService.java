package com.itestra.eep.services;

import com.itestra.eep.dtos.EmployeeCreateDTO;
import com.itestra.eep.dtos.EmployeeUpdateDTO;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.Profile;

import java.util.List;
import java.util.UUID;

public interface EmployeeService {

    Profile getAuthenticatedProfileDetails();

    Employee findById(UUID id);

    Employee create(EmployeeCreateDTO dto);

    Employee update(UUID id, EmployeeUpdateDTO dto);

    List<Employee> findAll();

    void delete(UUID id);

    List<Employee> createEmployeesBatch(List<EmployeeCreateDTO> employees);
}
