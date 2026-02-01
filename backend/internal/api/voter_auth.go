package api

import (
	"E-voting/internal/repository"
	"E-voting/internal/service"
	"E-voting/internal/utils"

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
	VoterID string `json:"voter_id"`
	OTP     string `json:"otp"`
}

func VoterLogin(c *fiber.Ctx) error {
	if repository.GetSettingValue("maintenance_mode") == "true" {
		return utils.Error(c, 503, "System is currently under maintenance.")
	}

	var req VoterLoginReq
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	if req.VoterID == "" || req.Aadhaar == "" || req.District == "" || req.LocalBodyName == "" || req.WardNo == "" {
		return utils.Error(c, 400, "All fields are required")
	}

	msg, err := service.InitiateVoterLogin(req.VoterID, req.Aadhaar, req.District, req.Block, req.LocalBodyName, req.WardNo)
	if err != nil {
		return utils.Error(c, 400, err.Error())
	}

	return utils.Success(c, fiber.Map{"message": msg})
}

func VerifyOTP(c *fiber.Ctx) error {
	var req OTPVerifyReq
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	token, err := service.VerifyVoterOTP(req.VoterID, req.OTP)
	if err != nil {
		return utils.Error(c, 400, err.Error())
	}

	return utils.Success(c, fiber.Map{"token": token})
}
