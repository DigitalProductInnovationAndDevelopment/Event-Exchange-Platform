package com.itestra.eep.mappers;

import com.itestra.eep.dtos.EventCreateDTO;
import com.itestra.eep.dtos.EventDetailsDTO;
import com.itestra.eep.dtos.EventUpdateDTO;
import com.itestra.eep.dtos.FileDetailsDTO;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.FileEntity;
import com.itestra.eep.models.Participation;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface EventMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void createEventFromDto(EventCreateDTO dto, @MappingTarget Event event);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEventFromDto(EventUpdateDTO dto, @MappingTarget Event event);

    EventCreateDTO toCreateDto(Event event);

    EventUpdateDTO toUpdateDto(Event event);

    List<EventDetailsDTO> toDetailsDto(List<Event> events);

    EventDetailsDTO toDetailsDto(Event event);

    default Long map(Set<Participation> participants) {
        return participants.stream().filter(Participation::isConfirmed).count();
    }

    default List<FileDetailsDTO> map(List<FileEntity> fileEntities) {
        return fileEntities.stream().map(fileEntity ->
                new FileDetailsDTO(fileEntity.getFileId(), fileEntity.getName(), fileEntity.getContentType())).collect(Collectors.toList());
    }

}
