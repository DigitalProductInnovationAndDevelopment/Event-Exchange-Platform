package com.itestra.eep.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;


@AllArgsConstructor
@Getter
public final class SeatAllocationUpsertDTO {

    @NotBlank(message = "Participant Id cannot be empty")
    private final UUID participationId;

    private final UUID chairId;

    private final UUID[] neighbourProfileIds;

}