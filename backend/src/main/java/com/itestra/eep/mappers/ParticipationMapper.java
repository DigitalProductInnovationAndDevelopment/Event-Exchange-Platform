package com.itestra.eep.mappers;

import com.itestra.eep.dtos.ConstraintSolverDTO;
import com.itestra.eep.dtos.ParticipationDetailsDTO;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.Participation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;


@Mapper(componentModel = "spring")
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
                    return new ParticipationDetailsDTO(
                            p.getId(),
                            p.getEmployee().getId(),
                            e.getId(),
                            p.getGuestCount(),
                            p.isConfirmed(),
                            e.getName(),
                            e.getEventType(),
                            e.getDate(),
                            e.getAddress(),
                            p.getEmployee().getProfile().getFullName(),
                            p.getEmployee().getProfile().getGitlabUsername(),
                            p.getEmployee().getProfile().getEmail()
                    );
                })
                .toList();
    }

}
