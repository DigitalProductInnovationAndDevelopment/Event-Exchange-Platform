package com.itestra.eep.events;

import com.itestra.eep.models.Profile;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UserLoginSuccessEvent {

    private final Profile userProfile;
    private final String ipAddress;

    public UserLoginSuccessEvent(Object source, Profile userProfile, String ipAddress) {
        this.userProfile = userProfile;
        this.ipAddress = ipAddress;
    }

}
