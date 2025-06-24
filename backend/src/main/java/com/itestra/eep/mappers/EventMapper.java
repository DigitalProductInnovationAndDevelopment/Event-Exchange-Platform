package com.itestra.eep.mappers;

import com.itestra.eep.dtos.EventCreateDTO;
import com.itestra.eep.dtos.EventDetailsDTO;
import com.itestra.eep.dtos.EventUpdateDTO;
import com.itestra.eep.dtos.FileDetailsDTO;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.FileEntity;
import com.itestra.eep.models.Participation;
import org.mapstruct.*;

import java.time.LocalDateTime;
import java.util.List;

@Mapper(componentModel = "spring", uses = SchematicsMapper.class)
public interface EventMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void createEventFromDto(EventCreateDTO dto, @MappingTarget Event event);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEventFromDto(EventUpdateDTO dto, @MappingTarget Event event);

    EventCreateDTO toCreateDto(Event event);

    EventUpdateDTO toUpdateDto(Event event);

    List<EventDetailsDTO> toDetailsDto(List<Event> events);

    @Mappings({
            @Mapping(source = "participations", target = "participantCount", qualifiedByName = "countConfirmed"),
            @Mapping(source = "date", target = "status", qualifiedByName = "status")
    })
    EventDetailsDTO toDetailsDto(Event event);

    FileDetailsDTO toFileDetailsDto(FileEntity file);

    @Named("countConfirmed")
    default Long map(List<Participation> participations) {
        return participations.stream().filter(Participation::isConfirmed).count();
    }

    @Named("status")
    default String status(LocalDateTime eventDate) {
        return eventDate.isAfter(LocalDateTime.now()) ? "upcoming" : "completed";
    }


}
