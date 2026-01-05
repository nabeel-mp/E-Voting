package api

import (
	"E-voting/internal/service"
	"E-voting/internal/utils"

	"github.com/gofiber/fiber/v2"
)

type VoterLoginReq struct {
	VoterID string `json:"voter_id"`
	Mobile  string `json:"mobile"`
	Aadhaar string `json:"aadhaar"`
}

type OTPVerifyReq struct {
	VoterID string `json:"voter_id"`
	OTP     string `json:"otp"`
}

func VoterLogin(c *fiber.Ctx) error {
	var req VoterLoginReq
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	msg, err := service.InitiateVoterLogin(req.VoterID, req.Mobile, req.Aadhaar)
	if err != nil {
		return utils.Error(c, 401, err.Error())
	}

	return utils.Success(c, msg)
}

func VerifyOTP(c *fiber.Ctx) error {
	var req OTPVerifyReq
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	token, err := service.VerifyVoterOTP(req.VoterID, req.OTP)
	if err != nil {
		return utils.Error(c, 401, err.Error())
	}

	return utils.Success(c, fiber.Map{"token": token})
}
