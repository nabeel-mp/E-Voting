package api

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/repository"
	"E-voting/internal/service"
	"E-voting/internal/utils"

	"github.com/gofiber/fiber/v2"
)

type CreateSubAdminRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	RoleID   uint   `json:"role_id"`
}

type AdminStatusRequest struct {
	AdminID uint `json:"admin_id"`
}

func CreateRoleHandler(c *fiber.Ctx) error {
	type Req struct {
		Name        string   `json:"name"`
		Permissions []string `json:"permissions"`
	}
	var req Req
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	if err := service.CreateRole(req.Name, req.Permissions); err != nil {
		return utils.Error(c, 500, "Failed to create role")
	}
	return utils.Success(c, "Role created successfully")
}

func ListRolesHandler(c *fiber.Ctx) error {
	roles, err := service.GetRoles()
	if err != nil {
		return utils.Error(c, 500, "Failed to fetch roles")
	}
	return utils.Success(c, roles)
}

func CreateSubAdmin(c *fiber.Ctx) error {
	var req CreateSubAdminRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	if req.RoleID == 0 {
		return utils.Error(c, 400, "Role ID is required")
	}

	userIDLocal := c.Locals("user_id")
	roleLocal := c.Locals("role")

	if userIDLocal == nil || roleLocal == nil {
		return utils.Error(c, 401, "Unauthorized: user data missing")
	}

	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)

	err := service.CreateSubAdmin(req.Email, req.Password, req.RoleID, actorID, actorRole)
	if err != nil {
		return utils.Error(c, 400, err.Error())
	}

	return utils.Success(c, "Sub Admin created successfully")
}

func ListAdmins(c *fiber.Ctx) error {
	admins, err := repository.GetAllAdmins()
	if err != nil {
		return utils.Error(c, 500, "Failed to fetch admins")
	}

	response := make([]fiber.Map, 0)
	for _, a := range admins {
		response = append(response, fiber.Map{
			"id":        a.ID,
			"email":     a.Email,
			"role_name": a.Role.Name,
			"is_active": a.IsActive,
			"is_super":  a.IsSuper,
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

	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)

	err := service.BlockUnblockSubAdmin(
		req.AdminID,
		actorID,
		actorRole,
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

	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)

	err := service.BlockUnblockSubAdmin(
		req.AdminID,
		actorID,
		actorRole,
		false,
	)

	if err != nil {
		return utils.Error(c, 400, err.Error())
	}

	return utils.Success(c, "Sub Admin unblocked")
}

func UpdateAdminProfile(c *fiber.Ctx) error {
	type UpdateReq struct {
		Email string `json:"email"`
	}
	var req UpdateReq
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request body")
	}

	// Get ID from JWT middleware locals
	userID := uint(c.Locals("user_id").(float64))

	err := database.PostgresDB.Model(&models.Admin{}).Where("id = ?", userID).Updates(models.Admin{
		Email: req.Email,
	}).Error

	if err != nil {
		return utils.Error(c, 500, "Failed to update profile")
	}

	return utils.Success(c, "Profile updated successfully")
}
