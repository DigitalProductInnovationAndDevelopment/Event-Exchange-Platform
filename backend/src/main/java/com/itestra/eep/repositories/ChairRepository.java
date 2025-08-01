package com.itestra.eep.repositories;

import com.itestra.eep.models.Chair;
import com.itestra.eep.repositories.custom.ChairRepositoryCustom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ChairRepository extends JpaRepository<Chair, UUID>, ChairRepositoryCustom {

    @Modifying
    @Query("UPDATE EmployeeParticipation p SET p.chair.id = :chairId WHERE p.id = :participationId")
    void updateEmployeeParticipationChairId(@Param("participationId") UUID participationId, @Param("chairId") UUID chairId);

    @Modifying
    @Query("UPDATE VisitorParticipation v SET v.chair.id = :chairId WHERE v.id = :participationId")
    void updateVisitorParticipationChairId(@Param("participationId") UUID participationId, @Param("chairId") UUID chairId);

    @Modifying
    @Query("UPDATE EmployeeParticipation ep SET ep.chair.id = null WHERE ep.eventId = :eventId")
    void unsetAllEmployeeParticipationChairsByEventId(@Param("eventId") UUID eventId);

    @Modifying
    @Query("UPDATE VisitorParticipation vp SET vp.chair.id = null WHERE vp.eventId = :eventId")
    void unsetAllVisitorParticipationChairsByEventId(@Param("eventId") UUID eventId);


}
