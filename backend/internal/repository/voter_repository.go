package repository

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
)

func CreateVoter(voter *models.Voter) error {
	return database.PostgresDB.Create(voter).Error
}

func FindVoterByHashAndID(hash, voterID string) (*models.Voter, error) {
	var voter models.Voter
	err := database.PostgresDB.
		Where("aadhaar_hash = ? AND voter_unique_id = ? AND is_active = true",
			hash, voterID).
		First(&voter).Error
	return &voter, err
}

func VoterExists(hash string) bool {
	var count int64
	database.PostgresDB.
		Model(&models.Voter{}).
		Where("aadhaar_hash = ?", hash).
		Count(&count)
	return count > 0
}
