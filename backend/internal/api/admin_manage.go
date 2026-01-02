package api

import (
	"E-voting/internal/service"
	"E-voting/internal/utils"

	"github.com/gofiber/fiber/v2"
)

type CreateSubAdminRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AdminStatusRequest struct {
	AdminID uint `json:"admin_id"`
}

func CreateSubAdmin(c *fiber.Ctx) error {
	var req CreateSubAdminRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	err := service.CreateSubAdmin(req.Email, req.Password)
	if err != nil {
		return utils.Error(c, 400, err.Error())
	}

	return utils.Success(c, "Sub Admin created successfully")
}

func ListAdmins(c *fiber.Ctx) error {
	admins, err := service.ListAdmins()
	if err != nil {
		return utils.Error(c, 500, "Failed to fetch admins")
	}

	// Hide passwords
	response := make([]fiber.Map, 0)
	for _, a := range admins {
		response = append(response, fiber.Map{
			"id":        a.ID,
			"email":     a.Email,
			"role":      a.Role,
			"is_active": a.IsActive,
			"created":   a.CreatedAt,
		})
	}

	return utils.Success(c, response)
}

func BlockSubAdmin(c *fiber.Ctx) error {
	var req AdminStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	requesterID := uint(c.Locals("user_id").(float64))
	requesterRole := c.Locals("role").(string)

	err := service.BlockUnblockSubAdmin(
		req.AdminID,
		requesterRole,
		requesterID,
		true,
	)

	if err != nil {
		return utils.Error(c, 400, err.Error())
	}

	return utils.Success(c, "Sub Admin blocked")
}

func UnblockSubAdmin(c *fiber.Ctx) error {
	var req AdminStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	requesterID := uint(c.Locals("user_id").(float64))
	requesterRole := c.Locals("role").(string)

	err := service.BlockUnblockSubAdmin(
		req.AdminID,
		requesterRole,
		requesterID,
		false,
	)

	if err != nil {
		return utils.Error(c, 400, err.Error())
	}

	return utils.Success(c, "Sub Admin unblocked")
}
