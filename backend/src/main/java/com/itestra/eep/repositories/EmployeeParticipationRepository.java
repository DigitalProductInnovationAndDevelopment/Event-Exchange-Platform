package com.itestra.eep.repositories;

import com.itestra.eep.models.EmployeeParticipation;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeParticipationRepository extends JpaRepository<EmployeeParticipation, UUID> {

    @Lock(LockModeType.PESSIMISTIC_READ)
    Optional<EmployeeParticipation> findByEmployee_IdAndEvent_Id(UUID employeeId, UUID eventId);


}