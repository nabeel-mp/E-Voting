package api

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/service"
	"E-voting/internal/utils"
	"fmt"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
)

// --- PARTY MANAGEMENT ---

func CreateParty(c *fiber.Ctx) error {
	// Parse basic fields
	name := c.FormValue("name")
	if name == "" {
		return utils.Error(c, 400, "Party name is required")
	}

	party := models.Party{Name: name}

	// Handle Logo Upload
	file, err := c.FormFile("logo")
	if err == nil {
		filename := fmt.Sprintf("party_%d%s", time.Now().UnixNano(), filepath.Ext(file.Filename))
		savePath := filepath.Join("./uploads", filename)
		if err := c.SaveFile(file, savePath); err == nil {
			party.Logo = "/uploads/" + filename
		}
	}

	if err := database.PostgresDB.Create(&party).Error; err != nil {
		return utils.Error(c, 500, "Failed to create party. Name might be duplicate.")
	}

	// Audit
	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)
	service.LogAdminAction(actorID, actorRole, "CREATE_PARTY", party.ID, map[string]interface{}{"name": party.Name})

	return utils.Success(c, "Party created successfully")
}

func UpdateParty(c *fiber.Ctx) error {
	id := c.Params("id")
	var party models.Party
	if err := database.PostgresDB.First(&party, id).Error; err != nil {
		return utils.Error(c, 404, "Party not found")
	}

	// SAFETY CHECK: Cannot update if used in an ACTIVE Election
	var activeCount int64
	database.PostgresDB.Table("candidates").
		Joins("JOIN elections ON elections.id = candidates.election_id").
		Where("candidates.party_id = ? AND elections.is_active = ?", party.ID, true).
		Count(&activeCount)

	if activeCount > 0 {
		return utils.Error(c, 403, "Cannot update party: It is currently linked to an active election.")
	}

	// Update Fields
	name := c.FormValue("name")
	if name != "" {
		party.Name = name
	}

	file, err := c.FormFile("logo")
	if err == nil {
		filename := fmt.Sprintf("party_%d%s", time.Now().UnixNano(), filepath.Ext(file.Filename))
		savePath := filepath.Join("./uploads", filename)
		if err := c.SaveFile(file, savePath); err == nil {
			party.Logo = "/uploads/" + filename
		}
	}

	if err := database.PostgresDB.Save(&party).Error; err != nil {
		return utils.Error(c, 500, "Failed to update party")
	}

	return utils.Success(c, "Party updated successfully")
}

func DeleteParty(c *fiber.Ctx) error {
	id := c.Params("id")
	var party models.Party
	if err := database.PostgresDB.First(&party, id).Error; err != nil {
		return utils.Error(c, 404, "Party not found")
	}

	// SAFETY CHECK: Cannot delete if ANY candidates exist (Integrity)
	var count int64
	database.PostgresDB.Model(&models.Candidate{}).Where("party_id = ?", party.ID).Count(&count)
	if count > 0 {
		return utils.Error(c, 403, "Cannot delete party: It has linked candidates. Delete them first.")
	}

	if err := database.PostgresDB.Delete(&party).Error; err != nil {
		return utils.Error(c, 500, "Failed to delete party")
	}

	// Audit
	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)
	service.LogAdminAction(actorID, actorRole, "DELETE_PARTY", party.ID, map[string]interface{}{"name": party.Name})

	return utils.Success(c, "Party deleted successfully")
}

func ListParties(c *fiber.Ctx) error {
	var parties []models.Party
	database.PostgresDB.Order("name asc").Find(&parties)
	return utils.Success(c, parties)
}

// --- CANDIDATE MANAGEMENT ---

func CreateCandidate(c *fiber.Ctx) error {
	var candidate models.Candidate
	if err := c.BodyParser(&candidate); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	// Verify Election exists
	var election models.Election
	if err := database.PostgresDB.First(&election, candidate.ElectionID).Error; err != nil {
		return utils.Error(c, 404, "Selected election does not exist")
	}

	if err := database.PostgresDB.Create(&candidate).Error; err != nil {
		return utils.Error(c, 500, "Failed to create candidate")
	}

	// Audit
	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)
	service.LogAdminAction(actorID, actorRole, "CREATE_CANDIDATE", candidate.ID, map[string]interface{}{
		"name":     candidate.FullName,
		"election": election.Title,
	})

	return utils.Success(c, "Candidate created successfully")
}

func ListCandidates(c *fiber.Ctx) error {
	var candidates []models.Candidate
	// Preload Party info for display
	database.PostgresDB.Preload("Party").Find(&candidates)
	return utils.Success(c, candidates)
}

func UpdateCandidate(c *fiber.Ctx) error {
	id := c.Params("id")
	var candidate models.Candidate

	if err := database.PostgresDB.First(&candidate, id).Error; err != nil {
		return utils.Error(c, 404, "Candidate not found")
	}

	// SAFETY CHECK: Election Active?
	var election models.Election
	if err := database.PostgresDB.First(&election, candidate.ElectionID).Error; err == nil {
		if election.IsActive {
			return utils.Error(c, 403, "Cannot modify candidate while their election is ACTIVE.")
		}
	}

	var req models.Candidate
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	// Update fields
	candidate.FullName = req.FullName
	candidate.PartyID = req.PartyID
	candidate.ElectionID = req.ElectionID
	candidate.Bio = req.Bio

	if err := database.PostgresDB.Save(&candidate).Error; err != nil {
		return utils.Error(c, 500, "Failed to update candidate")
	}

	// Audit
	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)
	service.LogAdminAction(actorID, actorRole, "UPDATE_CANDIDATE", candidate.ID, nil)

	return utils.Success(c, "Candidate updated successfully")
}

func DeleteCandidate(c *fiber.Ctx) error {
	id := c.Params("id")
	var candidate models.Candidate

	if err := database.PostgresDB.First(&candidate, id).Error; err != nil {
		return utils.Error(c, 404, "Candidate not found")
	}

	// SAFETY CHECK 1: Votes Cast?
	var voteCount int64
	database.PostgresDB.Model(&models.Vote{}).Where("candidate_id = ?", id).Count(&voteCount)
	if voteCount > 0 {
		return utils.Error(c, 403, "Cannot delete candidate: Votes have already been cast.")
	}

	// SAFETY CHECK 2: Active Election?
	var election models.Election
	if err := database.PostgresDB.First(&election, candidate.ElectionID).Error; err == nil {
		if election.IsActive {
			return utils.Error(c, 403, "Cannot delete candidate while their election is ACTIVE.")
		}
	}

	if err := database.PostgresDB.Delete(&candidate).Error; err != nil {
		return utils.Error(c, 500, "Failed to delete candidate")
	}

	// Audit
	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)
	service.LogAdminAction(actorID, actorRole, "DELETE_CANDIDATE", candidate.ID, map[string]interface{}{
		"name": candidate.FullName,
	})

	return utils.Success(c, "Candidate deleted successfully")
}
