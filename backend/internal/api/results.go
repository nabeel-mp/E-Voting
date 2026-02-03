package api

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/utils"

	"github.com/gofiber/fiber/v2"
)

func GetElectionResults(c *fiber.Ctx) error {
	electionID := c.QueryInt("election_id")

	userRole, _ := c.Locals("role").(string)

	if electionID > 0 {
		var election models.Election
		if err := database.PostgresDB.First(&election, electionID).Error; err == nil {
			// If not Super Admin, ensure results are published
			if userRole != "SUPER_ADMIN" && !election.IsPublished {
				return utils.Error(c, 403, "Results have not been published yet.")
			}
		}
	}

	type Result struct {
		CandidateName string `json:"candidate_name"`
		PartyName     string `json:"party_name"`
		VoteCount     int64  `json:"vote_count"`
	}

	var results []Result

	// FIXED QUERY: Start from 'candidates' table to include those with 0 votes
	query := database.PostgresDB.Table("candidates").
		Select("candidates.full_name as candidate_name, parties.name as party_name, COALESCE(COUNT(votes.id), 0) as vote_count").
		Joins("LEFT JOIN parties ON parties.id = candidates.party_id").
		Joins("LEFT JOIN votes ON votes.candidate_id = candidates.id")

	if electionID > 0 {
		query = query.Where("candidates.election_id = ?", electionID)
	}

	err := query.Group("candidates.id, candidates.full_name, parties.name").
		Order("vote_count DESC"). // Order by votes highest to lowest
		Scan(&results).Error

	if err != nil {
		return utils.Error(c, 500, "Failed to calculate results")
	}

	return utils.Success(c, results)
}
