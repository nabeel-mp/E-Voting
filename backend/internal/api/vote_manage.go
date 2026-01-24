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

func GetVoterElections(c *fiber.Ctx) error {
	// 1. Get Logged in Voter
	voterIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return utils.Error(c, 401, "Unauthorized")
	}
	var voter models.Voter
	if err := database.PostgresDB.First(&voter, uint(voterIDFloat)).Error; err != nil {
		return utils.Error(c, 401, "Voter details not found")
	}

	// 2. Fetch Active Elections
	var allElections []models.Election
	if err := database.PostgresDB.
		Where("is_active = ?", true).
		Order("end_date asc").
		Find(&allElections).Error; err != nil {
		return utils.Error(c, 500, "Failed to fetch elections")
	}

	// 3. Filter based on 3-Tier Hierarchy
	var eligibleElections []models.Election

	for _, e := range allElections {
		isEligible := false

		// Rule 1: District Match is always required (foundation)
		if e.District == voter.District {
			switch e.ElectionType {
			case "District Panchayat":
				// Matches if District matches
				isEligible = true

			case "Block Panchayat":
				// Matches if Block matches
				if e.Block == voter.Block {
					isEligible = true
				}

			case "Grama Panchayat":
				if e.Block == voter.Block &&
					e.LocalBodyName == voter.Panchayath &&
					e.Ward == voter.Ward { // Strict Ward Match
					isEligible = true
				}

			case "Municipality", "Municipal Corporation":
				if e.LocalBodyName == voter.Panchayath &&
					e.Ward == voter.Ward { // Strict Ward Match
					isEligible = true
				}
			}
		}

		// Rule 2: Specific Ward Restriction (Optional)
		if isEligible && e.Ward != "" {
			if e.Ward != voter.Ward {
				isEligible = false
			}
		}

		if isEligible {
			eligibleElections = append(eligibleElections, e)
		}
	}

	return utils.Success(c, eligibleElections)
}

func GetVoterCandidates(c *fiber.Ctx) error {
	electionID := c.Params("id")
	var candidates []models.Candidate

	if err := database.PostgresDB.
		Preload("Party").
		Where("election_id = ?", electionID).
		Find(&candidates).Error; err != nil {
		return utils.Error(c, 500, "Failed to fetch candidates")
	}
	return utils.Success(c, candidates)
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

	if time.Now().Before(election.StartDate) {
		return utils.Error(c, 400, "Election has not started yet")
	}

	if time.Now().After(election.EndDate) {
		return utils.Error(c, 400, "Election has ended")
	}

	voterIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return utils.Error(c, 401, "Unauthorized")
	}
	voterID := uint(voterIDFloat)

	var voter models.Voter
	if err := database.PostgresDB.First(&voter, voterID).Error; err != nil {
		return utils.Error(c, 401, "Voter not found")
	}

	// 3. Check Conditions
	if !voter.IsVerified {
		return utils.Error(c, 403, "Your account has not been verified by an admin yet.")
	}

	var existingParticipation int64
	database.PostgresDB.Model(&models.ElectionParticipation{}).
		Where("voter_id = ? AND election_id = ?", voter.ID, req.ElectionID).
		Count(&existingParticipation)

	if existingParticipation > 0 {
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

	participation := models.ElectionParticipation{
		VoterID:    voter.ID,
		ElectionID: req.ElectionID,
		Timestamp:  time.Now(),
	}

	tx := database.PostgresDB.Begin()

	if err := tx.Create(&vote).Error; err != nil {
		tx.Rollback()
		return utils.Error(c, 500, "Failed to cast vote")
	}

	if err := tx.Create(&participation).Error; err != nil {
		tx.Rollback()
		return utils.Error(c, 500, "Failed to record participation")
	}

	tx.Commit()

	return utils.Success(c, fiber.Map{
		"message":        "Vote cast successfully",
		"receipt":        voteHashStr,
		"election_title": election.Title,
	})
}
