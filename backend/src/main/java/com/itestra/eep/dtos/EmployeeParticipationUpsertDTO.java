package com.itestra.eep.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Value;

import java.io.Serializable;
import java.util.UUID;

@Value
public class EmployeeParticipationUpsertDTO implements Serializable {

    int guestCount;

    @NotNull(message = "Participation must be performed by an Employee.")
    UUID employeeId;

}