package com.itestra.eep.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.itestra.eep.enums.DietaryPreference;
import com.itestra.eep.enums.Role;
import com.itestra.eep.serializers.GenderDeserializer;
import com.itestra.eep.validators.ValidGender;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Set;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeCreateDTO implements Serializable {

    @Valid
    ProfileCreateDTO profile;

    @NotNull(message = "Employment start date cannot be empty.")
    @PastOrPresent(message = "Employment start date cannot be in the future.")
    @JsonSerialize(using = LocalDateSerializer.class)
    @JsonDeserialize(using = LocalDateDeserializer.class)
    LocalDate employmentStartDate;

    @NotNull(message = "Employee location cannot be empty.")
    String location;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class ProfileCreateDTO implements Serializable {

        @NotBlank(message = "Name cannot be empty.")
        @Size(max = 255)
        String name;

        @Size(max = 255)
        @NotBlank(message = "Last name cannot be empty.")
        String lastName;

        @Size(max = 255)
        @NotBlank(message = "Gender cannot be empty.")
        @ValidGender
        @JsonProperty("gender")
        @JsonDeserialize(using = GenderDeserializer.class)
        String gender;

        @Size(max = 255, message = "GitLab username should be shorter than 255 characters")
        String gitlabUsername;

        @Size(max = 10_000, message = "Notes cannot be more than 10000 characters")
        String notes;

        @NotBlank(message = "Email cannot be empty.")
        @Email(message = "Email should be valid.")
        String email;

        @Enumerated(EnumType.STRING)
        DietaryPreference[] dietTypes;

        @NotNull(message = "Employee role cannot be empty.")
        @Enumerated(EnumType.STRING)
        private Set<Role> authorities;
    }
}