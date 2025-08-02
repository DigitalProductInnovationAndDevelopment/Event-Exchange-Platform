package com.itestra.eep.dtos.constraintSolver;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;


@Getter
@Setter
public class ConstraintSolverDTO implements Serializable {

    @JsonIgnore
    int guestCount;

    @JsonIgnore
    LocalDate employeeEmploymentStartDate;

    @JsonProperty("ProfileID")
    UUID profileId;

    @JsonProperty("Vorname")
    String employeeProfileName;

    @JsonProperty("Nachname")
    String employeeProfileLastName;

    @JsonProperty("Geschlecht")
    String employeeProfileGender;

    @JsonProperty("last neighborhood")
    UUID[] lastNeighbourhood;

    @JsonProperty("Standort")
    String employeeLocation = null;

    @JsonProperty("TableNr")
    Object[] tableIds;

    @JsonProperty("Anzahl")
    public int getGuestCount() {
        return guestCount + 1;
    }

    @JsonProperty("Zugehörigkeit")
    public Integer getEmploymentDuration() {
        if (employeeEmploymentStartDate == null) {
            return null;
        }
        return (int) ChronoUnit.MONTHS.between(employeeEmploymentStartDate, LocalDate.now());
    }
}