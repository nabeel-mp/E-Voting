package service

import (
	"E-voting/internal/repository"
	"E-voting/internal/utils"
	"errors"
	"time"
)

// Step 1: Login with credentials and generate OTP
func InitiateVoterLogin(voterID, mobile, aadhaar string) (string, error) {
	// 1. Find voter by VoterID
	voter, err := repository.FindVoterByID(voterID)
	if err != nil {
		return "", errors.New("voter not found")
	}

	// 2. Verify Mobile and Aadhaar Hash
	if voter.Mobile != mobile || voter.AadhaarHash != utils.HashAadhaar(aadhaar) {
		return "", errors.New("invalid credentials")
	}

	// 3. Generate 6-digit OTP and set expiry (5 minutes)
	otp := utils.GenerateOTP()
	voter.CurrentOTP = otp
	voter.OTPExpiresAt = time.Now().Add(5 * time.Minute)

	// 4. Save OTP to DB
	err = repository.UpdateVoterOTP(voter)
	if err != nil {
		return "", err
	}

	// NOTE: In production, call an SMS API here to send 'otp' to voter.Mobile
	return "OTP sent to your mobile number", nil
}

// Step 2: Verify OTP and provide JWT
func VerifyVoterOTP(voterID, otp string) (string, error) {
	voter, err := repository.FindVoterByID(voterID)
	if err != nil {
		return "", errors.New("voter not found")
	}

	// Check if OTP matches
	if voter.CurrentOTP != otp {
		return "", errors.New("incorrect OTP")
	}

	// Check if expired
	if time.Now().After(voter.OTPExpiresAt) {
		return "", errors.New("OTP expired, please resend")
	}

	// Clear OTP after successful use
	voter.CurrentOTP = ""
	repository.UpdateVoterOTP(voter)

	// Generate Voting JWT (valid for voting session)
	token, err := utils.GenerateJWT(voter.ID, "VOTER")
	return token, err
}
