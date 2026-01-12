package api

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/service"
	"E-voting/internal/utils"

	"github.com/gofiber/fiber/v2"
)

func CreateParty(c *fiber.Ctx) error {
	var party models.Party
	if err := c.BodyParser(&party); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}
	if err := database.PostgresDB.Create(&party).Error; err != nil {
		return utils.Error(c, 500, "Failed to create party")
	}
	return utils.Success(c, "Party created successfully")
}

func CreateCandidate(c *fiber.Ctx) error {
	var candidate models.Candidate
	if err := c.BodyParser(&candidate); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}
	if err := database.PostgresDB.Create(&candidate).Error; err != nil {
		return utils.Error(c, 500, "Failed to create candidate")
	}
	return utils.Success(c, "Candidate created successfully")
}

func ListCandidates(c *fiber.Ctx) error {
	var candidates []models.Candidate
	database.PostgresDB.Preload("Party").Find(&candidates)
	return utils.Success(c, candidates)
}

func ListParties(c *fiber.Ctx) error {
	var parties []models.Party
	database.PostgresDB.Find(&parties)
	return utils.Success(c, parties)
}

func UpdateCandidate(c *fiber.Ctx) error {
	id := c.Params("id")
	var candidate models.Candidate

	// 1. Find existing candidate
	if err := database.PostgresDB.First(&candidate, id).Error; err != nil {
		return utils.Error(c, 404, "Candidate not found")
	}

	// 2. Parse updates
	var req models.Candidate
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	// 3. Update fields
	oldName := candidate.FullName
	candidate.FullName = req.FullName
	candidate.PartyID = req.PartyID
	candidate.ElectionID = req.ElectionID
	candidate.Bio = req.Bio

	if err := database.PostgresDB.Save(&candidate).Error; err != nil {
		return utils.Error(c, 500, "Failed to update candidate")
	}

	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)

	service.LogAdminAction(actorID, actorRole, "UPDATE_CANDIDATE", candidate.ID, map[string]interface{}{
		"old_name":    oldName,
		"new_name":    candidate.FullName,
		"election_id": candidate.ElectionID,
	})

	return utils.Success(c, "Candidate updated successfully")
}

func DeleteCandidate(c *fiber.Ctx) error {
	id := c.Params("id")
	var candidate models.Candidate

	if err := database.PostgresDB.First(&candidate, id).Error; err != nil {
		return utils.Error(c, 404, "Candidate not found")
	}

	// --- FEATURE 2: SAFETY CHECK ---
	// Prevent deletion if the candidate has already received votes
	var voteCount int64
	database.PostgresDB.Model(&models.Vote{}).Where("candidate_id = ?", id).Count(&voteCount)
	if voteCount > 0 {
		return utils.Error(c, 400, "Cannot delete candidate: Votes have already been cast for them.")
	}

	// Delete candidate
	if err := database.PostgresDB.Delete(&candidate).Error; err != nil {
		return utils.Error(c, 500, "Failed to delete candidate")
	}

	// --- FEATURE 1: AUDIT LOGGING ---
	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)

	service.LogAdminAction(actorID, actorRole, "DELETE_CANDIDATE", candidate.ID, map[string]interface{}{
		"candidate_name": candidate.FullName,
		"party_id":       candidate.PartyID,
	})

	return utils.Success(c, "Candidate deleted successfully")
}
