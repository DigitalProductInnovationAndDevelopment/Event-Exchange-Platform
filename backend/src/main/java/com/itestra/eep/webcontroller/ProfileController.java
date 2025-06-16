package com.itestra.eep.webcontroller;

import com.itestra.eep.dtos.EmployeeCreateDTO;
import com.itestra.eep.dtos.EmployeeDetailsDTO;
import com.itestra.eep.dtos.EmployeeUpdateDTO;
import com.itestra.eep.mappers.EmployeeMapper;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.Profile;
import com.itestra.eep.services.EmployeeService;
import com.itestra.eep.utils.CSVUtils;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    public ResponseEntity<EmployeeUpdateDTO> getEmployee(@PathVariable UUID id) {
        Employee employee = employeeService.findById(id);
        return new ResponseEntity<>(employeeMapper.toUpdateDto(employee), HttpStatus.OK);
    }

    @GetMapping("/employees")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<Page<EmployeeDetailsDTO>> getEmployees(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Employee> employees = employeeService.findAllByPage(pageable);
        return new ResponseEntity<>(employees.map(employeeMapper::toDetailsDto), HttpStatus.OK);

    }

    @PostMapping("/employee")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<EmployeeDetailsDTO> createEmployee(@RequestBody @Valid EmployeeCreateDTO dto) {
        Employee employee = employeeService.create(dto);
        return new ResponseEntity<>(employeeMapper.toDetailsDto(employee), HttpStatus.OK);
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

    @PostMapping("/import")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<String> importEmployees(@RequestParam("file") MultipartFile file) throws Exception {

        if (file.isEmpty()) {
            return new ResponseEntity<>("Please upload a non-empty file", HttpStatus.BAD_REQUEST);
        }

        List<EmployeeCreateDTO> employees = CSVUtils.getEmployeesFromCSV(file);
        employeeService.importEmployeesFromCSV(employees);
        return new ResponseEntity<>("Employees imported successfully", HttpStatus.OK);

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
