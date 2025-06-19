package com.itestra.eep.dtos;

import com.itestra.eep.enums.DietaryPreference;
import com.itestra.eep.enums.EmploymentType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;


@Getter
@Setter
@AllArgsConstructor
public class EmployeeDetailsDTO implements Serializable {

    ProfileDetailsDTO profile;

    LocalDate employmentStartDate;

    @Enumerated(EnumType.STRING)
    EmploymentType employmentType;

    String location;

    List<ParticipationDetailsDTO> participations;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class ProfileDetailsDTO implements Serializable {

        UUID id;

        String fullName;

        String gender;

        String gitlabUsername;

        String email;

        Set<String> authorities;

        DietaryPreference[] dietTypes;
    }
}
