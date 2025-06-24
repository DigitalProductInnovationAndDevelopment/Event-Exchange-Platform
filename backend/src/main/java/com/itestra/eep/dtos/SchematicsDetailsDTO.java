package com.itestra.eep.dtos;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;


public record SchematicsDetailsDTO(UUID id, UUID eventId, UUID overviewFileId, LocalDateTime createdAt,
                                   LocalDateTime updatedAt) implements Serializable {

}