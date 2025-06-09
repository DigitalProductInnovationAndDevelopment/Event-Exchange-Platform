package com.itestra.eep.models;

import com.itestra.eep.enums.EmploymentType;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
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
public class Employee {

    @Id
    @Column(name = "profile_id", nullable = false)
    private UUID id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(name = "employment_start_date")
    private LocalDate employmentStartDate;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "employment_type", columnDefinition = "organization.employment_type")
    private EmploymentType employmentType;

    @ManyToMany
    @JoinTable(
            name = "employee_project",
            schema = "organization",
            joinColumns = @JoinColumn(name = "employee_id", referencedColumnName = "profile_id"),
            inverseJoinColumns = @JoinColumn(name = "project_id"))
    private Set<Project> projects = new LinkedHashSet<>();

}