package com.itestra.eep.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.*;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@Table(name = "employee", schema = "organization")
@AllArgsConstructor
@NamedEntityGraph(name = "Employee.profile_participations",
        attributeNodes = {@NamedAttributeNode("profile"), @NamedAttributeNode("participations")}
)
public class Employee {

    @Id
    @Column(name = "profile_id", nullable = false)
    private UUID id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false, orphanRemoval = true)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(name = "employment_start_date")
    private LocalDate employmentStartDate;

    @Column(name = "location", nullable = false)
    private String location;

    @OneToMany(mappedBy = "employee", orphanRemoval = true, fetch = FetchType.LAZY)
    private List<EmployeeParticipation> participations = new LinkedList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "previous_matches",
            schema = "organization",
            joinColumns = @JoinColumn(name = "first_employee_id"),
            inverseJoinColumns = @JoinColumn(name = "second_employee_id"))
    private Set<Employee> employees = new LinkedHashSet<>();

}