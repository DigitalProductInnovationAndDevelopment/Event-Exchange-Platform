package com.itestra.eep.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
@Table(schema = "organization", name = "participation")
@AllArgsConstructor
@NoArgsConstructor
public class Participation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private int guestCount;

    private boolean confirmed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @ManyToOne
    private Event event;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chair_id")
    private Chair chair;

}

