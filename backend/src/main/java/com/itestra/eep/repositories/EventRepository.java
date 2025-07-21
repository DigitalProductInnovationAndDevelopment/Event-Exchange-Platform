package com.itestra.eep.repositories;

import com.itestra.eep.dtos.SeatAllocationDetailsDTO;
import com.itestra.eep.models.Event;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    boolean existsByIdAndEmployeeParticipations_Employee_Id(UUID eventId, UUID employeeId);

    boolean existsByIdAndVisitorParticipations_Profile_Id(UUID eventId, UUID visitorId);

    @Override
    @EntityGraph("Event.participations_files")
    List<Event> findAll();

    @EntityGraph("Event.participations_files")
    List<Event> findByVisitorParticipations_Profile_Id(UUID participantId);


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
    List<SeatAllocationDetailsDTO> findSeatAllocationsByEventId(@Param("eventId") UUID eventId);

    @Modifying
    @Query("""
                UPDATE EmployeeParticipation p
                SET p.chair.id = :chairId
                WHERE p.id = :participationId
            """)
    void updateEmployeeParticipationChairId(@Param("participationId") UUID participationId, @Param("chairId") UUID chairId);

    @Modifying
    @Query("""
                UPDATE VisitorParticipation v
                SET v.chair.id = :chairId
                WHERE v.id = :participationId
            """)
    void updateVisitorParticipationChairId(@Param("participationId") UUID participationId, @Param("chairId") UUID chairId);

}
