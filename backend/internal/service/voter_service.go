package service

import (
	"E-voting/internal/repository"
	"E-voting/internal/utils"
	"errors"
	"strconv"
	"time"
)

func InitiateVoterLogin(voterID, mobile, aadhaar string) (string, error) {
	voter, err := repository.FindVoterByID(voterID)
	if err != nil {
		return "", errors.New("voter not found")
	}

	if voter.Mobile != mobile || voter.AadhaarHash != utils.HashAadhaar(aadhaar) {
		return "", errors.New("invalid credentials")
	}

	minutesStr := repository.GetSettingValue("otp_validity_duration")
	minutes, err := strconv.Atoi(minutesStr)
	if err != nil || minutes <= 0 {
		minutes = 5
	}
	otp := utils.GenerateOTP()
	voter.CurrentOTP = otp

	voter.OTPExpiresAt = time.Now().Add(time.Duration(minutes) * time.Minute)

	err = repository.UpdateVoterOTP(voter)
	if err != nil {
		return "", err
	}

	return "OTP sent to your mobile number", nil
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
		return "", errors.New("OTP expired, please resend")
	}

	voter.CurrentOTP = ""
	repository.UpdateVoterOTP(voter)

	token, err := utils.GenerateJWT(voter.ID, "VOTER", "", false, voter.FullName, voter.VoterID, "")
	return token, err
}
