package api

import (
	"E-voting/internal/models"
	"E-voting/internal/repository"
	"E-voting/internal/service"
	"E-voting/internal/utils"

	"github.com/gofiber/fiber/v2"
)

// RegisterVoterRequest defines the input schema for voter registration
type RegisterVoterRequest struct {
	FullName string `json:"full_name"`
	VoterID  string `json:"voter_id"`
	Mobile   string `json:"mobile"`
	Aadhaar  string `json:"aadhaar"`
}

// RegisterVoter handles the creation of a new voter record
func RegisterVoter(c *fiber.Ctx) error {
	var req RegisterVoterRequest

	// Parse the request body
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request body")
	}

	// Basic validation
	if req.VoterID == "" || req.Mobile == "" || req.Aadhaar == "" {
		return utils.Error(c, 400, "Missing required fields")
	}

	// Hash the Aadhaar number before storing it for security
	hashedAadhaar := utils.HashAadhaar(req.Aadhaar)

	// Create the voter model
	voter := &models.Voter{
		FullName:    req.FullName,
		VoterID:     req.VoterID,
		Mobile:      req.Mobile,
		AadhaarHash: hashedAadhaar,
	}

	// Save the voter to the database via the repository
	// Note: You must ensure repository.CreateVoter is implemented in your repository layer
	err := repository.CreateVoter(voter)
	if err != nil {
		return utils.Error(c, 500, "Could not register voter. Voter ID or Aadhaar may already exist.")
	}

	// Log the action for auditing
	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)

	service.LogAdminAction(
		actorID,
		actorRole,
		"REGISTER_VOTER",
		voter.ID,
		map[string]interface{}{
			"voter_id": req.VoterID,
		},
	)

	return utils.Success(c, "Voter registered successfully")
}
