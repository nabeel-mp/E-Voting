package api

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/service"
	"E-voting/internal/utils"
	"time"

	"github.com/gofiber/fiber/v2"
)

func CreateElection(c *fiber.Ctx) error {
	var election models.Election
	if err := c.BodyParser(&election); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	// Default status
	election.Status = "UPCOMING"
	election.IsActive = false

	if err := database.PostgresDB.Create(&election).Error; err != nil {
		return utils.Error(c, 500, "Failed to create election")
	}

	// Audit
	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)
	service.LogAdminAction(actorID, actorRole, "CREATE_ELECTION", election.ID, map[string]interface{}{"title": election.Title})

	return utils.Success(c, "Election created successfully")
}

func UpdateElection(c *fiber.Ctx) error {
	id := c.Params("id")
	var election models.Election

	if err := database.PostgresDB.First(&election, id).Error; err != nil {
		return utils.Error(c, 404, "Election not found")
	}

	var req models.Election
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	if election.IsActive && req.IsActive {
		return utils.Error(c, 403, "Cannot update an ACTIVE election. Stop it first.")
	}

	if time.Now().After(election.EndDate) {
		return utils.Error(c, 403, "Cannot updated an Ended Election")
	}

	election.Title = req.Title
	election.Description = req.Description
	election.StartDate = req.StartDate
	election.EndDate = req.EndDate

	election.District = req.District
	election.LocalBodyType = req.LocalBodyType
	election.LocalBodyName = req.LocalBodyName
	election.Block = req.Block
	election.Ward = req.Ward

	election.IsActive = req.IsActive

	if err := database.PostgresDB.Save(&election).Error; err != nil {
		return utils.Error(c, 500, "Failed to update election")
	}

	// Audit
	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)
	service.LogAdminAction(actorID, actorRole, "UPDATE_ELECTION", election.ID, nil)

	return utils.Success(c, "Election updated successfully")
}

func DeleteElection(c *fiber.Ctx) error {
	id := c.Params("id")
	var election models.Election

	if err := database.PostgresDB.First(&election, id).Error; err != nil {
		return utils.Error(c, 404, "Election not found")
	}

	if election.IsActive && time.Now().Before(election.EndDate) {
		return utils.Error(c, 403, "Cannot delete an ACTIVE election. Stop it first or wait for it to end.")
	}

	if err := database.PostgresDB.Delete(&election).Error; err != nil {
		return utils.Error(c, 500, "Failed to delete election")
	}

	// Audit
	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)
	service.LogAdminAction(actorID, actorRole, "DELETE_ELECTION", election.ID, map[string]interface{}{"title": election.Title})

	return utils.Success(c, "Election deleted successfully")
}

func ListElections(c *fiber.Ctx) error {
	var elections []models.Election
	database.PostgresDB.Order("created_at desc").Find(&elections)
	return utils.Success(c, elections)
}

func ToggleElectionStatus(c *fiber.Ctx) error {
	var req struct {
		ElectionID uint `json:"election_id"`
		Status     bool `json:"status"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	var election models.Election
	if err := database.PostgresDB.First(&election, req.ElectionID).Error; err != nil {
		return utils.Error(c, 404, "Election not found")
	}

	election.IsActive = req.Status
	if req.Status {
		election.Status = "ONGOING"
	} else {
		if time.Now().After(election.EndDate) {
			election.Status = "COMPLETED"
		} else {
			election.Status = "PAUSED"
		}
	}

	if err := database.PostgresDB.Save(&election).Error; err != nil {
		return utils.Error(c, 500, "Failed to update status")
	}

	return utils.Success(c, "Election status updated")
}

func ToggleElectionPublish(c *fiber.Ctx) error {
	var req struct {
		ElectionID uint `json:"election_id"`
		Publish    bool `json:"publish"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	if err := database.PostgresDB.Model(&models.Election{}).Where("id = ?", req.ElectionID).Update("is_published", req.Publish).Error; err != nil {
		return utils.Error(c, 500, "Failed to update publish status")
	}

	return utils.Success(c, "Election publish status updated")
}
