package com.itestra.eep.services.impl;


import com.itestra.eep.dtos.SeatAllocationDetailsDTO;
import com.itestra.eep.exceptions.EventNotFoundException;
import com.itestra.eep.repositories.EventRepository;
import com.itestra.eep.services.SeatAllocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
public class SeatAllocationServiceImpl implements SeatAllocationService {

    private final EventRepository eventRepository;

    @Override
    public List<SeatAllocationDetailsDTO> getSeatAllocations(UUID eventId) {
        eventRepository.findById(eventId).orElseThrow(EventNotFoundException::new);
        return eventRepository.findSeatAllocationsByEventId(eventId);
    }


    /**
     * @param chairId set UUID null for seat un-allocation
     */
    @Override
    public void updateSeatAllocation(UUID participationId, UUID chairId) {
        eventRepository.updateEmployeeParticipationChairId(participationId, chairId);
        eventRepository.updateVisitorParticipationChairId(participationId, chairId);
    }

}
