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

func GetAllVoters() ([]models.Voter, error) {
	var voters []models.Voter
	err := database.PostgresDB.Order("created_at desc").Find(&voters).Error
	return voters, err
}

func UpdateVoterOTP(voter *models.Voter) error {
	return database.PostgresDB.Model(voter).Updates(map[string]interface{}{
		"current_otp":    voter.CurrentOTP,
		"otp_expires_at": voter.OTPExpiresAt,
	}).Error
}

func SaveVote(vote *models.Vote) error {
	return database.PostgresDB.Create(vote).Error
}
