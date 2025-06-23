package com.itestra.eep.mappers;

import com.itestra.eep.dtos.EmployeeCreateDTO;
import com.itestra.eep.dtos.EmployeeDetailsDTO;
import com.itestra.eep.dtos.EmployeeUpdateDTO;
import com.itestra.eep.dtos.ParticipationDetailsDTO;
import com.itestra.eep.models.Employee;
import com.itestra.eep.models.Event;
import com.itestra.eep.models.Participation;
import com.itestra.eep.models.UserRole;
import org.mapstruct.*;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void createEmployeeFromDto(EmployeeCreateDTO dto, @MappingTarget Employee employee);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEmployeeFromDto(EmployeeUpdateDTO dto, @MappingTarget Employee employee);

    @Mappings({
            @Mapping(source = "profile.participations", target = "participations")
    })
    EmployeeDetailsDTO toDetailsDto(Employee employee);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    List<EmployeeDetailsDTO> toDetailsDto(List<Employee> employee);

    default String map(UserRole userRole) {
        return userRole != null ? userRole.getRole().name() : null;
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
                    return new ParticipationDetailsDTO(
                            p.getGuestCount(),
                            p.isConfirmed(),
                            e.getId(),
                            e.getName(),
                            e.getEventType(),
                            e.getDate(),
                            e.getAddress()
                    );
                })
                .toList();
    }

}
