package com.itestra.eep.models;

import com.itestra.eep.enums.EventType;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(schema = "organization", name = "event")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private EventType eventType;

    @Column(name = "date")
    private LocalDateTime date;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "capacity", nullable = false)
    private int capacity;

    @Column(name = "address", nullable = false)
    private String address;

    @OneToMany(mappedBy = "event")
    private Set<Participation> participants;

    @OneToMany(mappedBy = "event", orphanRemoval = true)
    private List<FileEntity> fileEntities = new ArrayList<>();

    @OneToMany(mappedBy = "event", orphanRemoval = true)
    private List<Participation> participations = new ArrayList<>();

}

