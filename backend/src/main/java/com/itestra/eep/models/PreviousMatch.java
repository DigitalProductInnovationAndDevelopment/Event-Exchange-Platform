package com.itestra.eep.models;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "previous_matches", schema = "organization")
public class PreviousMatch {

    @EmbeddedId
    private PreviousMatchId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @Getter
    @Setter
    @Embeddable
    @EqualsAndHashCode
    public static class PreviousMatchId implements Serializable {

        @Column(name = "first_employee_id", nullable = false)
        private UUID firstEmployeeId;

        @Column(name = "second_employee_id", nullable = false)
        private UUID secondEmployeeId;

    }
}