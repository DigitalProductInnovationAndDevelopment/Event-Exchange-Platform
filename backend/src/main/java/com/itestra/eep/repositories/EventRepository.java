package com.itestra.eep.repositories;

import com.itestra.eep.dtos.SeatAllocationDetailsDTO;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.Profile;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    boolean existsByIdAndEmployeeParticipations_Employee_Id(UUID eventId, UUID employeeId);

    boolean existsByIdAndVisitorParticipations_Profile_Id(UUID eventId, UUID visitorId);

    @Query("select e from Event e where e.id = ?1")
    @EntityGraph(attributePaths = {"employeeParticipations.employee.previousMatches"})
    Optional<Event> findByIdJoinedWithPreviousMatches(UUID id);

    @EntityGraph("Event.files_schematics")
    List<Event> findAllByDateAfter(LocalDateTime dateAfter);

    @EntityGraph("Event.files_schematics")
    List<Event> findByDateAfterAndVisitorParticipations_Profile_Id(LocalDateTime from, UUID participantId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Event e WHERE e.id = :id")
    Optional<Event> findByIdWithUpdateLock(@Param("id") UUID id);

    @Modifying
    @Query("UPDATE EmployeeParticipation p SET p.chair.id = :chairId WHERE p.id = :participationId")
    void updateEmployeeParticipationChairId(@Param("participationId") UUID participationId, @Param("chairId") UUID chairId);

    @Modifying
    @Query("UPDATE VisitorParticipation v SET v.chair.id = :chairId WHERE v.id = :participationId")
    void updateVisitorParticipationChairId(@Param("participationId") UUID participationId, @Param("chairId") UUID chairId);

    @Modifying
    @Query("UPDATE EmployeeParticipation ep SET ep.chair.id = null WHERE ep.eventId = :eventId")
    void unsetAllEmployeeParticipationChairsByEventId(@Param("eventId") UUID eventId);

    @Modifying
    @Query("UPDATE VisitorParticipation vp SET vp.chair.id = null WHERE vp.eventId = :eventId")
    void unsetAllVisitorParticipationChairsByEventId(@Param("eventId") UUID eventId);

    @Query("""
            SELECT new com.itestra.eep.dtos.SeatAllocationDetailsDTO(
                p.employee.profile,
                p.id,
                CAST(null AS java.util.UUID),
                p.chair.id,
                CAST(null AS java.lang.String)
            )
            FROM Event e
            JOIN e.employeeParticipations p
            WHERE e.id = :eventId
            
            UNION
            
            SELECT new com.itestra.eep.dtos.SeatAllocationDetailsDTO(
                v.profile,
                v.id,
                v.invitor.id,
                v.chair.id,
                v.accessLink
            )
            FROM Event e
            JOIN e.visitorParticipations v
            WHERE e.id = :eventId
            """)
    List<SeatAllocationDetailsDTO> findCurrentSeatAllocationsByEventId(@Param("eventId") UUID eventId);


    @Query("""
            SELECT p.employee.profile
            FROM Event e
            JOIN e.employeeParticipations p
            WHERE e.id = :eventId
            
            UNION
            
            SELECT v.profile
            FROM Event e
            JOIN e.visitorParticipations v
            WHERE e.id = :eventId
            """)
    List<Profile> findAllParticipantProfilesByEventId(@Param("eventId") UUID eventId);

}
