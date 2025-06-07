package com.itestra.eep.models;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.*;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(schema = "organization", name = "project")
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "abbreviation", unique = true, length = 10)
    private String abbreviation;

    @Column(name = "project_name", nullable = false, unique = true)
    private String projectName;

    @ManyToMany(mappedBy = "projects")
    private Set<Employee> employees = new LinkedHashSet<>();

}

