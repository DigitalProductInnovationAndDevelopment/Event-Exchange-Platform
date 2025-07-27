package com.itestra.eep.dtos;

import java.util.List;

public class ParticipationBatchResultDTO {
    private List<EmployeeParticipationDetailsDTO> createdParticipations;
    private List<EmployeeParticipationDetailsDTO> updatedParticipations;

    public ParticipationBatchResultDTO(List<EmployeeParticipationDetailsDTO> createdParticipations, List<EmployeeParticipationDetailsDTO> updatedParticipations) {
        this.createdParticipations = createdParticipations;
        this.updatedParticipations = updatedParticipations;
    }

    public List<EmployeeParticipationDetailsDTO> getCreatedParticipations() {
        return createdParticipations;
    }

    public void setCreatedParticipations(List<EmployeeParticipationDetailsDTO> createdParticipations) {
        this.createdParticipations = createdParticipations;
    }

    public List<EmployeeParticipationDetailsDTO> getUpdatedParticipations() {
        return updatedParticipations;
    }

    public void setUpdatedParticipations(List<EmployeeParticipationDetailsDTO> updatedParticipations) {
        this.updatedParticipations = updatedParticipations;
    }
}
