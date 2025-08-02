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
    @NonNull
    @EntityGraph(attributePaths = {"profile", "participations", "participationCount"})
    Optional<Employee> findById(@NonNull UUID id);

    @EntityGraph(attributePaths = {"profile.authorities", "participations", "participationCount"})
    List<Employee> findAllByOrderByProfileNameAsc();

    @EntityGraph(attributePaths = {"profile.authorities", "participations", "participationCount"})
    List<Employee> findByProfileEmailIn(Set<String> profile_email);

}
