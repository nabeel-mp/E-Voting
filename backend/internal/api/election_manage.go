// package api

// import (
// 	"E-voting/internal/database"
// 	"E-voting/internal/models"
// 	"E-voting/internal/service"
// 	"E-voting/internal/utils"
// 	"time"

// 	"github.com/gofiber/fiber/v2"
// )

// func CreateElection(c *fiber.Ctx) error {
// 	var election models.Election
// 	if err := c.BodyParser(&election); err != nil {
// 		return utils.Error(c, 400, "Invalid request")
// 	}

// 	// Default status
// 	election.Status = "UPCOMING"
// 	election.IsActive = false

// 	if err := database.PostgresDB.Create(&election).Error; err != nil {
// 		return utils.Error(c, 500, "Failed to create election")
// 	}

// 	// Audit
// 	actorID := uint(c.Locals("user_id").(float64))
// 	actorRole := c.Locals("role").(string)
// 	service.LogAdminAction(actorID, actorRole, "CREATE_ELECTION", election.ID, map[string]interface{}{"title": election.Title})

// 	return utils.Success(c, "Election created successfully")
// }

// func UpdateElection(c *fiber.Ctx) error {
// 	id := c.Params("id")
// 	var election models.Election

// 	if err := database.PostgresDB.First(&election, id).Error; err != nil {
// 		return utils.Error(c, 404, "Election not found")
// 	}

// 	var req models.Election
// 	if err := c.BodyParser(&req); err != nil {
// 		return utils.Error(c, 400, "Invalid request")
// 	}

// 	if election.IsActive && req.IsActive {
// 		return utils.Error(c, 403, "Cannot update an ACTIVE election. Stop it first.")
// 	}

// 	if time.Now().After(election.EndDate) {
// 		return utils.Error(c, 403, "Cannot updated an Ended Election")
// 	}

// 	election.Title = req.Title
// 	election.Description = req.Description
// 	election.StartDate = req.StartDate
// 	election.EndDate = req.EndDate

// 	election.District = req.District
// 	election.LocalBodyType = req.LocalBodyType
// 	election.LocalBodyName = req.LocalBodyName
// 	election.Block = req.Block
// 	election.Ward = req.Ward

// 	election.IsActive = req.IsActive

// 	if err := database.PostgresDB.Save(&election).Error; err != nil {
// 		return utils.Error(c, 500, "Failed to update election")
// 	}

// 	// Audit
// 	actorID := uint(c.Locals("user_id").(float64))
// 	actorRole := c.Locals("role").(string)
// 	service.LogAdminAction(actorID, actorRole, "UPDATE_ELECTION", election.ID, nil)

// 	return utils.Success(c, "Election updated successfully")
// }

// func DeleteElection(c *fiber.Ctx) error {
// 	id := c.Params("id")
// 	var election models.Election

// 	if err := database.PostgresDB.First(&election, id).Error; err != nil {
// 		return utils.Error(c, 404, "Election not found")
// 	}

// 	if election.IsActive && time.Now().Before(election.EndDate) {
// 		return utils.Error(c, 403, "Cannot delete an ACTIVE election. Stop it first or wait for it to end.")
// 	}

// 	if err := database.PostgresDB.Delete(&election).Error; err != nil {
// 		return utils.Error(c, 500, "Failed to delete election")
// 	}

// 	// Audit
// 	actorID := uint(c.Locals("user_id").(float64))
// 	actorRole := c.Locals("role").(string)
// 	service.LogAdminAction(actorID, actorRole, "DELETE_ELECTION", election.ID, map[string]interface{}{"title": election.Title})

// 	return utils.Success(c, "Election deleted successfully")
// }

// func ListElections(c *fiber.Ctx) error {
// 	var elections []models.Election
// 	database.PostgresDB.Order("created_at desc").Find(&elections)
// 	return utils.Success(c, elections)
// }

// func ToggleElectionStatus(c *fiber.Ctx) error {
// 	var req struct {
// 		ElectionID uint `json:"election_id"`
// 		Status     bool `json:"status"`
// 	}

// 	if err := c.BodyParser(&req); err != nil {
// 		return utils.Error(c, 400, "Invalid request")
// 	}

// 	var election models.Election
// 	if err := database.PostgresDB.First(&election, req.ElectionID).Error; err != nil {
// 		return utils.Error(c, 404, "Election not found")
// 	}

// 	election.IsActive = req.Status
// 	if req.Status {
// 		election.Status = "ONGOING"
// 	} else {
// 		if time.Now().After(election.EndDate) {
// 			election.Status = "COMPLETED"
// 		} else {
// 			election.Status = "PAUSED"
// 		}
// 	}

// 	if err := database.PostgresDB.Save(&election).Error; err != nil {
// 		return utils.Error(c, 500, "Failed to update status")
// 	}

// 	return utils.Success(c, "Election status updated")
// }

// func ToggleElectionPublish(c *fiber.Ctx) error {
// 	var req struct {
// 		ElectionID uint `json:"election_id"`
// 		Publish    bool `json:"publish"`
// 	}

// 	if err := c.BodyParser(&req); err != nil {
// 		return utils.Error(c, 400, "Invalid request")
// 	}

// 	if err := database.PostgresDB.Model(&models.Election{}).Where("id = ?", req.ElectionID).Update("is_published", req.Publish).Error; err != nil {
// 		return utils.Error(c, 500, "Failed to update publish status")
// 	}

// 	return utils.Success(c, "Election publish status updated")
// }

package api

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/service"
	"E-voting/internal/utils"
	"time"

	"github.com/gofiber/fiber/v2"
)

type CreateElectionRequest struct {
	Title         string `json:"title"`
	Description   string `json:"description"`
	StartDate     string `json:"start_date"`
	EndDate       string `json:"end_date"`
	ElectionType  string `json:"election_type"`
	District      string `json:"district"`
	Block         string `json:"block"`
	LocalBodyName string `json:"local_body_name"`
	Ward          string `json:"ward"`
}

func CreateElection(c *fiber.Ctx) error {
	var req CreateElectionRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request body")
	}

	// 1. Validate Required Fields
	if req.Title == "" || req.ElectionType == "" || req.District == "" {
		return utils.Error(c, 400, "Title, Election Type, and District are required")
	}

	// 2. Parse and Validate Dates
	start, err := time.Parse(time.RFC3339, req.StartDate)
	if err != nil {
		return utils.Error(c, 400, "Invalid Start Date format")
	}
	end, err := time.Parse(time.RFC3339, req.EndDate)
	if err != nil {
		return utils.Error(c, 400, "Invalid End Date format")
	}

	if !end.After(start) {
		return utils.Error(c, 400, "End Date must be strictly after Start Date")
	}

	// 3. Map to Model
	election := models.Election{
		Title:         req.Title,
		Description:   req.Description,
		StartDate:     start,
		EndDate:       end,
		ElectionType:  req.ElectionType,
		District:      req.District,
		Block:         req.Block,
		LocalBodyName: req.LocalBodyName,
		Ward:          req.Ward,
		IsActive:      false,
		Status:        calculateStatus(start, end, false),
	}

	isWardRequired := req.ElectionType == "Grama Panchayat" ||
		req.ElectionType == "Municipality" ||
		req.ElectionType == "Municipal Corporation"

	if isWardRequired && req.Ward == "" {
		return utils.Error(c, 400, "Ward number is required for "+req.ElectionType+" elections.")
	}

	if err := database.PostgresDB.Create(&election).Error; err != nil {
		return utils.Error(c, 500, "Failed to create election")
	}

	// 4. Audit Log
	logAdminAction(c, "CREATE_ELECTION", election.ID, map[string]interface{}{
		"title": election.Title,
		"type":  election.ElectionType,
	})

	return utils.Success(c, "Election created successfully")
}

func UpdateElection(c *fiber.Ctx) error {
	id := c.Params("id")
	var election models.Election

	// Check existence
	if err := database.PostgresDB.First(&election, id).Error; err != nil {
		return utils.Error(c, 404, "Election not found")
	}

	var req struct {
		Title         string    `json:"title"`
		Description   string    `json:"description"`
		StartDate     time.Time `json:"start_date"`
		EndDate       time.Time `json:"end_date"`
		ElectionType  string    `json:"election_type"`
		District      string    `json:"district"`
		Block         string    `json:"block"`
		LocalBodyName string    `json:"local_body_name"`
		Ward          string    `json:"ward"`
		IsActive      bool      `json:"is_active"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request format")
	}

	if election.IsActive && req.IsActive {
		return utils.Error(c, 403, "Cannot edit a LIVE election. Pause it first.")
	}

	if time.Now().After(election.EndDate) && !req.EndDate.After(time.Now()) {
		return utils.Error(c, 403, "Cannot edit a completed election.")
	}

	isWardRequired := req.ElectionType == "Grama Panchayat" ||
		req.ElectionType == "Municipality" ||
		req.ElectionType == "Municipal Corporation"

	if isWardRequired && req.Ward == "" {
		return utils.Error(c, 400, "Ward number is required for "+req.ElectionType+" elections.")
	}

	// Update Fields
	election.Title = req.Title
	election.Description = req.Description
	election.StartDate = req.StartDate
	election.EndDate = req.EndDate
	election.ElectionType = req.ElectionType
	election.District = req.District
	election.Block = req.Block
	election.LocalBodyName = req.LocalBodyName
	election.Ward = req.Ward

	// Handle "Stop Permanently" or Pause from Update form
	election.IsActive = req.IsActive

	// Recalculate status string based on new dates/active state
	election.Status = calculateStatus(election.StartDate, election.EndDate, election.IsActive)

	if err := database.PostgresDB.Save(&election).Error; err != nil {
		return utils.Error(c, 500, "Failed to update election")
	}

	logAdminAction(c, "UPDATE_ELECTION", election.ID, nil)
	return utils.Success(c, "Election updated successfully")
}

func DeleteElection(c *fiber.Ctx) error {
	id := c.Params("id")
	var election models.Election

	if err := database.PostgresDB.First(&election, id).Error; err != nil {
		return utils.Error(c, 404, "Election not found")
	}

	// Prevent deleting a running election
	if election.IsActive && time.Now().Before(election.EndDate) {
		return utils.Error(c, 403, "Cannot delete a LIVE election. Stop it first.")
	}

	if err := database.PostgresDB.Delete(&election).Error; err != nil {
		return utils.Error(c, 500, "Failed to delete election")
	}

	logAdminAction(c, "DELETE_ELECTION", election.ID, map[string]interface{}{"title": election.Title})
	return utils.Success(c, "Election deleted successfully")
}

func ListElections(c *fiber.Ctx) error {
	var elections []models.Election
	// Find all elections, ordered by newest created
	if err := database.PostgresDB.Order("created_at desc").Find(&elections).Error; err != nil {
		return utils.Error(c, 500, "Failed to fetch elections")
	}

	// Optional: Recalculate status on read to ensure accuracy if time passed?
	// Usually better to do via a cron job, but for small scale this is fine.
	for i := range elections {
		elections[i].Status = calculateStatus(elections[i].StartDate, elections[i].EndDate, elections[i].IsActive)
	}

	return utils.Success(c, elections)
}

func ToggleElectionStatus(c *fiber.Ctx) error {
	var req struct {
		ElectionID uint `json:"election_id"`
		Status     bool `json:"status"` // True = Resume, False = Pause
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	var election models.Election
	if err := database.PostgresDB.First(&election, req.ElectionID).Error; err != nil {
		return utils.Error(c, 404, "Election not found")
	}

	// Validation logic for changing status
	if req.Status {
		// Attempting to RESUME
		if time.Now().After(election.EndDate) {
			return utils.Error(c, 400, "Cannot resume an election that has already ended.")
		}
	}

	election.IsActive = req.Status
	election.Status = calculateStatus(election.StartDate, election.EndDate, election.IsActive)

	if err := database.PostgresDB.Save(&election).Error; err != nil {
		return utils.Error(c, 500, "Failed to update status")
	}

	action := "PAUSE_ELECTION"
	if req.Status {
		action = "RESUME_ELECTION"
	}
	logAdminAction(c, action, election.ID, nil)

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

// --- Helpers ---

func calculateStatus(start, end time.Time, isActive bool) string {
	now := time.Now()

	if now.After(end) {
		return "COMPLETED"
	}
	if !isActive {
		return "PAUSED"
	}
	if now.Before(start) {
		return "UPCOMING"
	}
	return "ONGOING"
}

// logAdminAction is a helper to safely extract user info and log
func logAdminAction(c *fiber.Ctx, action string, targetID uint, details map[string]interface{}) {
	// Safely type assert with checks to avoid panics
	userIDFloat, ok1 := c.Locals("user_id").(float64)
	role, ok2 := c.Locals("role").(string)

	if ok1 && ok2 {
		service.LogAdminAction(uint(userIDFloat), role, action, targetID, details)
	}
}
