package api

import (
	"E-voting/internal/repository"
	"E-voting/internal/service"
	"E-voting/internal/utils"
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type VoterLoginReq struct {
	VoterID       string `json:"voter_id"`
	Aadhaar       string `json:"aadhaar"`
	District      string `json:"district"`
	Block         string `json:"block"`
	LocalBodyType string `json:"local_body_type"`
	LocalBodyName string `json:"local_body_name"`
	WardNo        string `json:"ward_no"`
}

type OTPVerifyReq struct {
	VoterID       string `json:"voter_id"`
	FirebaseToken string `json:"firebase_token"`
}

// 1. Check DB and Return Phone Number
func VoterLogin(c *fiber.Ctx) error {
	if repository.GetSettingValue("maintenance_mode") == "true" {
		return utils.Error(c, 503, "System is currently under maintenance.")
	}

	var req VoterLoginReq
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	req.VoterID = strings.TrimSpace(req.VoterID)
	req.Aadhaar = strings.TrimSpace(req.Aadhaar)
	req.District = strings.TrimSpace(req.District)
	req.LocalBodyName = strings.TrimSpace(req.LocalBodyName)
	req.WardNo = strings.TrimSpace(req.WardNo)

	if req.VoterID == "" || req.Aadhaar == "" || req.District == "" || req.LocalBodyName == "" || req.WardNo == "" {
		return utils.Error(c, 400, "All fields are required")
	}

	fmt.Printf("Login Attempt: ID=%s Body=%s Ward=%s\n", req.VoterID, req.LocalBodyName, req.WardNo)

	mobile, err := service.InitiateVoterLogin(req.VoterID, req.Aadhaar, req.District, req.Block, req.LocalBodyName, req.WardNo)
	if err != nil {
		fmt.Printf(" Login Failed: %s\n", err.Error())
		return utils.Error(c, 400, err.Error())
	}

	return utils.Success(c, fiber.Map{
		"message": "User verified",
		"phone":   mobile,
	})
}
func VerifyOTP(c *fiber.Ctx) error {
	var req OTPVerifyReq
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	token, err := service.VerifyVoterFirebase(req.VoterID, req.FirebaseToken)
	if err != nil {
		return utils.Error(c, 400, err.Error())
	}

	return utils.Success(c, fiber.Map{"token": token})
}
