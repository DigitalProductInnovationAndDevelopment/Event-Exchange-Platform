package com.itestra.eep.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;
import java.util.UUID;

@Entity
@Getter
@Setter
@jakarta.persistence.Table(schema = "organization", name = "table")
public class Table {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    private Event event;

    @OneToMany(mappedBy = "table")
    private Set<Chair> chairs;
}



