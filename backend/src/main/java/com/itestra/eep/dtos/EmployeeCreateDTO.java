package com.itestra.eep.dtos;

import com.itestra.eep.enums.DietaryPreference;
import com.itestra.eep.enums.EmploymentType;
import com.itestra.eep.enums.Role;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Set;


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

    @NotNull(message = "Employee location cannot be empty.")
    String location;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class ProfileCreateDTO implements Serializable {

        @NotNull(message = "Full name cannot be empty.")
        @Size(max = 500)
        @NotEmpty
        String fullName;

        @Size(max = 255)
        @NotEmpty(message = "Gender cannot be empty.")
        String gender;

        @NotNull
        String gitlabUsername;

        @NotNull(message = "Email cannot be empty.")
        @NotEmpty(message = "Email cannot be empty.")
        @Email(message = "Email should be valid.")
        String email;

        @JdbcTypeCode(SqlTypes.ARRAY)
        @Enumerated(EnumType.STRING)
        DietaryPreference[] dietTypes;

        @NotNull(message = "Employee role cannot be empty.")
        @Enumerated(EnumType.STRING)
        private Set<Role> authorities;
    }
}