package com.itestra.eep.dtos;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;


public record SchematicsDetailsDTO(UUID id, String name, UUID eventId, LocalDateTime createdAt,
                                   LocalDateTime updatedAt) implements Serializable {

}