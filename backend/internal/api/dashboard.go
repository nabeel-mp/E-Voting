package api

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/utils"

	"github.com/gofiber/fiber/v2"
)

func GetDashboardData(c *fiber.Ctx) error {
	var totalVoters int64
	var totalVotes int64
	var totalCandidates int64
	var activeElections int64

	// Fetch counts from Postgres
	database.PostgresDB.Model(&models.Voter{}).Count(&totalVoters)
	database.PostgresDB.Model(&models.Vote{}).Count(&totalVotes)
	// Assuming a Candidate model exists, or counting distinct IDs in Vote table
	database.PostgresDB.Model(&models.Vote{}).Distinct("candidate_id").Count(&totalCandidates)
	database.PostgresDB.Model(&models.Election{}).Where("is_active = ?", true).Count(&activeElections)

	// Data to pass to the template
	data := fiber.Map{
		"TotalVoters":     totalVoters,
		"VotesCast":       totalVotes,
		"Candidates":      totalCandidates,
		"ActiveElections": activeElections,
	}

	return utils.Success(c, data)
}
