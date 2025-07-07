package com.itestra.eep.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
@Table(schema = "organization", name = "visitor")
public class Visitor {

    @Id
    @Column(name = "profile_id", nullable = false)
    private UUID id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false, orphanRemoval = true)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(name = "confirmed")
    private Boolean confirmed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invitee_id")
    private Employee invitee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chair_id")
    private Chair chair;

    @Column(name = "access_link", nullable = false)
    private String accessLink;

}