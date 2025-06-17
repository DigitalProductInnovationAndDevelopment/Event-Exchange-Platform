package com.itestra.eep.services;

import com.itestra.eep.dtos.SchematicsCreateDTO;
import com.itestra.eep.dtos.SchematicsUpdateDTO;
import com.itestra.eep.models.Schematics;

import java.util.UUID;

public interface SchematicsService {

    Schematics findById(UUID id);

    Schematics create(SchematicsCreateDTO dto);

    Schematics update(UUID schemaId, SchematicsUpdateDTO dto);

    void delete(UUID id);

}
