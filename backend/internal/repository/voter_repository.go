package repository

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
)

func CreateVoter(voter *models.Voter) error {
	return database.PostgresDB.Create(voter).Error
}

func FindVoterByID(voterID string) (*models.Voter, error) {
	var voter models.Voter
	err := database.PostgresDB.Where("voter_id = ?", voterID).First(&voter).Error
	return &voter, err
}

func UpdateVoterOTP(voter *models.Voter) error {
	return database.PostgresDB.Model(voter).Updates(map[string]interface{}{
		"current_otp":    voter.CurrentOTP,
		"otp_expires_at": voter.OTPExpiresAt,
	}).Error
}
