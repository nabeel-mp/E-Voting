package api

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/service"
	"E-voting/internal/utils"

	"github.com/gofiber/fiber/v2"
)

// InitializeDefaults ensures basic settings exist
func InitializeDefaults() {
	defaults := []models.SystemSetting{
		{Key: "system_name", Value: "E-Voting Portal", Description: "Display name of the application", Type: "text", Category: "General"},
		{Key: "support_email", Value: "support@evoting.com", Description: "Contact email for voters", Type: "text", Category: "General"},
		{Key: "allow_voter_registration", Value: "true", Description: "Allow new voters to register", Type: "boolean", Category: "Features"},
		{Key: "maintenance_mode", Value: "false", Description: "Enable maintenance mode (voters cannot login)", Type: "boolean", Category: "System"},

		{
			Key:         "otp_validity_duration",
			Value:       "5",
			Description: "OTP expiry time in minutes",
			Type:        "number",
			Category:    "Security",
		},
	}

	for _, d := range defaults {
		database.PostgresDB.FirstOrCreate(&d, models.SystemSetting{Key: d.Key})
	}
}

func GetSystemSettings(c *fiber.Ctx) error {
	var settings []models.SystemSetting
	if err := database.PostgresDB.Order("category, key").Find(&settings).Error; err != nil {
		return utils.Error(c, 500, "Failed to fetch settings")
	}
	return utils.Success(c, settings)
}

func UpdateSystemSettings(c *fiber.Ctx) error {
	var req []struct {
		Key   string `json:"key"`
		Value string `json:"value"`
	}

	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	tx := database.PostgresDB.Begin()
	for _, item := range req {
		if err := tx.Model(&models.SystemSetting{}).Where("key = ?", item.Key).Update("value", item.Value).Error; err != nil {
			tx.Rollback()
			return utils.Error(c, 500, "Failed to update "+item.Key)
		}
	}
	tx.Commit()

	// Audit
	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)
	service.LogAdminAction(actorID, actorRole, "UPDATE_SYSTEM_CONFIG", 0, nil)

	return utils.Success(c, "Configuration updated successfully")
}
