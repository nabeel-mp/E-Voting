package repository

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
)

// CreateVoter inserts a new voter record into the PostgreSQL database
func CreateVoter(voter *models.Voter) error {
	return database.PostgresDB.Create(voter).Error
}

// FindVoterByID searches for a voter by their Government Voter ID string
func FindVoterByID(voterID string) (*models.Voter, error) {
	var voter models.Voter
	err := database.PostgresDB.Where("voter_id = ?", voterID).First(&voter).Error
	return &voter, err
}

// UpdateVoterOTP updates the OTP and expiry fields for the voter
func UpdateVoterOTP(voter *models.Voter) error {
	return database.PostgresDB.Model(voter).Updates(map[string]interface{}{
		"current_otp":    voter.CurrentOTP,
		"otp_expires_at": voter.OTPExpiresAt,
	}).Error
}
