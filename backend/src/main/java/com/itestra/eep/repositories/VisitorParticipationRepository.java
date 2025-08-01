package com.itestra.eep.repositories;

import com.itestra.eep.models.Profile;
import com.itestra.eep.models.VisitorParticipation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface VisitorParticipationRepository extends JpaRepository<VisitorParticipation, UUID> {

    @Query("select v.profile from VisitorParticipation v where v.accessLink = ?1 and v.event.date >= ?2")
    Optional<Profile> findByAccessLink(String accessLink, LocalDateTime now);

    @Query("select e.id from VisitorParticipation e where e.id in ?1")
    Set<UUID> findExistingVisitorParticipationIdsIn(List<UUID> ids);

}