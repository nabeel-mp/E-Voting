package service

import (
	"E-voting/internal/models"
	"E-voting/internal/repository"
	"time"
)

func LogAdminAction(
	actorID uint,
	actorRole string,
	action string,
	targetID uint,
	metadata map[string]interface{},
) {
	repository.SaveAuditLog(models.AuditLog{
		ActorID:   actorID,
		ActorRole: actorRole,
		Action:    action,
		TargetID:  targetID,
		Metadata:  metadata,
		Timestamp: time.Now().UTC(),
	})
}

func FetchAuditLogs() ([]models.AuditLog, error) {
	return repository.GetAuditLogs(100)
}
