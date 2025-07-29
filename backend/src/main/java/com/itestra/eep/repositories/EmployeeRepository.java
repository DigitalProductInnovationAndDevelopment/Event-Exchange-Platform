package com.itestra.eep.repositories;

import com.itestra.eep.models.Employee;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    @Override
    @EntityGraph("Employee.profile_participations")
    @NonNull
    Optional<Employee> findById(@NonNull UUID id);

    @EntityGraph("Employee.profile_participations")
    List<Employee> findAllByOrderByProfileNameAsc();

    List<Employee> findByProfileEmailIn(Set<String> profile_email);

}
