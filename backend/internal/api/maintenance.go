package api

import (
	"E-voting/internal/service"
	"E-voting/internal/utils"

	"github.com/gofiber/fiber/v2"
)

// ManualSyncElections triggers the election sync process manually
func ManualSyncElections(c *fiber.Ctx) error {
	// Call the shared service logic
	count, logs := service.SyncElectionsLogic()

	return utils.Success(c, fiber.Map{
		"message":      "Election sync process completed",
		"synced_count": count,
		"details":      logs,
	})
}

// ManualRetryVotes triggers the vote repair process manually
func ManualRetryVotes(c *fiber.Ctx) error {
	// Call the shared service logic
	count, logs := service.RetryVotesLogic()

	return utils.Success(c, fiber.Map{
		"message":        "Vote retry process completed",
		"repaired_count": count,
		"details":        logs,
	})
}
