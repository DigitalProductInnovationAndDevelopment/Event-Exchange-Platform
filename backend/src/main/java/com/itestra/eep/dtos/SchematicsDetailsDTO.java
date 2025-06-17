package com.itestra.eep.dtos;

import java.io.Serializable;
import java.util.UUID;


public record SchematicsDetailsDTO(UUID id, String name, UUID eventId) implements Serializable {

}