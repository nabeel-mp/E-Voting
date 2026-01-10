package api

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/repository"
	"E-voting/internal/service"
	"E-voting/internal/utils"
	"fmt"
	"path/filepath"
	"time"

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
		Name  string `json:"name"`
	}
	var req UpdateReq
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request body")
	}

	// Get ID from JWT middleware locals
	userID := uint(c.Locals("user_id").(float64))

	var admin models.Admin
	if err := database.PostgresDB.First(&admin, userID).Error; err != nil {
		return utils.Error(c, 404, "Admin not found")
	}

	var count int64
	database.PostgresDB.Model(&models.Admin{}).Where("email = ? AND id != ?", req.Email, userID).Count(&count)
	if count > 0 {
		return utils.Error(c, 400, "Email address is already in use")
	}

	admin.Name = req.Name
	admin.Email = req.Email

	if err := database.PostgresDB.Save(&admin).Error; err != nil {
		return utils.Error(c, 500, "Database error: "+err.Error())
	}

	database.PostgresDB.Preload("Role").First(&admin, userID)
	token, err := utils.GenerateJWT(admin.ID, admin.Role.Name, admin.Role.Permissions, admin.IsSuper, admin.Name)
	if err != nil {
		return utils.Error(c, 500, "Profile updated but failed to generate new token")
	}

	return utils.Success(c, fiber.Map{
		"message": "Profile updated successfully",
		"token":   token,
		"user": fiber.Map{
			"name":  admin.Name,
			"email": admin.Email,
		},
	})
}

func ChangePassword(c *fiber.Ctx) error {
	type PasswordReq struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}
	var req PasswordReq
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	userID := uint(c.Locals("user_id").(float64))
	var admin models.Admin

	// 1. Find Admin
	if err := database.PostgresDB.First(&admin, userID).Error; err != nil {
		return utils.Error(c, 404, "User not found")
	}

	// 2. Verify Old Password
	if !utils.CheckPassword(req.CurrentPassword, admin.Password) {
		return utils.Error(c, 401, "Incorrect current password")
	}

	// 3. Hash New Password
	hashedPwd, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return utils.Error(c, 500, "Failed to hash password")
	}

	// 4. Update Database
	if err := database.PostgresDB.Model(&admin).Update("password", hashedPwd).Error; err != nil {
		return utils.Error(c, 500, "Failed to update password")
	}

	return utils.Success(c, "Password changed successfully")
}

func UploadAvatar(c *fiber.Ctx) error {
	userID := uint(c.Locals("user_id").(float64))

	// Get file from form
	file, err := c.FormFile("avatar")
	if err != nil {
		return utils.Error(c, 400, "No image uploaded")
	}

	// Validate file type (basic check)
	if file.Size > 2*1024*1024 { // 2MB limit
		return utils.Error(c, 400, "Image too large (Max 2MB)")
	}

	// Save file (Ensure 'uploads/avatars' folder exists)
	filename := fmt.Sprintf("admin_%d_%d%s", userID, time.Now().Unix(), filepath.Ext(file.Filename))
	savePath := fmt.Sprintf("./uploads/avatars/%s", filename)

	if err := c.SaveFile(file, savePath); err != nil {
		return utils.Error(c, 500, "Failed to save image")
	}

	// Update DB
	avatarURL := "/uploads/avatars/" + filename
	if err := database.PostgresDB.Model(&models.Admin{}).Where("id = ?", userID).Update("avatar", avatarURL).Error; err != nil {
		return utils.Error(c, 500, "Failed to update database record")
	}

	return utils.Success(c, fiber.Map{
		"message": "Avatar uploaded",
		"avatar":  avatarURL,
	})
}

func UpdateNotifications(c *fiber.Ctx) error {
	// Assuming you have a JSONB column 'preferences' or similar
	var req map[string]interface{}
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid JSON")
	}

	userID := uint(c.Locals("user_id").(float64))

	// Example update for a JSONB column named 'preferences'
	database.PostgresDB.Model(&models.Admin{}).Where("id = ?", userID).Update("preferences", req)

	return utils.Success(c, "Preferences updated")
}
