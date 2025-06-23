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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.lang.Nullable;

import java.io.Serializable;
import java.time.LocalDate;

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

    @Nullable
    String location;

    @Getter
    @Setter
    public static class ProfileUpdateDTO implements Serializable {

        @Nullable
        @Size(max = 255)
        @NotEmpty
        String fullName;

        @Nullable
        @Size(max = 255)
        @NotEmpty
        String lastName;

        @Nullable
        @Size(max = 255)
        @NotEmpty
        String gender;

        @Nullable
        @JdbcTypeCode(SqlTypes.ARRAY)
        @Enumerated(EnumType.STRING)
        DietaryPreference[] dietTypes;
    }
}