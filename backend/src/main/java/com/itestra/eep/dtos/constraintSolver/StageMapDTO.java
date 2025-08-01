package com.itestra.eep.dtos.constraintSolver;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;
import java.util.UUID;


@Setter
@Getter
public class StageMapDTO {

    private ConstraintSolverConstraintsDTO constraints;

    /*{
        "table1Id": {
            "chair1Id": [ "connectedChair1Id", "connectedChair2Id" ],
            "chair2Id": [ "connectedChair3Id", "connectedChair4Id" ]
        },
        "table2Id": {
            "chair3Id": [ "connectedChair5Id", "connectedChair6Id" ],
            "chair4Id": [ "connectedChair7Id", "connectedChair8Id" ]
        }
    }*/
    private Map<UUID, Map<UUID, List<UUID>>> seatMap;

}

