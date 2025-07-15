package com.itestra.eep.repositories;

import com.itestra.eep.models.Chair;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ChairRepository extends JpaRepository<Chair, UUID> {

    @Override
    void deleteAllInBatch(Iterable<Chair> entities);

}
