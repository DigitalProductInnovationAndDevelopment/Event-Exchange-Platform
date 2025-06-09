package com.itestra.eep.repositories;

import com.itestra.eep.models.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    List<Employee> findByIdIn(List<UUID> ids);

}
