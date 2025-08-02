package com.itestra.eep.models;

import com.itestra.eep.enums.EventType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.LazyGroup;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(schema = "organization", name = "event")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type")
    private EventType eventType;

    @Column(name = "date")
    private LocalDateTime date;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "notes")
    private String notes;

    @Column(name = "capacity", nullable = false)
    private int capacity;

    @Column(name = "address", nullable = false)
    private String address;

    @OneToMany(mappedBy = "event", orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<FileEntity> fileEntities = new HashSet<>();

    @OneToMany(mappedBy = "event", orphanRemoval = true, fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @OrderBy("id ASC")
    private Set<EmployeeParticipation> employeeParticipations = new HashSet<>();

    @OneToMany(mappedBy = "event", orphanRemoval = true, fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @OrderBy("id ASC")
    private Set<VisitorParticipation> visitorParticipations = new HashSet<>();

    @OneToOne(mappedBy = "event", orphanRemoval = true)
    private Schematics schematics;

    @Formula("(select count(*) from organization.employee_participation ep where ep.event_id = id)")
    @Basic(fetch = FetchType.LAZY)
    @LazyGroup("participantCounts")
    private int employeeParticipantCount;

    @Formula("(select count(*) from organization.visitor_participation vp where vp.event_id = id)")
    @Basic(fetch = FetchType.LAZY)
    @LazyGroup("participantCounts")
    private int visitorParticipantCount;

    public int getParticipantCount() {
        return employeeParticipantCount + visitorParticipantCount;
    }

}