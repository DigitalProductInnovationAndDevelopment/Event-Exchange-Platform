package com.itestra.eep.dtos;

import com.itestra.eep.enums.DietaryPreference;
import com.itestra.eep.enums.EmploymentType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;


@Getter
@Setter
@AllArgsConstructor
public class EmployeeCreateDTO implements Serializable {

    @Valid
    ProfileCreateDTO profile;

    @NotNull(message = "Employment start date cannot be empty.")
    @PastOrPresent(message = "Employment start date cannot be in the future.")
    LocalDate employmentStartDate;

    @NotNull(message = "Employment type cannot be empty.")
    @Enumerated(EnumType.STRING)
    EmploymentType employmentType;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class ProfileCreateDTO implements Serializable {

        @NotNull(message = "Name cannot be empty.")
        @Size(max = 255)
        @NotEmpty
        String name;

        @Size(max = 255)
        @NotEmpty(message = "Last name cannot be empty.")
        String lastName;

        @Size(max = 255)
        @NotEmpty(message = "Gender cannot be empty.")
        String gender;

        @NotNull
        String gitlabUsername;

        @NotNull(message = "Email cannot be empty.")
        @NotEmpty(message = "Email cannot be empty.")
        String email;

        List<DietaryPreference> dietTypes;
    }
}