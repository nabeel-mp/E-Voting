package api

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/utils"

	"github.com/gofiber/fiber/v2"
)

func VerifyPublicVote(c *fiber.Ctx) error {
	hash := c.Query("hash")
	if hash == "" {
		return utils.Error(c, 400, "Verification hash is required")
	}

	var vote models.Vote
	err := database.PostgresDB.Where("vote_hash = ?", hash).First(&vote).Error
	if err != nil {
		return utils.Error(c, 404, "Vote record not found in audit")
	}

	return utils.Success(c, fiber.Map{
		"verified":  true,
		"timestamp": vote.CreatedAt,
		"status":    "Recorded in Blockchain/Database",
	})
}
