package com.itestra.eep.repositories;

import com.itestra.eep.models.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    boolean existsByIdAndParticipations_Employee_Id(UUID eventId, UUID participantId);

    List<Event> findByParticipations_Employee_Id(UUID participantId);

}
