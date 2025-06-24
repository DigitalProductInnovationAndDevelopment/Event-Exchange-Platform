package com.itestra.eep.dtos;

import com.itestra.eep.enums.DietaryPreference;
import com.itestra.eep.enums.EmploymentType;
import com.itestra.eep.enums.Role;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.lang.Nullable;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Set;


@Getter
@Setter
public class EmployeeUpdateDTO implements Serializable {

    @Nullable
    @Valid
    ProfileUpdateDTO profile;

    @Nullable
    @PastOrPresent(message = "Employment start date cannot be in the future.")
    LocalDate employmentStartDate;

    @Nullable
    @Enumerated(EnumType.STRING)
    EmploymentType employmentType;

    @Nullable
    String location;

    @Getter
    @Setter
    public static class ProfileUpdateDTO implements Serializable {

        @Nullable
        @Size(max = 255)
        @NotBlank(message = "Full name cannot be empty.")
        String fullName;

        @Nullable
        @Size(max = 255)
        @NotBlank(message = "Gender cannot be empty.")
        String gender;

        @Nullable
        @NotBlank(message = "GitLab username cannot be empty.")
        String gitlabUsername;

        @Nullable
        @NotBlank(message = "Email cannot be empty.")
        @Email(message = "Email should be valid.")
        String email;

        @Nullable
        @JdbcTypeCode(SqlTypes.ARRAY)
        @Enumerated(EnumType.STRING)
        DietaryPreference[] dietTypes;

        @Nullable
        @Enumerated(EnumType.STRING)
        private Set<Role> authorities;
    }
}