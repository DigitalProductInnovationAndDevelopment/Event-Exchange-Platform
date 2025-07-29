package com.itestra.eep.models;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "previous_matches", schema = "organization")
@AllArgsConstructor
@NoArgsConstructor
public class PreviousMatch {

    @EmbeddedId
    private PreviousMatchId id;

    @Getter
    @Setter
    @Embeddable
    @EqualsAndHashCode
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PreviousMatchId implements Serializable {

        @Column(name = "first_employee_id", nullable = false)
        private UUID firstEmployeeId;

        @Column(name = "second_employee_id", nullable = false)
        private UUID secondEmployeeId;

        @Column(name = "event_id", nullable = false)
        private UUID eventId;


    }
}