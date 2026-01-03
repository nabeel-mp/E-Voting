package api

import (
	"E-voting/internal/service"
	"E-voting/internal/utils"

	"github.com/gofiber/fiber/v2"
)

type StartOTPRequest struct {
	Aadhaar string `json:"aadhaar"`
}

func StartOTP(c *fiber.Ctx) error {
	voterID := uint(c.Locals("user_id").(float64))

	var req StartOTPRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	if err := service.StartOTP(voterID, req.Aadhaar); err != nil {
		return utils.Error(c, 400, err.Error())
	}

	return utils.Success(c, "OTP sent to Aadhaar-linked mobile")
}

type VerifyOTPRequest struct {
	OTP string `json:"otp"`
}

func VerifyOTP(c *fiber.Ctx) error {
	voterID := uint(c.Locals("user_id").(float64))

	var req VerifyOTPRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	token, err := service.VerifyOTP(voterID, req.OTP)
	if err != nil {
		return utils.Error(c, 400, err.Error())
	}

	return utils.Success(c, fiber.Map{
		"voting_token": token,
	})
}
