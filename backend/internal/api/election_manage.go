package api

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/service"
	"E-voting/internal/utils"

	"github.com/gofiber/fiber/v2"
)

func CreateElection(c *fiber.Ctx) error {
	var election models.Election
	if err := c.BodyParser(&election); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	if election.Title == "" {
		return utils.Error(c, 400, "Election title is required")
	}

	if err := database.PostgresDB.Create(&election).Error; err != nil {
		return utils.Error(c, 500, "Failed to create election")
	}

	// Log the action
	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)
	service.LogAdminAction(actorID, actorRole, "CREATE_ELECTION", election.ID, map[string]interface{}{
		"title": election.Title,
	})

	return utils.Success(c, "Election created successfully")
}

func ListElections(c *fiber.Ctx) error {
	var elections []models.Election
	// Order by most recently created
	if err := database.PostgresDB.Order("created_at desc").Find(&elections).Error; err != nil {
		return utils.Error(c, 500, "Failed to fetch elections")
	}
	return utils.Success(c, elections)
}

func ToggleElectionStatus(c *fiber.Ctx) error {
	type StatusReq struct {
		ElectionID uint `json:"election_id"`
		IsActive   bool `json:"is_active"`
	}
	var req StatusReq
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	if err := database.PostgresDB.Model(&models.Election{}).Where("id = ?", req.ElectionID).Update("is_active", req.IsActive).Error; err != nil {
		return utils.Error(c, 500, "Failed to update status")
	}

	return utils.Success(c, "Election status updated")
}

func UpdateElection(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.Election

	// Parse request body
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	var election models.Election
	// Find existing election
	if err := database.PostgresDB.First(&election, id).Error; err != nil {
		return utils.Error(c, 404, "Election not found")
	}

	// Update fields
	election.Title = req.Title
	election.Description = req.Description
	election.StartDate = req.StartDate
	election.EndDate = req.EndDate

	if err := database.PostgresDB.Save(&election).Error; err != nil {
		return utils.Error(c, 500, "Failed to update election")
	}

	// Log the action
	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)
	service.LogAdminAction(actorID, actorRole, "UPDATE_ELECTION", election.ID, map[string]interface{}{
		"title": election.Title,
	})

	return utils.Success(c, "Election updated successfully")
}

func ToggleElectionPublish(c *fiber.Ctx) error {
	type PublishReq struct {
		ElectionID  uint `json:"election_id"`
		IsPublished bool `json:"is_published"`
	}
	var req PublishReq
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	if err := database.PostgresDB.Model(&models.Election{}).Where("id = ?", req.ElectionID).Update("is_published", req.IsPublished).Error; err != nil {
		return utils.Error(c, 500, "Failed to update publish status")
	}

	status := "unpublished"
	if req.IsPublished {
		status = "published"
	}
	return utils.Success(c, "Election results "+status)
}
