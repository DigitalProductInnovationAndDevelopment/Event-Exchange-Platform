package com.itestra.eep.mappers;

import com.itestra.eep.dtos.ProfileUpdateDTO;
import com.itestra.eep.models.Profile;
import org.mapstruct.*;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface ProfileMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateProfileFromDto(ProfileUpdateDTO ownProfileUpdateD, @MappingTarget Profile profile);

}