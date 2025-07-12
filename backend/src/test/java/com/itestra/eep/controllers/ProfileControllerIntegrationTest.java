package com.itestra.eep.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itestra.eep.dtos.EmployeeCreateDTO;
import com.itestra.eep.enums.DietaryPreference;
import com.itestra.eep.enums.EmploymentType;
import com.itestra.eep.enums.Role;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.Profile;
import com.itestra.eep.repositories.EmployeeRepository;
import com.itestra.utils.RandomEntityGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@Import(value = {RandomEntityGenerator.class})
public class ProfileControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    EmployeeRepository employeeRepository;

    @Autowired
    RandomEntityGenerator randomEntityGenerator;

    private EmployeeCreateDTO employeeCreateDTO;

    @BeforeEach
    public void setUp() {
        objectMapper = new ObjectMapper();

        Profile profile = Profile.builder()
                .fullName("John Doe")
                .gender("Male")
                .gitlabUsername("johndoe")
                .email("john.doe@example.com")
                .dietTypes(new DietaryPreference[]{DietaryPreference.VEGETARIAN})
                .authorities(Set.of(Role.ADMIN))
                .build();

        employeeCreateDTO = new EmployeeCreateDTO(
                new EmployeeCreateDTO.ProfileCreateDTO(
                        profile.getFullName(),
                        profile.getGender(),
                        profile.getGitlabUsername(),
                        profile.getEmail(),
                        profile.getDietTypes(),
                        Set.of(Role.ADMIN)
                ),
                LocalDate.now(),
                EmploymentType.FULLTIME,
                "Location"
        );
    }

    @Test
    @WithMockUser(authorities = {"EMPLOYEE"}, username = "John Doe")
    public void testGetMyProfile() throws Exception {

        mockMvc.perform(get("/profile/own"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("John Doe"));
    }

    @Test
    @WithMockUser(authorities = {"ADMIN"})
    public void testCreateEmployee() throws Exception {

        assertEquals(0, employeeRepository.count());

        mockMvc.perform(post("/profile/employee")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(employeeCreateDTO)))
                .andExpect(status().isOk());

        assertEquals(1, employeeRepository.count());
    }

    @Test
    @WithMockUser(authorities = {"EMPLOYEE"})
    public void testGetEmployee() throws Exception {

        Employee employee = randomEntityGenerator.generate(Employee.class);
        employee = employeeRepository.save(employee);

        mockMvc.perform(get("/profile/employee/{id}", employee.getId()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {"ADMIN"})
    public void testGetEmployees() throws Exception {

        List<Employee> employees = List.of(randomEntityGenerator.generate(Employee.class), randomEntityGenerator.generate(Employee.class));
        employeeRepository.saveAll(employees);

        mockMvc.perform(get("/profile/employees"))
                .andExpect(status().isOk());
    }


    @Test
    @WithMockUser(authorities = {"ADMIN"})
    public void testDeleteEmployee() throws Exception {

        Employee employee = randomEntityGenerator.generate(Employee.class);
        employee = employeeRepository.save(employee);

        assertEquals(1, employeeRepository.count());

        mockMvc.perform(delete("/profile/employee/{id}", employee.getId()))
                .andExpect(status().isOk());

        assertEquals(0, employeeRepository.count());
    }


}
