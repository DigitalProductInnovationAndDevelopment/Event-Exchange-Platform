package com.itestra.eep.dtos.constraintSolver;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.io.Serializable;


@Getter
public class ConstraintSolverConstraintsDTO implements Serializable {

    @JsonProperty("Standort")
    int place;

    @JsonProperty("Zugehörigkeit")
    int employmentDuration;

    @JsonProperty("Geschlecht")
    int gender;

    @JsonProperty("last neighborhood")
    int lastNeighborhood;

}