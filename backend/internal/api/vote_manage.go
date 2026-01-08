// backend/internal/api/vote_manage.go
package api

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/utils"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
)

type VoteRequest struct {
	CandidateID uint `json:"candidate_id"`
	ElectionID  uint `json:"election_id"` // Assuming you have elections
}

func CastVote(c *fiber.Ctx) error {
	var req VoteRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	// Get Voter ID from JWT (set in auth_middleware)
	// Note: Middleware must support VOTER role for this to work
	voterID := uint(c.Locals("user_id").(float64))

	var voter models.Voter
	if err := database.PostgresDB.First(&voter, voterID).Error; err != nil {
		return utils.Error(c, 401, "Voter not found")
	}

	if voter.IsVerified {
		return utils.Error(c, 400, "You have already voted")
	}

	// Create a unique hash for the vote to ensure anonymity but prevent double voting
	// (Simple implementation)
	voteHash := sha256.Sum256([]byte(fmt.Sprintf("%d-%d-%d", voter.ID, req.ElectionID, time.Now().UnixNano())))
	voteHashStr := hex.EncodeToString(voteHash[:])

	vote := models.Vote{
		ElectionID:  req.ElectionID,
		CandidateID: req.CandidateID,
		VoteHash:    voteHashStr,
		Timestamp:   time.Now(),
	}

	tx := database.PostgresDB.Begin()

	if err := tx.Create(&vote).Error; err != nil {
		tx.Rollback()
		return utils.Error(c, 500, "Failed to cast vote")
	}

	// Mark voter as having voted (IsVerified = true reused here, or add HasVoted field)
	if err := tx.Model(&voter).Update("is_verified", true).Error; err != nil {
		tx.Rollback()
		return utils.Error(c, 500, "Failed to update voter status")
	}

	tx.Commit()

	return utils.Success(c, fiber.Map{"message": "Vote cast successfully", "receipt": voteHashStr})
}
