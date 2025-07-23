package com.itestra.eep.validators;

import com.itestra.eep.exceptions.EventCapacityExceededException;
import com.itestra.eep.models.EmployeeParticipation;
import com.itestra.eep.models.Event;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EventCapacityValidator {

    public void validateCapacity(Event event, int newGuestCount, EmployeeParticipation excludedExistingParticipation) {

        int currentParticipantCount = (event.getEmployeeParticipantCount() + event.getVisitorParticipantCount());

        int additionalParticipants = newGuestCount + 1; // +1 for the employee itself

        if (excludedExistingParticipation != null) {
            additionalParticipants -= (excludedExistingParticipation.getGuestCount() + 1);
        }

        if (currentParticipantCount + additionalParticipants > event.getCapacity()) {
            throw new EventCapacityExceededException(
                    event.getCapacity() - currentParticipantCount);
        }
    }

    public void validateBatchCapacity(Event event, List<EmployeeParticipation> participations) {

        int initialParticipantCount = (event.getEmployeeParticipantCount() + event.getVisitorParticipantCount());

        int additionalParticipants = participations.stream()
                .mapToInt(p -> p.getGuestCount() + 1)
                .sum();

        if (initialParticipantCount + additionalParticipants > event.getCapacity()) {
            throw new EventCapacityExceededException(
                    event.getCapacity() - initialParticipantCount);
        }
    }
}