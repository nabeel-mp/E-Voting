package api

import (
	"E-voting/internal/service"
	"E-voting/internal/utils"

	"github.com/gofiber/fiber/v2"
)

type AdminLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func AdminLogin(c *fiber.Ctx) error {
	var req AdminLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	token, permissions, admin, err := service.AdminLogin(req.Email, req.Password)
	if err != nil {
		return utils.Error(c, 401, err.Error())
	}

	roleLabel := "STAFF"
	if admin.IsSuper {
		roleLabel = "SUPER_ADMIN"
	}

	return utils.Success(c, fiber.Map{
		"token": token,
		"user": fiber.Map{
			"id":          admin.ID,
			"name":        admin.Name,
			"email":       admin.Email,
			"avatar":      admin.Avatar,
			"is_super":    admin.IsSuper,
			"role":        roleLabel,
			"permissions": permissions,
		},
	})
}
