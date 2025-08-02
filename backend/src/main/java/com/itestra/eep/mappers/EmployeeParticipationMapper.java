package com.itestra.eep.mappers;

import com.itestra.eep.dtos.EmployeeParticipationDetailsDTO;
import com.itestra.eep.dtos.constraintSolver.ConstraintSolverDTO;
import com.itestra.eep.models.EmployeeParticipation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;
import java.util.UUID;


@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface EmployeeParticipationMapper {


    @Mapping(source = "employee.id", target = "profileId")
    @Mapping(source = "employee.profile.name", target = "employeeProfileName")
    @Mapping(source = "employee.profile.lastName", target = "employeeProfileLastName")
    @Mapping(source = "employee.profile.gender", target = "employeeProfileGender")
    @Mapping(source = "employee.employmentStartDate", target = "employeeEmploymentStartDate")
    @Mapping(source = "employee.location", target = "employeeLocation")
    @Mapping(target = "lastNeighbourhood", expression = "java(findPreviouslyMatchedEmployeeIds(employeeParticipation))")
    ConstraintSolverDTO toConstraintSolverDTO(EmployeeParticipation employeeParticipation);

    List<ConstraintSolverDTO> toConstraintSolverDTO(List<EmployeeParticipation> employeeParticipations);

    default UUID[] findPreviouslyMatchedEmployeeIds(EmployeeParticipation employeeParticipation) {
        return employeeParticipation.getEmployee().getPreviousMatches().toArray(UUID[]::new);
    }

    @Mapping(source = "id", target = "id")
    @Mapping(source = "employee.id", target = "employeeId")
    @Mapping(source = "event.id", target = "eventId")
    @Mapping(source = "event.name", target = "eventName")
    @Mapping(source = "event.date", target = "eventDate")
    @Mapping(source = "event.eventType", target = "eventType")
    @Mapping(source = "employee.profile.name", target = "name")
    @Mapping(source = "employee.profile.lastName", target = "lastName")
    @Mapping(source = "employee.profile.email", target = "email")
    @Mapping(source = "employee.profile.gitlabUsername", target = "gitlabUsername")
    @Mapping(source = "employee.profile.dietTypes", target = "dietTypes")
    @Mapping(source = "employee.location", target = "eventAddress")
    EmployeeParticipationDetailsDTO toEmployeeParticipationDetailsDTO(EmployeeParticipation employeeParticipation);

    List<EmployeeParticipationDetailsDTO> toEmployeeParticipationDetailsDTO(List<EmployeeParticipation> employeeParticipations);

}
