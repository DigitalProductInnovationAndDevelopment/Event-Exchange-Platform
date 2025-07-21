package com.itestra.eep.dtos;

import com.itestra.eep.enums.DietaryPreference;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Value;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.lang.Nullable;

import java.io.Serializable;


@Value
public class ProfileUpdateDTO implements Serializable {

    @Nullable
    @Size(max = 255)
    @NotBlank(message = "Name cannot be empty.")
    String name;

    @Nullable
    @Size(max = 255)
    @NotBlank(message = "Last name cannot be empty.")
    String lastName;

    @Nullable
    @Size(max = 255)
    @NotBlank(message = "Gender cannot be empty.")
    String gender;

    @Nullable
    @Size(max = 255)
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
}