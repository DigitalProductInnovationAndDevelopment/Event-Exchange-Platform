package com.itestra.eep.services.impl;

import com.itestra.eep.dtos.EmployeeBatchUpsertResultDTO;
import com.itestra.eep.dtos.EmployeeCreateDTO;
import com.itestra.eep.dtos.EmployeeUpdateDTO;
import com.itestra.eep.dtos.ProfileUpdateDTO;
import com.itestra.eep.exceptions.EmployeeNotFoundException;
import com.itestra.eep.exceptions.UserProfileNotFoundException;
import com.itestra.eep.mappers.EmployeeMapper;
import com.itestra.eep.mappers.ProfileMapper;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.Profile;
import com.itestra.eep.repositories.EmployeeRepository;
import com.itestra.eep.repositories.ProfileRepository;
import com.itestra.eep.services.EmployeeService;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final ProfileRepository profileRepository;
    private final EmployeeMapper employeeMapper;
    private final ProfileMapper profileMapper;
    private final Validator validator;


    @Override
    @Transactional(readOnly = true)
    public Profile getAuthenticatedProfileDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return profileRepository.findById(((Profile) authentication.getPrincipal()).getId()).orElseThrow(UserProfileNotFoundException::new);
    }

    @Override
    public Profile updateAuthenticatedProfileDetails(ProfileUpdateDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Profile profile = profileRepository.findById(((Profile) authentication.getPrincipal()).getId()).orElseThrow(UserProfileNotFoundException::new);
        profileMapper.updateProfileFromDto(dto, profile);
        return profileRepository.save(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Employee> findAll() {
        return employeeRepository.findAllByOrderByProfileNameAsc();
    }

    @Override
    @Transactional(readOnly = true)
    public Employee findById(UUID id) {
        return employeeRepository.findById(id).orElseThrow(EmployeeNotFoundException::new);
    }

    @Override
    public EmployeeBatchUpsertResultDTO upsertEmployeesBatch(List<EmployeeCreateDTO> dtos) {

        Set<String> emails = dtos.stream()
                .map(dto -> dto.getProfile().getEmail())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        List<Employee> existingEmployees = employeeRepository.findByProfileEmailIn(emails);


        Map<String, Employee> existingByEmail = existingEmployees.stream()
                .collect(Collectors.toMap(employee -> employee.getProfile().getEmail(), Function.identity()));

        List<Employee> employeesToSave = new ArrayList<>();
        List<Employee> employeesToUpdate = new ArrayList<>();

        for (EmployeeCreateDTO dto : dtos) {
            Employee employee = existingByEmail.get(dto.getProfile().getEmail());
            if (employee != null) {
                // handle existing employee
                EmployeeUpdateDTO employeeUpdateDTO = new EmployeeUpdateDTO();
                BeanUtils.copyProperties(dto, employeeUpdateDTO);
                // manually copy is needed nested objects
                if (dto.getProfile() != null) {
                    EmployeeUpdateDTO.EmployeeProfileUpdateDTO profileUpdateDTO = new EmployeeUpdateDTO.EmployeeProfileUpdateDTO();
                    BeanUtils.copyProperties(dto.getProfile(), profileUpdateDTO);
                    employeeUpdateDTO.setProfile(profileUpdateDTO);
                }

                validator.validate(employeeUpdateDTO);
                employeeMapper.updateEmployeeFromDto(employeeUpdateDTO, employee);
                employeesToUpdate.add(employee);
            } else {
                // handle new employees
                employee = new Employee();
                employeeMapper.createEmployeeFromDto(dto, employee);
                employeesToSave.add(employee);
            }
        }
        employeesToSave = employeeRepository.saveAllAndFlush(employeesToSave);
        return new EmployeeBatchUpsertResultDTO(employeeMapper.toMinimalDetailsDto(employeesToSave), employeeMapper.toMinimalDetailsDto(employeesToUpdate));
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
