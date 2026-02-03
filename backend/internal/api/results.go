package api

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/utils"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func hasViewResultsPermission(userID uint) bool {
	var admin models.Admin
	if err := database.PostgresDB.Preload("Roles").First(&admin, userID).Error; err != nil {
		return false
	}
	for _, r := range admin.Roles {
		if r.Permissions == "all" || strings.Contains(","+r.Permissions+",", ",view_results,") {
			return true
		}
	}
	return false
}

func GetElectionResults(c *fiber.Ctx) error {
	electionID := c.QueryInt("election_id")

	userIDFloat := c.Locals("user_id")
	userRole, _ := c.Locals("role").(string)

	canViewUnpublished := false
	if userRole == "SUPER_ADMIN" {
		canViewUnpublished = true
	} else if userIDFloat != nil {
		if hasViewResultsPermission(uint(userIDFloat.(float64))) {
			canViewUnpublished = true
		}
	}

	if electionID > 0 {
		var election models.Election
		if err := database.PostgresDB.First(&election, electionID).Error; err == nil {
			if !canViewUnpublished && !election.IsPublished {
				return utils.Error(c, 403, "Results have not been published yet.")
			}
		}
	}

	// Updated Result struct
	type Result struct {
		ElectionID          uint   `json:"election_id"`
		ElectionTitle       string `json:"election_title"`
		ElectionDescription string `json:"election_description"`
		CandidateName       string `json:"candidate_name"`
		PartyName           string `json:"party_name"`
		VoteCount           int64  `json:"vote_count"`
		PartyLogo           string `json:"party_logo"`
	}

	var results []Result

	query := database.PostgresDB.Table("candidates").
		Select(`
			candidates.election_id, 
			elections.title as election_title, 
			elections.description as election_description,
			candidates.full_name as candidate_name, 
			COALESCE(parties.name, 'Independent') as party_name, 
			COALESCE(parties.logo, '') as party_logo, 
			COALESCE(COUNT(votes.id), 0) as vote_count
		`).
		Joins("LEFT JOIN parties ON parties.id = candidates.party_id").
		Joins("JOIN elections ON elections.id = candidates.election_id").
		Joins("LEFT JOIN votes ON votes.candidate_id = candidates.id AND votes.election_id = candidates.election_id")

	if electionID > 0 {
		query = query.Where("candidates.election_id = ?", electionID)
	}

	if !canViewUnpublished {
		query = query.Where("elections.is_published = ?", true)
	}

	err := query.Group(`
			candidates.id, 
			candidates.election_id, 
			elections.title, 
			elections.description, 
			candidates.full_name, 
			parties.name, 
			parties.logo
		`).
		Order("candidates.election_id DESC, vote_count DESC").
		Scan(&results).Error

	if err != nil {
		return utils.Error(c, 500, "Failed to calculate results")
	}

	return utils.Success(c, results)
}
