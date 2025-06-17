package com.itestra.eep.repositories;

import com.itestra.eep.models.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    List<Employee> findByIdIn(List<UUID> ids);

    Optional<Employee> findByProfile_Id(UUID profileId);

}
