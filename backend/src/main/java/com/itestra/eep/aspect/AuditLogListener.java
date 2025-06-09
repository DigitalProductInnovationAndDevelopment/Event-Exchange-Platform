package com.itestra.eep.aspect;

import com.itestra.eep.enums.OperationType;
import com.itestra.eep.events.UserLoginSuccessEvent;
import com.itestra.eep.models.AuditLog;
import com.itestra.eep.models.Profile;
import com.itestra.eep.repositories.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class AuditLogListener {

    private final AuditLogRepository auditLogRepository;

    @EventListener
    @Async
    public void handleUserLoginSuccess(UserLoginSuccessEvent event) {
        Profile profile = event.getUserProfile();

        AuditLog auditLog = new AuditLog();
        auditLog.setUid(profile.getId());
        auditLog.setOperationType(OperationType.LOGIN);
        auditLog.setIpAddress(event.getIpAddress());
        auditLog.setTimestamp(LocalDateTime.now());

        auditLogRepository.save(auditLog);
    }
}

