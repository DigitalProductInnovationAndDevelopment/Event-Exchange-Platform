package com.itestra.eep.dtos.constraintSolver;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;


@Getter
@Setter
@AllArgsConstructor
public class ConstraintSolverTableDTO implements Serializable {

    @JsonProperty("table_id")
    UUID tableId;

    @JsonProperty("Anzahl")
    int number;

}