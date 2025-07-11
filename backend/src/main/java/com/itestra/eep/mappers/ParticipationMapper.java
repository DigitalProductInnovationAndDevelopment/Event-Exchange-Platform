package com.itestra.eep.mappers;

import com.itestra.eep.dtos.ConstraintSolverDTO;
import com.itestra.eep.dtos.ParticipationDetailsDTO;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.Participation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Mappings;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;


@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ParticipationMapper {

    @Mappings({
            @Mapping(source = "employee.profile.fullName", target = "employeeProfileFullName"),
            @Mapping(source = "employee.profile.gender", target = "employeeProfileGender"),
            @Mapping(source = "employee.profile.dietTypes", target = "employeeProfileDietTypes"),
            @Mapping(source = "employee.employmentStartDate", target = "employeeEmploymentStartDate"),
            @Mapping(source = "employee.location", target = "employeeLocation"),
            @Mapping(source = "employee.employmentType", target = "employeeEmploymentType"),
    })
    ConstraintSolverDTO toConstraintSolverDTO(Participation participation);

    List<ConstraintSolverDTO> toConstraintSolverDTO(List<Participation> participations);


    default ParticipationDetailsDTO map(Participation participation) {
        return this.map(List.of(participation)).get(0);
    }

    default List<ParticipationDetailsDTO> map(List<Participation> participations) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> "ADMIN".equals(a.getAuthority()));

        if (!isAdmin || participations == null || participations.isEmpty()) {
            return List.of();
        }

        return participations.stream()
                .map(p -> {
                    Event e = p.getEvent();
                    return ParticipationDetailsDTO.builder()
                            .id(p.getId())
                            .employeeId(p.getEmployee().getId())
                            .eventId(e.getId())
                            .guestCount(p.getGuestCount())
                            .confirmed(p.isConfirmed())
                            .eventName(e.getName())
                            .eventType(e.getEventType())
                            .eventDate(e.getDate())
                            .eventAddress(e.getAddress())
                            .fullName(p.getEmployee().getProfile().getFullName())
                            .gitlabUsername(p.getEmployee().getProfile().getGitlabUsername())
                            .email(p.getEmployee().getProfile().getEmail())
                            .dietTypes(p.getEmployee().getProfile().getDietTypes())
                            .build();
                })
                .toList();
    }

}
