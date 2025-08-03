package com.itestra.eep.repositories;

import com.itestra.eep.dtos.SeatAllocationDetailsDTO;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.Profile;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    boolean existsByIdAndEmployeeParticipations_Employee_Id(UUID eventId, UUID employeeId);

    boolean existsByIdAndVisitorParticipations_Profile_Id(UUID eventId, UUID visitorId);

    @Query("select e from Event e where e.id = ?1")
    @EntityGraph(attributePaths = {"employeeParticipations.employee.previousMatches"})
    Optional<Event> findByIdJoinedWithPreviousMatches(UUID id);

    @Query("select e.id from Event e where e.date between ?1 and ?2")
    Set<UUID> findEventsByDateBetween(LocalDateTime dateAfter, LocalDateTime dateBefore);

    @EntityGraph(attributePaths = {"schematics", "fileEntities"})
    List<Event> findAllByDateAfter(LocalDateTime dateAfter);

    @EntityGraph(attributePaths = {"schematics", "fileEntities"})
    List<Event> findByDateAfterAndVisitorParticipations_Profile_Id(LocalDateTime from, UUID participantId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Event e WHERE e.id = :id")
    Optional<Event> findByIdWithUpdateLock(@Param("id") UUID id);

    // since we are using SeatAllocationDetailsDTO's constructor,
    // we cannot explicitly use @EntityGraph; therefore, we have to join profile.authorities.
    @Query("""
            SELECT new com.itestra.eep.dtos.SeatAllocationDetailsDTO(
                prof,
                p.id,
                CAST(null AS java.util.UUID),
                p.chair.id,
                CAST(null AS java.lang.String)
            )
            FROM Event e
            JOIN e.employeeParticipations p
            JOIN p.employee emp
            JOIN emp.profile prof
            LEFT JOIN FETCH prof.authorities
            WHERE e.id = :eventId
            
            UNION
            
            SELECT new com.itestra.eep.dtos.SeatAllocationDetailsDTO(
                prof,
                v.id,
                v.invitor.id,
                v.chair.id,
                v.accessLink
            )
            FROM Event e
            JOIN e.visitorParticipations v
            JOIN v.profile prof
            LEFT JOIN FETCH prof.authorities
            WHERE e.id = :eventId
            """)
    List<SeatAllocationDetailsDTO> findCurrentSeatAllocationsByEventId(@Param("eventId") UUID eventId);


    @Query("""
            SELECT p.employee.profile
            FROM Event e
            JOIN e.employeeParticipations p
            JOIN p.employee emp
            JOIN emp.profile prof
            LEFT JOIN FETCH prof.authorities
            WHERE e.id = :eventId
            
            UNION
            
            SELECT v.profile
            FROM Event e
            JOIN e.visitorParticipations v
            JOIN v.profile prof
            LEFT JOIN FETCH prof.authorities
            WHERE e.id = :eventId
            """)
    List<Profile> findAllParticipantProfilesByEventId(@Param("eventId") UUID eventId);

}
