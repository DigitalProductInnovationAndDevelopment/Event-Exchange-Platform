package com.itestra.eep.mappers;

import com.itestra.eep.dtos.EventCreateDTO;
import com.itestra.eep.dtos.EventDetailsDTO;
import com.itestra.eep.dtos.EventUpdateDTO;
import com.itestra.eep.models.Event;
import org.mapstruct.*;

import java.time.LocalDateTime;
import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {SchematicsMapper.class, FileMapper.class})
public interface EventMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void createEventFromDto(EventCreateDTO dto, @MappingTarget Event event);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEventFromDto(EventUpdateDTO dto, @MappingTarget Event event);

    EventCreateDTO toCreateDto(Event event);

    EventUpdateDTO toUpdateDto(Event event);

    List<EventDetailsDTO> toDetailsDto(List<Event> events);

    @Mappings({
            @Mapping(source = "date", target = "status", qualifiedByName = "status")
    })
    EventDetailsDTO toDetailsDto(Event event);

    @Named("status")
    default String status(LocalDateTime eventDate) {
        return eventDate.isAfter(LocalDateTime.now()) ? "upcoming" : "completed";
    }


}
