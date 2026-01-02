package api

import (
	"E-voting/internal/service"
	"E-voting/internal/utils"

	"github.com/gofiber/fiber/v2"
)

type RegisterVoterRequest struct {
	Aadhaar string `json:"aadhaar"`
	Name    string `json:"name"`
	Region  string `json:"region"`
}

func RegisterVoter(c *fiber.Ctx) error {
	var req RegisterVoterRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	voter, err := service.RegisterVoter(req.Aadhaar, req.Name, req.Region)
	if err != nil {
		return utils.Error(c, 400, err.Error())
	}

	return utils.Success(c, fiber.Map{
		"voter_id": voter.VoterUniqueID,
	})
}

type VoterLoginRequest struct {
	Aadhaar string `json:"aadhaar"`
	VoterID string `json:"voter_id"`
}

func VoterLogin(c *fiber.Ctx) error {
	var req VoterLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	token, err := service.VoterLogin(req.Aadhaar, req.VoterID)
	if err != nil {
		return utils.Error(c, 401, err.Error())
	}

	return utils.Success(c, fiber.Map{
		"token": token,
	})
}
