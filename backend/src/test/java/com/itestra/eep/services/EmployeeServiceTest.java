package com.itestra.eep.services;

import com.itestra.eep.models.Employee;
import com.itestra.eep.repositories.EmployeeRepository;
import com.itestra.eep.services.impl.EmployeeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    /**
     * Test that findById returns the correct employee when present.
     */
    @Test
    void testFindByIdReturnsEmployee() {
        Employee employee = new Employee();
        UUID employeeId = UUID.randomUUID();
        employee.setId(employeeId);
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));

        Employee result = employeeService.findById(employeeId);
        assertNotNull(result);
        assertEquals(employeeId, result.getId());
    }

    /**
     * Test that findById returns empty when employee is not found.
     */
    @Test
    void testFindByIdReturnsEmpty() {
        UUID employeeId = UUID.randomUUID();
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.empty());

        assertThrows(com.itestra.eep.exceptions.EmployeeNotFoundException.class, () -> employeeService.findById(employeeId));
    }
} 