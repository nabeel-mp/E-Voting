package api

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
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
	candidate.FullName = req.FullName
	candidate.PartyID = req.PartyID
	candidate.ElectionID = req.ElectionID
	candidate.Bio = req.Bio

	if err := database.PostgresDB.Save(&candidate).Error; err != nil {
		return utils.Error(c, 500, "Failed to update candidate")
	}

	return utils.Success(c, "Candidate updated successfully")
}

func DeleteCandidate(c *fiber.Ctx) error {
	id := c.Params("id")
	// Delete candidate by ID
	if err := database.PostgresDB.Delete(&models.Candidate{}, id).Error; err != nil {
		return utils.Error(c, 500, "Failed to delete candidate")
	}
	return utils.Success(c, "Candidate deleted successfully")
}
