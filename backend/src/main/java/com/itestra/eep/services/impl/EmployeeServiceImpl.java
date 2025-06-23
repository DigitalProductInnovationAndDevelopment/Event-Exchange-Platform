package com.itestra.eep.services.impl;

import com.itestra.eep.dtos.EmployeeCreateDTO;
import com.itestra.eep.dtos.EmployeeUpdateDTO;
import com.itestra.eep.exceptions.EmployeeNotFoundException;
import com.itestra.eep.mappers.EmployeeMapper;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.Profile;
import com.itestra.eep.repositories.EmployeeRepository;
import com.itestra.eep.services.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.UUID;


@Slf4j
@Service
@RequiredArgsConstructor
@Validated
@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;


    @Override
    public Profile getAuthenticatedProfileDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (Profile) authentication.getPrincipal();
    }

    @Override
    public List<Employee> findAll() {
        return employeeRepository.findAll();
    }

    @Override
    public Employee findById(UUID id) {
        return employeeRepository.findById(id).orElseThrow(EmployeeNotFoundException::new);
    }

    @Override
    public void importEmployeesFromCSV(List<@Valid EmployeeCreateDTO> employees) {
        // TODO
    }


    @Override
    public Employee create(EmployeeCreateDTO dto) {
        Employee employee = new Employee();
        employeeMapper.createEmployeeFromDto(dto, employee);
        return employeeRepository.save(employee);
    }

    @Override
    public Employee update(UUID id, EmployeeUpdateDTO dto) {
        Employee employee = employeeRepository.findById(id).orElseThrow(EmployeeNotFoundException::new);
        employeeMapper.updateEmployeeFromDto(dto, employee);
        return employeeRepository.save(employee);
    }

    @Override
    public void delete(UUID id) {
        employeeRepository.deleteById(id);
    }
}
