package com.itestra.eep.repositories;

import com.itestra.eep.models.Employee;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    List<Employee> findByProfileEmailIn(Set<String> profile_email);

    @EntityGraph("Employee.profile_participations")
    List<Employee> findAllByOrderByProfileNameAsc();

}
