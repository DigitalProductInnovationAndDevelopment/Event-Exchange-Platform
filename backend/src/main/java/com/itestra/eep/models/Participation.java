package com.itestra.eep.models;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
@Table(schema = "organization", name = "participation")
public class Participation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private int guestCount;

    private boolean confirmed;

    @OneToOne
    private Profile person;

    @ManyToOne
    private Event event;
}

