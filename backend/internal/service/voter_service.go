package service

import (
	"E-voting/internal/repository"
	"E-voting/internal/utils"
	"errors"
	"strconv"
	"time"
)

func InitiateVoterLogin(voterID, aadhaar string) (string, error) {
	voter, err := repository.FindVoterByID(voterID)
	if err != nil {
		return "", errors.New("voter ID not found")
	}

	// Verify Aadhaar (Assuming stored exactly as registered)
	if voter.AadhaarNumber != aadhaar {
		return "", errors.New("invalid credentials provided")
	}

	if voter.IsBlocked {
		return "", errors.New("account is blocked. contact admin")
	}

	if !voter.IsVerified {
		return "", errors.New("account pending verification")
	}

	// Generate OTP
	minutesStr := repository.GetSettingValue("otp_validity_duration")
	minutes, err := strconv.Atoi(minutesStr)
	if err != nil || minutes <= 0 {
		minutes = 5
	}
	otp := utils.GenerateOTP()

	// Update Voter with OTP
	voter.CurrentOTP = otp
	voter.OTPExpiresAt = time.Now().Add(time.Duration(minutes) * time.Minute)

	if err := repository.UpdateVoterOTP(voter); err != nil {
		return "", errors.New("failed to generate OTP")
	}

	// In production, integrate SMS Gateway here.
	// For demo, we return it in the message or log it.
	return "OTP sent successfully (Simulated: " + otp + ")", nil
}

func VerifyVoterOTP(voterID, otp string) (string, error) {
	voter, err := repository.FindVoterByID(voterID)
	if err != nil {
		return "", errors.New("voter not found")
	}

	if voter.CurrentOTP != otp {
		return "", errors.New("incorrect OTP")
	}

	if time.Now().After(voter.OTPExpiresAt) {
		return "", errors.New("OTP expired, please request a new one")
	}

	// Clear OTP after success
	voter.CurrentOTP = ""
	repository.UpdateVoterOTP(voter)

	// Generate Token with Role "VOTER"
	token, err := utils.GenerateJWT(voter.ID, "VOTER", "vote", false, voter.FullName, voter.VoterID, "")
	return token, err
}
