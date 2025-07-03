package com.itestra.eep.repositories;

import com.itestra.eep.models.Event;
import com.itestra.eep.models.Participation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ParticipationRepository extends JpaRepository<Participation, UUID> {

    Optional<Participation> findByEmployee_IdAndEvent_Id(UUID employeeId, UUID eventId);

    @Query("SELECT COALESCE(SUM(p.guestCount + 1), 0) FROM Participation p " +
            "WHERE p.event = :event " +
            "AND (:excludeParticipationId IS NULL OR p.id <> :excludeParticipationId)")
    Integer sumGuestCounts(@Param("event") Event event,
                           @Param("excludeParticipationId") UUID excludeParticipationId);

}
