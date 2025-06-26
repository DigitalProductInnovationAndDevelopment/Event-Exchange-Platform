package com.itestra.eep.models;

import com.itestra.eep.enums.EmploymentType;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.util.*;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@Table(name = "employee", schema = "organization")
@AllArgsConstructor
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

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "employment_type", columnDefinition = "organization.employment_type")
    private EmploymentType employmentType;

    @OneToMany(mappedBy = "employee", orphanRemoval = true)
    private List<Participation> participations = new LinkedList<>();

    @ManyToMany
    @JoinTable(
            name = "employee_project",
            schema = "organization",
            joinColumns = @JoinColumn(name = "employee_id", referencedColumnName = "profile_id"),
            inverseJoinColumns = @JoinColumn(name = "project_id"))
    private Set<Project> projects = new LinkedHashSet<>();

}