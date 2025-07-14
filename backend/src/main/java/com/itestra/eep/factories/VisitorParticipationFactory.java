package com.itestra.eep.factories;

import com.itestra.eep.models.Employee;
import com.itestra.eep.models.EmployeeParticipation;
import com.itestra.eep.models.Profile;
import com.itestra.eep.models.VisitorParticipation;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static com.itestra.eep.enums.Role.VISITOR;

@Service
@Transactional(isolation = Isolation.SERIALIZABLE, rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
// TODO not well optimized. Batch insertions are not supported this way.
public class VisitorParticipationFactory {

    private static final String GUEST_NAME_TEMPLATE = "%s Guest: %d";
    private static final String ACCESS_LINK_TEMPLATE = "accesslink%d";

    private Profile createVisitorProfile(String parentEmployeeName, int guestIndexNumber) {
        return Profile.builder()
                .authorities(Set.of(VISITOR))
                .fullName(String.format(GUEST_NAME_TEMPLATE, parentEmployeeName, guestIndexNumber))
                .build();
    }

    public Set<VisitorParticipation> createVisitorParticipations(Employee employee,
                                                                 EmployeeParticipation participation,
                                                                 int guestCount,
                                                                 int startIndex) {
        Set<VisitorParticipation> newVisitors = new HashSet<>();
        String employeeName = employee.getProfile().getFullName();

        for (int i = 0; i < guestCount; i++) {
            int guestNumber = startIndex + i + 1;
            Profile visitorProfile = createVisitorProfile(employeeName, guestNumber);
            VisitorParticipation visitor = createVisitorParticipation(
                    visitorProfile, participation, startIndex + i);
            newVisitors.add(visitor);
        }

        return newVisitors;
    }

    public void addVisitorParticipations(EmployeeParticipation participation, Set<VisitorParticipation> visitors,
                                         int currentCount, int newCount) {
        int guestsToAdd = newCount - currentCount;
        Set<VisitorParticipation> newVisitors = createVisitorParticipations(
                participation.getEmployee(), participation, guestsToAdd, currentCount);
        visitors.addAll(newVisitors);
    }

    public void removeVisitorParticipations(Set<VisitorParticipation> visitors, int guestsToRemove) {
        List<VisitorParticipation> visitorList = new ArrayList<>(visitors);
        for (int i = 0; i < guestsToRemove && i < visitorList.size(); i++) {
            visitors.remove(visitorList.get(visitorList.size() - 1 - i));
        }
    }

    private VisitorParticipation createVisitorParticipation(Profile profile,
                                                            EmployeeParticipation parentParticipation,
                                                            int index) {
        VisitorParticipation visitor = new VisitorParticipation(profile,
                parentParticipation,
                String.format(ACCESS_LINK_TEMPLATE,
                        index));
        visitor.setEvent(parentParticipation.getEvent());
        visitor.setConfirmed(true);
        return visitor;
    }
}


