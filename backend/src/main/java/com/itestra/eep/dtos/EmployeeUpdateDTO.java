package com.itestra.eep.dtos;

import com.itestra.eep.enums.DietaryPreference;
import com.itestra.eep.enums.EmploymentType;
import com.itestra.eep.models.Employee;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.lang.Nullable;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for {@link Employee}
 */
@Getter
@Setter
public class EmployeeUpdateDTO implements Serializable {

    @Nullable
    ProfileUpdateDTO profile;

    @Nullable
    @PastOrPresent(message = "Employment start date cannot be in the future.")
    LocalDate employmentStartDate;

    @Nullable
    @Enumerated(EnumType.STRING)
    EmploymentType employmentType;

    @Getter
    @Setter
    public static class ProfileUpdateDTO implements Serializable {

        @Nullable
        @Size(max = 255)
        @NotEmpty
        String name;

        @Nullable
        @Size(max = 255)
        @NotEmpty
        String lastName;

        @Nullable
        @Size(max = 255)
        @NotEmpty
        String gender;

        @Nullable
        List<DietaryPreference> dietTypes;
    }
}