package com.itestra.eep.dtos;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.itestra.eep.enums.EventType;
import com.itestra.eep.serializers.LocalDateTimeDeserializer;
import com.itestra.eep.serializers.LocalDateTimeSerializer;
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

    Long participantCount;

    String status;

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    LocalDateTime date;

    List<FileDetailsDTO> fileEntities = new ArrayList<>();

    SchematicsDetailsDTO schematics;

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