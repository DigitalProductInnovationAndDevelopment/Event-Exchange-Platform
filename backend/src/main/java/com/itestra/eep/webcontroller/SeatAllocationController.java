package com.itestra.eep.webcontroller;

import com.itestra.eep.dtos.SeatAllocationDetailsDTO;
import com.itestra.eep.dtos.SeatAllocationUpsertDTO;
import com.itestra.eep.dtos.constraintSolver.StageMapDTO;
import com.itestra.eep.services.SeatAllocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.UUID;


@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/seat-allocation")
public class SeatAllocationController {

    private final SeatAllocationService seatAllocationService;

    @PostMapping("/{eventId}/assign")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<SeatAllocationDetailsDTO>> assignTables(@PathVariable UUID eventId, @RequestBody StageMapDTO stageMap) throws IOException, InterruptedException {
        seatAllocationService.performTableBasedSeatAllocation(eventId, stageMap);
        List<SeatAllocationDetailsDTO> seatAllocations = seatAllocationService.getSeatAllocations(eventId);
        return new ResponseEntity<>(seatAllocations, HttpStatus.OK);
    }

    @GetMapping("/{eventId}/allocations")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<SeatAllocationDetailsDTO>> getSeatAllocations(@PathVariable UUID eventId) {
        List<SeatAllocationDetailsDTO> seatAllocations = seatAllocationService.getSeatAllocations(eventId);
        return new ResponseEntity<>(seatAllocations, HttpStatus.OK);
    }

    @PutMapping("/{eventId}/allocations")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Boolean> setSeatAllocations(@RequestBody SeatAllocationUpsertDTO dto, @PathVariable UUID eventId) {
        seatAllocationService.updateSeatAllocation(dto.getParticipationId(), dto.getChairId(), eventId, null);
        return ResponseEntity.ok(true);
    }

}
