package com.itestra.eep.dtos;

import com.itestra.eep.enums.DietaryPreference;
import com.itestra.eep.enums.Role;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class ProfileDetailsDTO implements Serializable {

    UUID id;

    String name;

    String lastName;

    String gender;

    String gitlabUsername;

    String notes;

    String email;

    DietaryPreference[] dietTypes;

    @Enumerated(EnumType.STRING)
    Set<Role> authorities;

}
