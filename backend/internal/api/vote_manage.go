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
	ElectionID  uint `json:"election_id"`
}

func CastVote(c *fiber.Ctx) error {
	var req VoteRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	// 1. Verify Election Exists and is Active
	var election models.Election
	if err := database.PostgresDB.First(&election, req.ElectionID).Error; err != nil {
		return utils.Error(c, 404, "Election not found")
	}
	if !election.IsActive {
		return utils.Error(c, 400, "This election is currently closed")
	}
	if time.Now().After(election.EndDate) {
		return utils.Error(c, 400, "Election has ended")
	}

	// 2. Get Voter
	voterID := uint(c.Locals("user_id").(float64))
	var voter models.Voter
	if err := database.PostgresDB.First(&voter, voterID).Error; err != nil {
		return utils.Error(c, 401, "Voter not found")
	}

	// 3. Check Conditions
	if !voter.IsVerified {
		return utils.Error(c, 403, "Your account has not been verified by an admin yet.")
	}

	if voter.HasVoted {
		return utils.Error(c, 400, "You have already voted in this election")
	}

	// 4. Record Vote
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

	// 5. Update Voter Status
	if err := tx.Model(&voter).Update("has_voted", true).Error; err != nil {
		tx.Rollback()
		return utils.Error(c, 500, "Failed to update voter status")
	}

	tx.Commit()

	return utils.Success(c, fiber.Map{"message": "Vote cast successfully", "receipt": voteHashStr})
}
