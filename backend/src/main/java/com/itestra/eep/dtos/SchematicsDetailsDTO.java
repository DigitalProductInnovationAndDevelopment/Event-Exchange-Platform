package com.itestra.eep.dtos;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.itestra.eep.serializers.LocalDateTimeDeserializer;
import com.itestra.eep.serializers.LocalDateTimeSerializer;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;


public record SchematicsDetailsDTO(UUID id, UUID eventId, UUID overviewFileId,
                                   @JsonSerialize(using = LocalDateTimeSerializer.class)
                                   @JsonDeserialize(using = LocalDateTimeDeserializer.class)
                                   LocalDateTime createdAt,
                                   @JsonSerialize(using = LocalDateTimeSerializer.class)
                                   @JsonDeserialize(using = LocalDateTimeDeserializer.class)
                                   LocalDateTime updatedAt) implements Serializable {

}