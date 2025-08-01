package com.itestra.eep.dtos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.itestra.eep.enums.EventType;
import com.itestra.eep.enums.Role;
import com.itestra.eep.serializers.LocalDateTimeDeserializer;
import com.itestra.eep.serializers.LocalDateTimeSerializer;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

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

    @JsonIgnore
    String notes;

    Integer capacity;

    String address;

    Long employeeParticipantCount;

    Long visitorParticipantCount;

    String status;

    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    LocalDateTime date;

    List<FileDetailsDTO> fileEntities = new ArrayList<>();

    List<ProfileMinimalDetailsDTO> participantDetails = new ArrayList<>();

    SchematicsDetailsDTO schematics;

    @JsonProperty
    public String getNotes() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication.getAuthorities().contains(Role.ADMIN);
        return isAdmin ? this.notes : null;
    }

}