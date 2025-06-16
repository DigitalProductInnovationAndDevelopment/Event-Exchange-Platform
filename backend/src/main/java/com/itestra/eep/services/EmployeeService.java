package com.itestra.eep.services;

import com.itestra.eep.dtos.EmployeeCreateDTO;
import com.itestra.eep.dtos.EmployeeUpdateDTO;
import com.itestra.eep.models.Employee;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface EmployeeService {

    Employee getAuthenticatedUserEmployeeDetails();

    Employee findById(UUID id);

    Employee create(EmployeeCreateDTO dto);

    Employee update(UUID id, EmployeeUpdateDTO dto);

    Page<Employee> findAllByPage(Pageable pageable);

    void delete(UUID id);

    void importEmployeesFromCSV(List<@Valid EmployeeCreateDTO> employees);
}
