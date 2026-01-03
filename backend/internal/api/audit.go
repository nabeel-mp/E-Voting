package api

import (
	"E-voting/internal/service"
	"E-voting/internal/utils"

	"github.com/gofiber/fiber/v2"
)

func GetAuditLogs(c *fiber.Ctx) error {
	logs, err := service.FetchAuditLogs()
	if err != nil {
		return utils.Error(c, 500, "Failed to fetch logs")
	}

	return utils.Success(c, logs)
}
