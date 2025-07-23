package com.itestra.eep.services;

import com.itestra.eep.dtos.EmployeeBatchUpsertResultDTO;
import com.itestra.eep.dtos.EmployeeCreateDTO;
import com.itestra.eep.dtos.EmployeeUpdateDTO;
import com.itestra.eep.dtos.ProfileUpdateDTO;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.Profile;

import java.util.List;
import java.util.UUID;

public interface EmployeeService {

    Profile getAuthenticatedProfileDetails();

    Profile updateAuthenticatedProfileDetails(ProfileUpdateDTO dto);

    Employee findById(UUID id);

    EmployeeBatchUpsertResultDTO upsertEmployeesBatch(List<EmployeeCreateDTO> dtos);

    Employee create(EmployeeCreateDTO dto);

    Employee update(UUID id, EmployeeUpdateDTO dto);

    List<Employee> findAll();

    void delete(UUID id);

}
