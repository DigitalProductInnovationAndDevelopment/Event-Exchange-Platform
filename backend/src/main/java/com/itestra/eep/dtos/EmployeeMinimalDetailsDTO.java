package com.itestra.eep.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeMinimalDetailsDTO implements Serializable {

    ProfileMinimalDetailsDTO profile;

    LocalDate employmentStartDate;

    String location;

    int participationCount;

}
