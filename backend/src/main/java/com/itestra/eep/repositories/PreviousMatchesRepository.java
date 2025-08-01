package com.itestra.eep.repositories;

import com.itestra.eep.models.PreviousMatch;
import com.itestra.eep.repositories.custom.PreviousMatchesRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PreviousMatchesRepository extends JpaRepository<PreviousMatch, PreviousMatch.PreviousMatchId>, PreviousMatchesRepositoryCustom {

    @Modifying(clearAutomatically = true)
    @Query("delete from PreviousMatch p where p.id.eventId = ?1")
    void deleteAllByEventId(UUID eventId);

    @Modifying(clearAutomatically = true)
    @Query("delete from PreviousMatch p where p.id.eventId = ?1 and (p.id.firstEmployeeId = ?2 or p.id.secondEmployeeId = ?2)")
    void deleteByEventIdAndEmployeeId(UUID eventId, UUID employeeId);

}