package com.itestra.eep.repositories;

import com.itestra.eep.models.Chair;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ChairRepository extends JpaRepository<Chair, UUID> {

    void deleteChairsByEvent_Id(UUID eventId);

}
