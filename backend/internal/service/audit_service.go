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

	loc, err := time.LoadLocation("Asia/Kolkata")
	var now time.Time
	if err != nil {
		now = time.Now().UTC().Add(5*time.Hour + 30*time.Minute)
	} else {
		now = time.Now().In(loc)
	}

	repository.SaveAuditLog(models.AuditLog{
		ActorID:   actorID,
		ActorRole: actorRole,
		Action:    action,
		TargetID:  targetID,
		Metadata:  metadata,
		Timestamp: now,
	})
}

func FetchAuditLogs() ([]models.AuditLog, error) {
	return repository.GetAuditLogs(100)
}
