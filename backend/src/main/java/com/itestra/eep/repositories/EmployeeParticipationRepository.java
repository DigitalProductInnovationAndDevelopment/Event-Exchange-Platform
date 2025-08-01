package com.itestra.eep.repositories;

import com.itestra.eep.models.EmployeeParticipation;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface EmployeeParticipationRepository extends JpaRepository<EmployeeParticipation, UUID> {

    @Lock(LockModeType.PESSIMISTIC_READ)
    @EntityGraph(attributePaths = {"visitorParticipations"})
    Optional<EmployeeParticipation> findByEmployee_IdAndEvent_Id(UUID employeeId, UUID eventId);

    @EntityGraph(attributePaths = {"event"})
    @Query("select e from EmployeeParticipation e where e.id = ?1")
    @Lock(LockModeType.PESSIMISTIC_READ)
    Optional<EmployeeParticipation> findByIdWithReadLock(UUID participationId);

    @Query("select e.id from EmployeeParticipation e where e.id in ?1")
    Set<UUID> findExistingEmployeeParticipationIdsIn(List<UUID> ids);

}