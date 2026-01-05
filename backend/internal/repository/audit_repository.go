package repository

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"context"
	"time"
)

func SaveAuditLog(log models.AuditLog) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := database.MongoDB.Collection("audit_logs")

	_, _ = collection.InsertOne(ctx, log)
}

func GetAuditLogs(limit int) ([]models.AuditLog, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := database.MongoDB.
		Collection("audit_logs").
		Find(ctx, map[string]interface{}{})

	if err != nil {
		return nil, err
	}

	var logs []models.AuditLog
	err = cursor.All(ctx, &logs)
	return logs, err
}
