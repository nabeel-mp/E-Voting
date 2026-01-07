package api

import (
	"E-voting/internal/database"
	"E-voting/internal/utils"

	"github.com/gofiber/fiber/v2"
)

func GetElectionResults(c *fiber.Ctx) error {
	type Result struct {
		CandidateName string `json:"candidate_name"`
		PartyName     string `json:"party_name"`
		VoteCount     int64  `json:"vote_count"`
	}

	var results []Result

	// Join Votes with Candidates and Parties to get a formatted list
	err := database.PostgresDB.Table("votes").
		Select("candidates.full_name as candidate_name, parties.name as party_name, count(votes.id) as vote_count").
		Joins("join candidates on candidates.id = votes.candidate_id").
		Joins("join parties on parties.id = candidates.party_id").
		Group("candidates.full_name, parties.name").
		Scan(&results).Error

	if err != nil {
		return utils.Error(c, 500, "Failed to calculate results")
	}

	return utils.Success(c, results)
}
