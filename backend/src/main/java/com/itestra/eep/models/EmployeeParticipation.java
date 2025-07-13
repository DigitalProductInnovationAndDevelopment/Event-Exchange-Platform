package com.itestra.eep.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(schema = "organization", name = "employee_participation")
@NoArgsConstructor
public class EmployeeParticipation extends Participation {

    private int guestCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private Employee employee;

    @OneToMany(mappedBy = "invitor", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private Set<VisitorParticipation> visitorParticipations = new LinkedHashSet<>();

    public EmployeeParticipation(UUID id, int guestCount, Boolean confirmed, Employee employee, Event event, Chair chair) {
        super(id, event, chair, confirmed, null, null);
        this.guestCount = guestCount;
        this.employee = employee;
    }
}

