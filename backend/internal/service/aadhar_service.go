package service

import (
	"E-voting/internal/infrastructure/surepass"
	"E-voting/internal/models"
	"E-voting/internal/repository"
	"E-voting/internal/utils"
	"errors"
	"time"
)

func StartOTP(voterID uint, aadhaar string) error {
	client := surepass.NewClient()

	ref, err := client.SendOTP(aadhaar)
	if err != nil {
		return err
	}

	verification := &models.AadhaarVerification{
		VoterID:   voterID,
		Provider:  "SUREPASS",
		Reference: ref,
		Status:    "PENDING",
		ExpiresAt: time.Now().Add(5 * time.Minute),
	}

	return repository.CreateVerification(verification)
}

func VerifyOTP(voterID uint, otp string) (string, error) {
	client := surepass.NewClient()

	v, err := repository.FindPendingVerification(voterID)
	if err != nil {
		return "", errors.New("no pending verification")
	}

	if time.Now().After(v.ExpiresAt) {
		return "", errors.New("otp expired")
	}

	if err := client.VerifyOTP(v.Reference, otp); err != nil {
		return "", err
	}

	if err := repository.MarkVerified(v); err != nil {
		return "", err
	}

	// Issue Voting Permission Token
	return utils.GenerateVotingToken(voterID)
}
