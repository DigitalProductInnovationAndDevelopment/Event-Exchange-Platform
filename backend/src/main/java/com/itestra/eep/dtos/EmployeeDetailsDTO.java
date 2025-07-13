package com.itestra.eep.dtos;

import com.itestra.eep.enums.EmploymentType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeDetailsDTO implements Serializable {

    ProfileDetailsDTO profile;

    LocalDate employmentStartDate;

    @Enumerated(EnumType.STRING)
    EmploymentType employmentType;

    String location;

    List<EmployeeParticipationDetailsDTO> participations;

}
