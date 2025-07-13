package com.itestra.eep.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;


@AllArgsConstructor
@Getter
public final class SeatAllocationUpsertDTO {

    private final UUID participationId;
    private final UUID chairId;

}