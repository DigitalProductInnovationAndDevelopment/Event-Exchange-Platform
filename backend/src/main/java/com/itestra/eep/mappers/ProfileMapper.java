package com.itestra.eep.mappers;

import com.itestra.eep.dtos.ProfileDetailsDTO;
import com.itestra.eep.dtos.ProfileMinimalDetailsDTO;
import com.itestra.eep.dtos.ProfileUpdateDTO;
import com.itestra.eep.models.Profile;
import org.mapstruct.*;

import java.util.List;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface ProfileMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateProfileFromDto(ProfileUpdateDTO ownProfileUpdateD, @MappingTarget Profile profile);

    @Mapping(target = "isVisitor", expression = "java(profile.getAuthorities().contains(Role.VISITOR))")
    ProfileMinimalDetailsDTO toProfileMinimalDetailsDto(Profile profile);

    List<ProfileMinimalDetailsDTO> toProfileMinimalDetailsDto(List<Profile> profile);

    ProfileDetailsDTO toProfileDetailsDto(Profile profile);

}