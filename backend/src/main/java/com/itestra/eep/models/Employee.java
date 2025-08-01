package com.itestra.eep.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Formula;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

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
    private Set<EmployeeParticipation> participations = new HashSet<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "previous_matches",
            schema = "organization",
            joinColumns = @JoinColumn(name = "first_employee_id")
    )
    @Column(name = "second_employee_id")
    private Set<UUID> previousMatches = new LinkedHashSet<>();

    // TODO this is fetched EAGERLY for some reason during Employee Batch Upsert
    @Formula("(select count(*) from organization.employee_participation ep where ep.profile_id = profile_id)")
    @Basic(fetch = FetchType.LAZY)
    private int participationCount;

}