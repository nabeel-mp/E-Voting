package api

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/repository"
	"E-voting/internal/service"
	"E-voting/internal/utils"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

type RegisterVoterRequest struct {
	FullName string `json:"full_name"`
	Mobile   string `json:"mobile"`
	Aadhaar  string `json:"aadhaar"`
}

type VoterStatusReq struct {
	VoterID uint `json:"voter_id"`
}

func RegisterVoter(c *fiber.Ctx) error {
	var req RegisterVoterRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request body")
	}

	if req.Mobile == "" || req.Aadhaar == "" {
		return utils.Error(c, 400, "Missing required fields")
	}

	hashedAadhaar := utils.HashAadhaar(req.Aadhaar)
	generatedVoterID := fmt.Sprintf("VOTE-%d", utils.RandomNumber())

	voter := &models.Voter{
		FullName:    req.FullName,
		VoterID:     generatedVoterID,
		Mobile:      req.Mobile,
		AadhaarHash: hashedAadhaar,
	}

	if err := repository.CreateVoter(voter); err != nil {
		return utils.Error(c, 500, "Could not register voter. ID may exist.")
	}

	// Safe type assertion
	actorIDFloat, _ := c.Locals("user_id").(float64)
	actorRole, _ := c.Locals("role").(string)

	service.LogAdminAction(
		uint(actorIDFloat),
		actorRole,
		"REGISTER_VOTER",
		voter.ID,
		map[string]interface{}{"voter_id": generatedVoterID},
	)

	return utils.Success(c, fiber.Map{
		"message":  "Voter registered successfully",
		"voter_id": generatedVoterID,
	})
}

func ListVoters(c *fiber.Ctx) error {
	var voters []models.Voter
	if err := database.PostgresDB.Find(&voters).Error; err != nil {
		fmt.Println("Error fetching voters:", err)
		return utils.Error(c, 500, "Failed to fetch voters. Check DB Migration.")
	}
	return utils.Success(c, voters)
}

func BlockVoter(c *fiber.Ctx) error {
	var req VoterStatusReq
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}
	if err := database.PostgresDB.Model(&models.Voter{}).Where("id = ?", req.VoterID).Update("is_blocked", true).Error; err != nil {
		return utils.Error(c, 500, "Failed to block voter")
	}
	return utils.Success(c, "Voter blocked")
}

func UnblockVoter(c *fiber.Ctx) error {
	var req VoterStatusReq
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}
	if err := database.PostgresDB.Model(&models.Voter{}).Where("id = ?", req.VoterID).Update("is_blocked", false).Error; err != nil {
		return utils.Error(c, 500, "Failed to unblock voter")
	}
	return utils.Success(c, "Voter unblocked")
}

func VerifyVoter(c *fiber.Ctx) error {
	var req VoterStatusReq
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	if err := database.PostgresDB.Model(&models.Voter{}).Where("id = ?", req.VoterID).Update("is_verified", true).Error; err != nil {
		return utils.Error(c, 500, "Failed to verify voter")
	}

	// Log Action
	actorIDFloat, _ := c.Locals("user_id").(float64)
	actorRole, _ := c.Locals("role").(string)
	service.LogAdminAction(uint(actorIDFloat), actorRole, "VERIFY_VOTER", req.VoterID, nil)

	return utils.Success(c, "Voter verified successfully")
}
