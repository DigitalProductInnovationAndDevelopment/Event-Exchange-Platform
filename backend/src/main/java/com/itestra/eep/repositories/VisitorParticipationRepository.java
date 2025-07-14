package com.itestra.eep.repositories;

import com.itestra.eep.models.VisitorParticipation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface VisitorParticipationRepository extends JpaRepository<VisitorParticipation, UUID> {


}