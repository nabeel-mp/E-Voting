package api

import (
	"E-voting/internal/models"
	"E-voting/internal/repository"
	"E-voting/internal/service"
	"E-voting/internal/utils"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

type RegisterVoterRequest struct {
	FullName string `json:"full_name"`
	Mobile   string `json:"mobile"`
	Aadhaar  string `json:"aadhaar"`
}

func RegisterVoter(c *fiber.Ctx) error {
	var req RegisterVoterRequest

	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request body")
	}

	if req.Mobile == "" || req.Aadhaar == "" {
		return utils.Error(c, 400, "Missing required fields")
	}

	hashedAadhaar := utils.HashAadhaar(req.Aadhaar)

	generatedVoterID := fmt.Sprintf("VOTE-%d", utils.RandomNumber())

	voter := &models.Voter{
		FullName:    req.FullName,
		VoterID:     generatedVoterID,
		Mobile:      req.Mobile,
		AadhaarHash: hashedAadhaar,
	}

	err := repository.CreateVoter(voter)
	if err != nil {
		return utils.Error(c, 500, "Could not register voter. Voter ID or Aadhaar may already exist.")
	}

	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)

	service.LogAdminAction(
		actorID,
		actorRole,
		"REGISTER_VOTER",
		voter.ID,
		map[string]interface{}{
			"voter_id": generatedVoterID,
		},
	)

	return utils.Success(c, fiber.Map{
		"message":  "Voter registered successfully",
		"voter_id": generatedVoterID,
	})
}
