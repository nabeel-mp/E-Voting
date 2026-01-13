package api

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/repository"
	"E-voting/internal/service"
	"E-voting/internal/utils"
	"bytes"
	"encoding/csv"
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

func ExportVotersCSV(c *fiber.Ctx) error {
	var voters []models.Voter
	if err := database.PostgresDB.Find(&voters).Error; err != nil {
		return utils.Error(c, 500, "Failed to fetch voters")
	}

	b := &bytes.Buffer{}
	w := csv.NewWriter(b)

	// CSV Header
	if err := w.Write([]string{"VoterID", "FullName", "Mobile", "IsVerified", "HasVoted", "IsBlocked"}); err != nil {
		return utils.Error(c, 500, "Failed to write CSV header")
	}

	// CSV Rows
	for _, v := range voters {
		record := []string{
			v.VoterID,
			v.FullName,
			v.Mobile,
			fmt.Sprintf("%t", v.IsVerified),
			fmt.Sprintf("%t", v.HasVoted),
			fmt.Sprintf("%t", v.IsBlocked),
		}
		if err := w.Write(record); err != nil {
			return utils.Error(c, 500, "Failed to write CSV data")
		}
	}
	w.Flush()

	c.Set("Content-Type", "text/csv")
	c.Set("Content-Disposition", "attachment; filename=voters_list.csv")
	return c.SendStream(bytes.NewReader(b.Bytes()))
}

func ImportVotersCSV(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return utils.Error(c, 400, "CSV file is required")
	}

	f, err := file.Open()
	if err != nil {
		return utils.Error(c, 500, "Failed to open file")
	}
	defer f.Close()

	reader := csv.NewReader(f)
	records, err := reader.ReadAll()
	if err != nil {
		return utils.Error(c, 400, "Failed to parse CSV")
	}

	successCount := 0
	failCount := 0

	// Assuming Header Row: Full Name, Mobile, Aadhaar Number
	for i, record := range records {
		if i == 0 {
			continue // Skip Header
		}
		if len(record) < 3 {
			failCount++
			continue
		}

		fullName := record[0]
		mobile := record[1]
		aadhaar := record[2]

		if fullName == "" || mobile == "" || aadhaar == "" {
			failCount++
			continue
		}

		// Register Logic
		hashedAadhaar := utils.HashAadhaar(aadhaar)
		generatedVoterID := fmt.Sprintf("VOTE-%d", utils.RandomNumber())

		voter := &models.Voter{
			FullName:    fullName,
			VoterID:     generatedVoterID,
			Mobile:      mobile,
			AadhaarHash: hashedAadhaar,
		}

		if err := repository.CreateVoter(voter); err == nil {
			successCount++
		} else {
			failCount++
		}
	}

	// Log Bulk Action
	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)
	service.LogAdminAction(actorID, actorRole, "IMPORT_VOTERS", 0, map[string]interface{}{
		"success": successCount,
		"failed":  failCount,
	})

	return utils.Success(c, fiber.Map{
		"message": fmt.Sprintf("Import complete. Success: %d, Failed/Skipped: %d", successCount, failCount),
	})
}
