package com.itestra.eep.webcontroller;

import com.itestra.eep.dtos.EmployeeCreateDTO;
import com.itestra.eep.dtos.EmployeeDetailsDTO;
import com.itestra.eep.dtos.EmployeeUpdateDTO;
import com.itestra.eep.mappers.EmployeeMapper;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.Profile;
import com.itestra.eep.services.EmployeeService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@CrossOrigin
@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/profile")
public class ProfileController {

    private final EmployeeMapper employeeMapper;
    private final EmployeeService employeeService;

    @GetMapping("/own")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'EMPLOYEE', 'VISITOR')")
    public ResponseEntity<Profile> getMyProfile() {
        Profile profile = employeeService.getAuthenticatedProfileDetails();
        return new ResponseEntity<>(profile, HttpStatus.OK);
    }

    @GetMapping("/employee/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'EMPLOYEE', 'VISITOR')")
    public ResponseEntity<EmployeeDetailsDTO> getEmployee(@PathVariable UUID id) {
        Employee employee = employeeService.findById(id);
        return new ResponseEntity<>(employeeMapper.toDetailsDto(employee), HttpStatus.OK);
    }

    @GetMapping("/employees")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<List<EmployeeDetailsDTO>> getEmployees() {
        List<Employee> employees = employeeService.findAll();
        return new ResponseEntity<>(employeeMapper.toDetailsDto(employees), HttpStatus.OK);
    }

    @PostMapping("/employee")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<EmployeeDetailsDTO> createEmployee(@RequestBody @Valid EmployeeCreateDTO dto) {
        Employee employee = employeeService.create(dto);
        return new ResponseEntity<>(employeeMapper.toDetailsDto(employee), HttpStatus.OK);
    }

    @PostMapping("/employees/batch")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<EmployeeDetailsDTO>> createEmployeesBatch(@RequestBody List<@Valid EmployeeCreateDTO> dtos) {
        List<Employee> employees = employeeService.createEmployeesBatch(dtos);
        return new ResponseEntity<>(employeeMapper.toDetailsDto(employees), HttpStatus.OK);
    }

    @PutMapping("/employee/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<EmployeeDetailsDTO> updateEmployee(@PathVariable UUID id, @RequestBody @Valid EmployeeUpdateDTO dto) {
        Employee employee = employeeService.update(id, dto);
        return new ResponseEntity<>(employeeMapper.toDetailsDto(employee), HttpStatus.OK);
    }

    @DeleteMapping("/employee/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Boolean> deleteEmployee(@PathVariable UUID id) {
        employeeService.delete(id);
        return ResponseEntity.ok(true);
    }

    @PostMapping("/logout")
    public ResponseEntity<Boolean> logout(HttpServletResponse response) {

        ResponseCookie deleteCookie = ResponseCookie.from("Authorization", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("Strict")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());

        return ResponseEntity.ok(true);
    }

}
