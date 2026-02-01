package service

import (
	"E-voting/internal/repository"
	"E-voting/internal/utils"
	"errors"
	"fmt"
	"strconv"
	"time"
)

func InitiateVoterLogin(voterID, aadhaar, district, block, LocalBodyName, wardNo string) (string, error) {
	voter, err := repository.FindVoterByID(voterID)
	if err != nil {
		return "", errors.New("voter ID not found")
	}

	// Verify Aadhaar (Assuming stored exactly as registered)
	if voter.AadhaarNumber != aadhaar {
		return "", errors.New("invalid credentials provided")
	}

	if voter.District != district {
		return "", errors.New("District does not match voter records")
	}

	if voter.Panchayath != LocalBodyName {
		return "", fmt.Errorf("local body name does not match. Registered in: %s", voter.Panchayath)
	}

	if voter.Block != "" {
		if voter.Block != block {
			return "", errors.New("block panchayat does not match voter records")
		}
	}

	if fmt.Sprintf("%v", voter.Ward) != fmt.Sprintf("%v", wardNo) {
		return "", fmt.Errorf("ward number does not match. Registered in Ward: %s", voter.Ward)
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

	err = utils.SendSms(voter.Mobile, otp)
	if err != nil {
		return "", errors.New("failed to send SMS OTP. Please try again later")
	}

	return "OTP sent successfully to your registered mobile number", nil
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
