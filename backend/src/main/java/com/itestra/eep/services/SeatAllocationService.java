package com.itestra.eep.services;

import com.itestra.eep.dtos.SeatAllocationDetailsDTO;

import java.util.List;
import java.util.UUID;

public interface SeatAllocationService {

    List<SeatAllocationDetailsDTO> getSeatAllocations(UUID eventId);

    void updateSeatAllocation(UUID participationId, UUID chairId);
}
