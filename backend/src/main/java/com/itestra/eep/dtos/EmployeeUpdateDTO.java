package com.itestra.eep.dtos;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.itestra.eep.enums.DietaryPreference;
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

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Set;


@Getter
@Setter
public class EmployeeUpdateDTO implements Serializable {

    @Valid
    ProfileUpdateDTO profile;

    @PastOrPresent(message = "Employment start date cannot be in the future.")
    @JsonSerialize(using = LocalDateSerializer.class)
    @JsonDeserialize(using = LocalDateDeserializer.class)
    LocalDate employmentStartDate;

    String location;

    @Getter
    @Setter
    public static class ProfileUpdateDTO implements Serializable {

        @Size(max = 255)
        @NotBlank(message = "Name cannot be empty.")
        String name;

        @Size(max = 255)
        @NotBlank(message = "Last name cannot be empty.")
        String lastName;

        @Size(max = 255)
        @NotBlank(message = "Gender cannot be empty.")
        String gender;

        @Size(max = 255, message = "GitLab username should be shorter than 255 characters")
        String gitlabUsername;

        @Size(max = 10_000, message = "Notes cannot be more than 10000 characters")
        String notes;

        @NotBlank(message = "Email cannot be empty.")
        @Email(message = "Email should be valid.")
        String email;

        @JdbcTypeCode(SqlTypes.ARRAY)
        @Enumerated(EnumType.STRING)
        DietaryPreference[] dietTypes;

        @Enumerated(EnumType.STRING)
        private Set<Role> authorities;
    }
}