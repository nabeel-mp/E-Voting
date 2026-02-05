package service

import (
	"E-voting/internal/repository"
	"E-voting/internal/utils"
	"errors"
	"fmt"
	"strconv"
	"strings"
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

	mobile := strings.TrimSpace(voter.Mobile)
	if !strings.HasPrefix(mobile, "+") {
		mobile = "+91" + mobile
	}

	return mobile, nil
}

func VerifyVoterFirebase(voterID, firebaseToken string) (string, error) {
	// 1. Verify the Token with Firebase Admin SDK
	token, err := utils.VerifyFirebaseToken(firebaseToken)
	if err != nil {
		return "", fmt.Errorf("invalid firebase token: %v", err)
	}

	// 2. Get the phone number from the token claims
	firebasePhone, found := token.Claims["phone_number"].(string)
	if !found {
		return "", errors.New("firebase token does not contain phone number")
	}

	// 3. Find the Voter
	voter, err := repository.FindVoterByID(voterID)
	if err != nil {
		return "", errors.New("voter not found")
	}

	// 4. SECURITY CHECK: Ensure the phone verified by Firebase matches the Voter's registered phone
	storedMobile := strings.TrimSpace(voter.Mobile)
	if !strings.HasPrefix(storedMobile, "+") {
		storedMobile = "+91" + storedMobile
	}

	if storedMobile != firebasePhone {
		return "", errors.New("phone number mismatch: verified phone does not match registered voter phone")
	}

	// 5. Generate Internal App JWT
	appToken, err := utils.GenerateJWT(voter.ID, "VOTER", "vote", false, voter.FullName, voter.VoterID, "")
	return appToken, err
}
