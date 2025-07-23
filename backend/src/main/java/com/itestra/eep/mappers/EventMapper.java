package com.itestra.eep.mappers;

import com.itestra.eep.dtos.*;
import com.itestra.eep.enums.Role;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.Profile;
import com.itestra.eep.services.impl.EventServiceImpl;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {SchematicsMapper.class, FileMapper.class, EmployeeMapper.class})
public abstract class EventMapper {

    @Autowired
    EmployeeMapper employeeMapper;
    @Autowired
    @Lazy
    EventServiceImpl eventService;

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void createEventFromDto(EventCreateDTO dto, @MappingTarget Event event);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void updateEventFromDto(EventUpdateDTO dto, @MappingTarget Event event);

    public abstract EventCreateDTO toCreateDto(Event event);

    public abstract EventUpdateDTO toUpdateDto(Event event);

    public abstract List<EventDetailsDTO> toDetailsDto(List<Event> events, @Context Authentication authentication);

    @Mapping(source = "date", target = "status", qualifiedByName = "status")
    @Mapping(target = "notes", expression = "java(filterNotes(event, authentication))")
    @Mapping(target = "participantDetails", expression = "java(filterParticipantDetails(event, authentication))")
    public abstract EventDetailsDTO toDetailsDto(Event event, @Context Authentication authentication);

    @Named("status")
    public String status(LocalDateTime eventDate) {
        return eventDate.isAfter(LocalDateTime.now()) ? "upcoming" : "completed";
    }

    public String filterNotes(Event event, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().contains(Role.ADMIN);
        return isAdmin ? event.getNotes() : null;
    }

    public List<ProfileDetailsDTO> filterParticipantDetails(Event event, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().contains(Role.ADMIN);

        List<Profile> participantProfiles = eventService.findAllParticipantDetails(event.getId());

        return isAdmin ? employeeMapper.toProfileDetailsDto(participantProfiles) : new ArrayList<>();
    }


    @Mapping(source = "date", target = "status", qualifiedByName = "status")
    @Mapping(source = "fileEntities", target = "fileEntities")
    public abstract EventMinimalDetailsDTO toMinimalDetailsDto(Event event);

    public abstract List<EventMinimalDetailsDTO> toMinimalDetailsDto(List<Event> events);
}
