package com.itestra.eep.dtos;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.itestra.eep.enums.DietaryPreference;
import com.itestra.eep.enums.Gender;
import com.itestra.eep.serializers.GenderDeserializer;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateDTO implements Serializable {

    @Size(max = 255)
    @NotBlank(message = "Name cannot be empty.")
    String name;

    @Size(max = 255)
    @NotBlank(message = "Last name cannot be empty.")
    String lastName;

    @NotNull(message = "Gender cannot be empty.")
    @JsonDeserialize(using = GenderDeserializer.class)
    Gender gender;

    @Size(max = 255, message = "GitLab username should be shorter than 255 characters")
    String gitlabUsername;

    @NotBlank(message = "Email cannot be empty.")
    @Email(message = "Email should be valid.")
    String email;

    @Enumerated(EnumType.STRING)
    DietaryPreference[] dietTypes;
}