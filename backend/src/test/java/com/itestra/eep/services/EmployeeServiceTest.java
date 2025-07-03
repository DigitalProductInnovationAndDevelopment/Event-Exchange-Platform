package com.itestra.eep.services;

import com.itestra.eep.models.Employee;
import com.itestra.eep.repositories.EmployeeRepository;
import com.itestra.utils.RandomEntityGenerator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.annotation.DirtiesContext;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Import(value = RandomEntityGenerator.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class EmployeeServiceTest {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private RandomEntityGenerator randomEntityGenerator;

    /**
     * Test that findById returns the correct employee when present.
     */
    @Test
    void testFindByIdReturnsEmployee() {
        Employee employee = randomEntityGenerator.generate(Employee.class);
        employee = employeeRepository.save(employee);

        Employee result = employeeService.findById(employee.getId());
        assertNotNull(result);
        assertEquals(employee.getId(), result.getId());
    }

    /**
     * Test that findById returns empty when employee is not found.
     */
    @Test
    void testFindByIdReturnsEmpty() {
        UUID employeeId = UUID.randomUUID();
        assertThrows(com.itestra.eep.exceptions.EmployeeNotFoundException.class, () -> employeeService.findById(employeeId));
    }
} 