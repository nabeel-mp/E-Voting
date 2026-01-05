package api

import (
	"E-voting/internal/service"
	"E-voting/internal/utils"

	"github.com/gofiber/fiber/v2"
)

type VoteRequest struct {
	ElectionID  uint `json:"election_id"`
	CandidateID uint `json:"candidate_id"`
}

func CastVote(c *fiber.Ctx) error {
	var req VoteRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request body")
	}

	voterID := uint(c.Locals("user_id").(float64))

	hash, err := service.CastVote(voterID, req.ElectionID, req.CandidateID)
	if err != nil {
		return utils.Error(c, 500, "Failed to cast vote")
	}

	return utils.Success(c, fiber.Map{
		"message":           "Vote cast successfully",
		"verification_hash": hash,
	})
}
