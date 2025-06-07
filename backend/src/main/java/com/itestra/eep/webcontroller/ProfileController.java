package com.itestra.eep.webcontroller;

import com.itestra.eep.dtos.EmployeeCreateDTO;
import com.itestra.eep.dtos.EmployeeUpdateDTO;
import com.itestra.eep.mappers.EmployeeMapper;
import com.itestra.eep.models.Employee;
import com.itestra.eep.services.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;


@CrossOrigin
@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/profile")
public class ProfileController {

    private final EmployeeMapper employeeMapper;
    private final EmployeeService employeeService;

    @GetMapping("/employee/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'VISITOR')")
    public ResponseEntity<EmployeeUpdateDTO> getEmployee(@PathVariable UUID id) {
        Employee employee = employeeService.findById(id);
        return new ResponseEntity<>(employeeMapper.toUpdateDto(employee), HttpStatus.OK);
    }

    @PostMapping("/employee")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<EmployeeUpdateDTO> createEmployee(@RequestBody @Valid EmployeeCreateDTO dto) {
        Employee employee = employeeService.create(dto);
        return new ResponseEntity<>(employeeMapper.toUpdateDto(employee), HttpStatus.OK);
    }

    @PutMapping("/employee/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<EmployeeUpdateDTO> updateEmployee(@PathVariable UUID id, @RequestBody @Valid EmployeeUpdateDTO dto) {
        Employee employee = employeeService.update(id, dto);
        return new ResponseEntity<>(employeeMapper.toUpdateDto(employee), HttpStatus.OK);
    }

    @DeleteMapping("/employee/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Boolean> deleteEmployee(@PathVariable UUID id) {
        employeeService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
