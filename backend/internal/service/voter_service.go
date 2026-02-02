package service

import (
	"E-voting/internal/repository"
	"E-voting/internal/utils"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
)

func matchLocalBody(dbName, inputName string) bool {
	db := strings.ToLower(strings.TrimSpace(dbName))
	input := strings.ToLower(strings.TrimSpace(inputName))

	if db == input {
		return true
	}
	if strings.Contains(input, db) || strings.Contains(db, input) {
		return true
	}
	return false
}

func matchWard(dbWard interface{}, inputWard string) bool {
	s1 := fmt.Sprintf("%v", dbWard)
	s2 := inputWard

	i1, err1 := strconv.Atoi(s1)
	i2, err2 := strconv.Atoi(s2)
	if err1 == nil && err2 == nil {
		return i1 == i2
	}

	return strings.TrimSpace(s1) == strings.TrimSpace(s2)
}

func InitiateVoterLogin(voterID, aadhaar, district, block, LocalBodyName, wardNo string) (string, error) {
	voter, err := repository.FindVoterByID(voterID)
	if err != nil {
		return "", errors.New("voter ID not found")
	}

	if strings.TrimSpace(voter.AadhaarNumber) != strings.TrimSpace(aadhaar) {
		return "", errors.New("invalid credentials provided")
	}

	if !strings.EqualFold(voter.District, district) {
		return "", fmt.Errorf("District mismatch. Records say: %s", voter.District)
	}

	if !matchLocalBody(voter.Panchayath, LocalBodyName) {
		return "", fmt.Errorf("Location mismatch. Records say: %s", voter.Panchayath)
	}

	if block != "" {
		if !strings.EqualFold(voter.Block, block) {
			return "", errors.New("Block Panchayat mismatch")
		}
	}

	if !matchWard(voter.Ward, wardNo) {
		return "", fmt.Errorf("Ward mismatch. Records say: %v", voter.Ward)
	}

	if voter.IsBlocked {
		return "", errors.New("Account is blocked. Please contact the administrator.")
	}

	if !voter.IsVerified {
		return "", errors.New("Your account is pending verification.")
	}

	// --- OTP Generation ---

	minutesStr := repository.GetSettingValue("otp_validity_duration")
	minutes, err := strconv.Atoi(minutesStr)
	if err != nil || minutes <= 0 {
		minutes = 5
	}
	otp := utils.GenerateOTP()

	voter.CurrentOTP = otp
	voter.OTPExpiresAt = time.Now().Add(time.Duration(minutes) * time.Minute)

	if err := repository.UpdateVoterOTP(voter); err != nil {
		return "", errors.New("Failed to generate OTP. Please try again.")
	}

	// Send SMS (Logs to terminal in Dev mode)
	err = utils.SendSms(voter.Mobile, otp)
	if err != nil {
		fmt.Printf(" SMS Failed (Dev Mode): OTP is %s\n", otp)
		return "OTP generated. (Check Console/SMS)", nil
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
