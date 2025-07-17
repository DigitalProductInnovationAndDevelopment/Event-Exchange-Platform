package com.itestra.eep.mappers;

import com.itestra.eep.dtos.FileDetailsDTO;
import com.itestra.eep.models.FileEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface FileMapper {

    FileDetailsDTO toFileDetailsDto(FileEntity file);

}