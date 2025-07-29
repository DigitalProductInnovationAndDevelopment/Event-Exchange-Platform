package com.itestra.eep.dtos;

import com.itestra.eep.enums.DietaryPreference;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class ProfileMinimalDetailsDTO implements Serializable {

    UUID id;

    String name;

    String lastName;

    String gender;

    String gitlabUsername;

    String email;

    DietaryPreference[] dietTypes;

}
