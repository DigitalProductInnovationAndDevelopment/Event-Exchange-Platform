package com.itestra.eep.dtos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.itestra.eep.enums.DietaryPreference;
import com.itestra.eep.serializers.DateDeserializer;
import com.itestra.eep.serializers.DateSerializer;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.UUID;


@Getter
@Setter
public class ConstraintSolverDTO implements Serializable {

    @JsonIgnore
    int guestCount;

    @JsonProperty("ProfileId")
    UUID profileId;

    @JsonProperty("Anzahl")
    public int getGuestCount() {
        return guestCount + 1;
    }

    @JsonProperty("Vorname")
    String employeeProfileName;

    @JsonProperty("Nachname")
    String employeeProfileLastName;

    @JsonProperty("Projekt")
    String project = "";

    @JsonProperty("Geschlecht")
    String employeeProfileGender;

    DietaryPreference[] employeeProfileDietTypes;

    @JsonSerialize(using = DateSerializer.class)
    @JsonDeserialize(using = DateDeserializer.class)
    @JsonProperty("Zugehörigkeit")
    LocalDate employeeEmploymentStartDate;

    @JsonProperty("Standort")
    String employeeLocation = null;

    @JsonProperty("TableNr")
    Object[] tableIds;
}