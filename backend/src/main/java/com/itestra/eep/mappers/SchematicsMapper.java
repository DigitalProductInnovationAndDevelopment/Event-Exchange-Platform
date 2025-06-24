package com.itestra.eep.mappers;

import com.itestra.eep.dtos.SchematicsCreateDTO;
import com.itestra.eep.dtos.SchematicsDetailsDTO;
import com.itestra.eep.dtos.SchematicsUpdateDTO;
import com.itestra.eep.models.Schematics;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface SchematicsMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateSchematicsFromDto(SchematicsUpdateDTO dto, @MappingTarget Schematics schematics);

    SchematicsCreateDTO toSchematicsCreateDTO(Schematics schematics);

    @Mapping(source = "event.id", target = "eventId")
    @Mapping(source = "overview.fileId", target = "overviewFileId")
    SchematicsDetailsDTO toSchematicsDetailsDTO(Schematics schematics);

}
