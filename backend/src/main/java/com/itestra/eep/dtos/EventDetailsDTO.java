package com.itestra.eep.dtos;

import com.itestra.eep.enums.EventType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Getter
@Setter
public class EventDetailsDTO implements Serializable {

    UUID id;

    String name;

    @Enumerated(EnumType.STRING)
    EventType eventType;

    String description;

    Integer capacity;

    String address;

    Long participants;

    LocalDateTime date;

    List<FileDetailsDTO> fileEntities = new ArrayList<>();

    List<SchematicsDetailsDTO> schematics = new ArrayList<>();

    @Getter
    @Setter
    public static class AddressDetailsDTO implements Serializable {

        int postalCode;

        String country;

        String city;

        Double latitude;

        Double longitude;

        String addressLine1;

        String addressLine2;
    }
}