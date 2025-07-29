package com.itestra.eep.repositories;

import com.itestra.eep.models.Chair;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Repository
public interface ChairRepository extends JpaRepository<Chair, UUID> {

    @Override
    void deleteAllInBatch(Iterable<Chair> entities);

    @Query("select c.id from Chair c where c.id in ?1")
    Set<UUID> findAllByIdIn(List<UUID> ids);

}
