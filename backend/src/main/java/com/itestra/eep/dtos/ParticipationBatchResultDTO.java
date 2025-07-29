package com.itestra.eep.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;


@Getter
@Setter
@AllArgsConstructor
public class ParticipationBatchResultDTO {

    private List<EmployeeParticipationDetailsDTO> createdParticipations;
    private List<EmployeeParticipationDetailsDTO> updatedParticipations;

}
