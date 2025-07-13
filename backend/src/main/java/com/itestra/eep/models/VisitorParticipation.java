package com.itestra.eep.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(schema = "organization", name = "visitor_participation")
@NoArgsConstructor
@AllArgsConstructor
public class VisitorParticipation extends Participation {

    @OneToOne(fetch = FetchType.LAZY, optional = false, orphanRemoval = true, cascade = CascadeType.ALL)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invitor_participation_id")
    private EmployeeParticipation invitor;

    @Column(name = "access_link", nullable = false)
    private String accessLink;

}