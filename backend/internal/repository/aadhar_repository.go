package repository

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"time"
)

func CreateVerification(v *models.AadhaarVerification) error {
	return database.PostgresDB.Create(v).Error
}

func FindPendingVerification(voterID uint) (*models.AadhaarVerification, error) {
	var v models.AadhaarVerification
	err := database.PostgresDB.
		Where("voter_id = ? AND status = 'PENDING'", voterID).
		Order("created_at desc").
		First(&v).Error
	return &v, err
}

func MarkVerified(v *models.AadhaarVerification) error {
	now := time.Now()
	return database.PostgresDB.Model(v).Updates(map[string]interface{}{
		"status":      "VERIFIED",
		"verified_at": &now,
	}).Error
}
