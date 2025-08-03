package com.itestra.eep.dtos.constraintSolver;

import com.itestra.eep.models.EmployeeParticipation;
import com.itestra.eep.models.PreviousMatch;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Set;

@Getter
@AllArgsConstructor
public class EmployeeParticipationDTO {

    EmployeeParticipation employeeParticipation;

    Set<PreviousMatch.PreviousMatchId> filteredPreviousMatches;

}
