package com.itestra.eep.repositories;

import com.itestra.eep.models.Participation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ParticipationRepository extends JpaRepository<Participation, UUID> {

    Optional<Participation> findByEmployee_IdAndEvent_Id(UUID employeeId, UUID eventId);

}
