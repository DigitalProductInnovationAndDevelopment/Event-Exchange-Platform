package com.itestra.eep.models;

import com.itestra.eep.enums.EventType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.*;

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

    @Column(name = "capacity", nullable = false)
    private int capacity;

    @Column(name = "address", nullable = false)
    private String address;

    @OneToMany(mappedBy = "event", orphanRemoval = true, fetch = FetchType.LAZY)
    private List<FileEntity> fileEntities = new ArrayList<>();

    @OneToMany(mappedBy = "event", orphanRemoval = true, fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @OrderBy("id ASC")
    private List<EmployeeParticipation> employeeParticipations = new ArrayList<>();

    @OneToMany(mappedBy = "event", orphanRemoval = true, fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @OrderBy("id ASC")
    private List<VisitorParticipation> visitorParticipations = new ArrayList<>();

    @OneToMany(mappedBy = "event", orphanRemoval = true, fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Set<Chair> chairs = new LinkedHashSet<>();

    @OneToOne(mappedBy = "event", orphanRemoval = true)
    private Schematics schematics;

    @Transient
    public int getParticipantCount() {
        return getParticipantCount(null);
    }

    @Transient
    public int getParticipantCount(EmployeeParticipation excludeCertainEmployeeParticipation) {
        return employeeParticipations.stream()
                .filter(p -> excludeCertainEmployeeParticipation == null || !p.getId().equals(excludeCertainEmployeeParticipation.getId()))
                .mapToInt(p -> p.getGuestCount() + 1)
                .sum();
    }

}