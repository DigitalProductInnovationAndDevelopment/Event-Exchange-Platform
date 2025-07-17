package com.itestra.eep.mappers;

import com.itestra.eep.dtos.ConstraintSolverDTO;
import com.itestra.eep.dtos.EmployeeParticipationDetailsDTO;
import com.itestra.eep.models.EmployeeParticipation;
import com.itestra.eep.models.Event;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Mappings;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static com.itestra.eep.enums.Role.ADMIN;


@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface EmployeeParticipationMapper {

    @Mappings({
            @Mapping(source = "employee.id", target = "profileId"),
            @Mapping(source = "employee.profile.fullName", target = "employeeProfileFullName"),
            @Mapping(source = "employee.profile.gender", target = "employeeProfileGender"),
            @Mapping(source = "employee.profile.dietTypes", target = "employeeProfileDietTypes"),
            @Mapping(source = "employee.employmentStartDate", target = "employeeEmploymentStartDate"),
            @Mapping(source = "employee.location", target = "employeeLocation"),
            @Mapping(source = "employee.employmentType", target = "employeeEmploymentType"),
    })
    ConstraintSolverDTO toConstraintSolverDTO(EmployeeParticipation employeeParticipation);

    List<ConstraintSolverDTO> toConstraintSolverDTO(List<EmployeeParticipation> employeeParticipations);


    default EmployeeParticipationDetailsDTO map(EmployeeParticipation employeeParticipation) {
        return this.map(List.of(employeeParticipation)).get(0);
    }

    default List<EmployeeParticipationDetailsDTO> map(List<EmployeeParticipation> employeeParticipations) {
        var auth = SecurityContextHolder.getContext().getAuthentication();

        // We make employee participations visible only to admins
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> ADMIN.name().equals(a.getAuthority()));

        if (!isAdmin || employeeParticipations == null || employeeParticipations.isEmpty()) {
            return List.of();
        }

        return employeeParticipations.stream()
                .map(p -> {
                    Event e = p.getEvent();
                    return EmployeeParticipationDetailsDTO.builder()
                            .id(p.getId())
                            .employeeId(p.getEmployee().getId())
                            .eventId(e.getId())
                            .guestCount(p.getGuestCount())
                            .confirmed(p.getConfirmed())
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
