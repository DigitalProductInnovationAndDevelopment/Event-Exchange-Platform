package com.itestra.eep.dtos;

import com.itestra.eep.models.Profile;
import lombok.Getter;

import java.util.UUID;


@Getter
public final class SeatAllocationDetailsDTO {
    private final ProfileDetailsDTO profile;
    private final UUID participationId;
    private final UUID invitorId;
    private final UUID chairId;
    private final String accessLink;

    /**
     * @param invitorId  exists if coming from visitors relation
     * @param accessLink exists if coming from visitors relation
     */
    public SeatAllocationDetailsDTO(Profile profile, UUID participationId, UUID invitorId, UUID chairId, String accessLink) {
        this.profile = new ProfileDetailsDTO(
                profile.getId(),
                profile.getFullName(),
                profile.getGender(),
                profile.getGitlabUsername(),
                profile.getEmail(),
                profile.getDietTypes(),
                profile.getAuthorities()
        );
        this.participationId = participationId;
        this.invitorId = invitorId;
        this.chairId = chairId;
        this.accessLink = accessLink;
    }


}
