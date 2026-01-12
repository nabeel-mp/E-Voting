package api

import (
	"E-voting/internal/database"
	"E-voting/internal/models" // Import models
	"E-voting/internal/utils"

	"github.com/gofiber/fiber/v2"
)

func GetElectionResults(c *fiber.Ctx) error {
	electionID := c.QueryInt("election_id")

	// 1. Check Publication Status (Security Check)
	// We assume 'role' is set in middleware (e.g., c.Locals("role"))
	userRole, _ := c.Locals("role").(string)

	if electionID > 0 {
		var election models.Election
		if err := database.PostgresDB.First(&election, electionID).Error; err == nil {
			// If NOT Super Admin AND Result is NOT published -> Deny Access
			if userRole != "SUPER_ADMIN" && !election.IsPublished {
				return utils.Error(c, 403, "Results have not been published yet.")
			}
		}
	}

	// 2. Fetch Results (Existing Logic)
	type Result struct {
		CandidateName string `json:"candidate_name"`
		PartyName     string `json:"party_name"`
		VoteCount     int64  `json:"vote_count"`
	}

	var results []Result

	query := database.PostgresDB.Table("votes").
		Select("candidates.full_name as candidate_name, parties.name as party_name, count(votes.id) as vote_count").
		Joins("join candidates on candidates.id = votes.candidate_id").
		Joins("join parties on parties.id = candidates.party_id")

	if electionID > 0 {
		query = query.Where("votes.election_id = ?", electionID)
	}

	err := query.Group("candidates.id, candidates.full_name, parties.name").
		Scan(&results).Error

	if err != nil {
		return utils.Error(c, 500, "Failed to calculate results")
	}

	return utils.Success(c, results)
}
