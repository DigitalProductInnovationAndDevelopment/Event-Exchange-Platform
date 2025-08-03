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

    @MapsId("firstEmployeeId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "first_employee_id")
    private Employee employee;

    @Getter
    @Setter
    @Embeddable
    @EqualsAndHashCode
    @NoArgsConstructor
    public static class PreviousMatchId implements Serializable {

        @Column(name = "first_employee_id", nullable = false)
        private UUID firstEmployeeId;

        @Column(name = "second_employee_id", nullable = false)
        private UUID secondEmployeeId;

        @Column(name = "event_id", nullable = false)
        private UUID eventId;

        public PreviousMatchId(UUID firstEmployeeId, UUID secondEmployeeId, UUID eventId) {
            this.firstEmployeeId = firstEmployeeId;
            this.secondEmployeeId = secondEmployeeId;
            this.eventId = eventId;
        }

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "event_id", nullable = false, insertable = false, updatable = false)
        private Event event;

        public void setEvent(Event event) {
            this.event = event;
            this.eventId = event.getId();
        }
    }
}