package com.itestra.eep.repositories;

import com.itestra.eep.models.EmployeeParticipation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeParticipationRepository extends JpaRepository<EmployeeParticipation, UUID> {

    Optional<EmployeeParticipation> findByEmployee_IdAndEvent_Id(UUID employeeId, UUID eventId);


}