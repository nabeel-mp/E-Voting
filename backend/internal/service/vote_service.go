package service

import (
	"E-voting/internal/models"
	"E-voting/internal/repository"
	"E-voting/internal/utils"
	"errors"
	"fmt"
)

func RegisterVoter(aadhaar, name, region string) (*models.Voter, error) {
	hash := utils.HashAadhaar(aadhaar)

	if repository.VoterExists(hash) {
		return nil, errors.New("voter already registered")
	}

	voter := &models.Voter{
		VoterUniqueID: generateVoterID(),
		AadhaarHash:   hash,
		Name:          name,
		Region:        region,
		IsActive:      true,
	}

	err := repository.CreateVoter(voter)
	return voter, err
}

func VoterLogin(aadhaar, voterID string) (string, error) {
	hash := utils.HashAadhaar(aadhaar)

	voter, err := repository.FindVoterByHashAndID(hash, voterID)
	if err != nil {
		return "", errors.New("invalid credentials")
	}

	return utils.GenerateJWT(voter.ID, "VOTER")
}

func generateVoterID() string {
	return fmt.Sprintf("VOTER-%d", utils.RandomNumber())
}
