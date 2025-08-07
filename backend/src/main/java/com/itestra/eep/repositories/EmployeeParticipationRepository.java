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

    @Query("select pm.id.firstEmployeeId, pm.id.secondEmployeeId " +
            "from PreviousMatch pm " +
            "where pm.id.eventId = ?2 " +
            "and exists (select 1 from PreviousMatch pm2 " +
            "            where pm2.id.eventId in ?1 " +
            "            and pm.id.secondEmployeeId = pm2.id.firstEmployeeId " +
            "            and pm.id.firstEmployeeId = pm2.id.secondEmployeeId)")
    List<Object[]> findEmployeePairsOfCurrentEventThatAreAcquaintedFromPreviousEvents(Set<UUID> previousEventIds, UUID currentEventId);

    @Query("select e.employee.id from EmployeeParticipation e where e.eventId = ?1")
    Set<UUID> findAllEmployeeParticipantIdsOfEvent(UUID eventId);

}