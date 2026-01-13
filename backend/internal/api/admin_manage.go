package api

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/repository"
	"E-voting/internal/service"
	"E-voting/internal/utils"
	"encoding/json"
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

	userID := uint(c.Locals("user_id").(float64))
	var admin models.Admin
	if err := database.PostgresDB.Preload("Role").First(&admin, userID).Error; err != nil {
		return utils.Error(c, 404, "Admin not found")
	}

	// Logic: Super Admin CANNOT change email
	if admin.IsSuper && req.Email != admin.Email {
		return utils.Error(c, 403, "Super Admin email is restricted and cannot be changed")
	}

	// Sub-admins can change email if not taken
	if !admin.IsSuper && req.Email != admin.Email {
		var count int64
		database.PostgresDB.Model(&models.Admin{}).Where("email = ? AND id != ?", req.Email, userID).Count(&count)
		if count > 0 {
			return utils.Error(c, 400, "Email address is already in use")
		}
		admin.Email = req.Email
	}

	admin.Name = req.Name
	if err := database.PostgresDB.Save(&admin).Error; err != nil {
		return utils.Error(c, 500, "Failed to save profile")
	}

	// Regenerate JWT with original IsSuper and Permissions
	token, err := utils.GenerateJWT(admin.ID, admin.Role.Name, admin.Role.Permissions, admin.IsSuper, admin.Name, admin.Email, admin.Avatar)
	if err != nil {
		return utils.Error(c, 500, "Profile updated but token generation failed")
	}

	return utils.Success(c, fiber.Map{"token": token})
}

func UploadAvatar(c *fiber.Ctx) error {
	// Get ID from locals as float64 (consistency with other handlers)
	userIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return utils.Error(c, 401, "Invalid session")
	}
	userID := uint(userIDFloat)

	// CRITICAL: The string "avatar" must match the FormData key in React
	file, err := c.FormFile("avatar")
	if err != nil {
		return utils.Error(c, 400, "No image uploaded")
	}

	// Validate file size (2MB limit)
	if file.Size > 2*1024*1024 {
		return utils.Error(c, 400, "Image too large (Max 2MB)")
	}

	// Ensure the directory exists (Main.go handles this, but we use consistent pathing here)
	// We save with a timestamp to avoid browser caching issues
	filename := fmt.Sprintf("admin_%d_%d%s", userID, time.Now().Unix(), filepath.Ext(file.Filename))
	savePath := filepath.Join("./uploads/avatars", filename)

	if err := c.SaveFile(file, savePath); err != nil {
		return utils.Error(c, 500, "Failed to save image")
	}

	// Store the URL path for the frontend (accessible via Static route)
	avatarURL := "/uploads/avatars/" + filename
	if err := database.PostgresDB.Model(&models.Admin{}).Where("id = ?", userID).Update("avatar", avatarURL).Error; err != nil {
		return utils.Error(c, 500, "Failed to update database record")
	}

	var admin models.Admin
	if err := database.PostgresDB.Preload("Role").First(&admin, userID).Error; err != nil {
		return utils.Error(c, 500, "Avatar saved but failed to fetch user for token refresh")
	}

	token, err := utils.GenerateJWT(admin.ID, admin.Role.Name, admin.Role.Permissions, admin.IsSuper, admin.Name, admin.Email, admin.Avatar)
	if err != nil {
		return utils.Error(c, 500, "Failed to generate new token")
	}

	return utils.Success(c, fiber.Map{
		"message": "Avatar uploaded",
		"avatar":  avatarURL,
		"token":   token,
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

func UpdateNotifications(c *fiber.Ctx) error {
	var req map[string]interface{}
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid JSON")
	}

	userID := uint(c.Locals("user_id").(float64))

	// Marshal map to JSON string for storage
	jsonBytes, err := json.Marshal(req)
	if err != nil {
		return utils.Error(c, 500, "Failed to process data")
	}

	if err := database.PostgresDB.Model(&models.Admin{}).Where("id = ?", userID).Update("preferences", string(jsonBytes)).Error; err != nil {
		return utils.Error(c, 500, "Failed to update preferences")
	}

	return utils.Success(c, "Preferences updated")
}

func UpdateRoleHandler(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return utils.Error(c, 400, "Invalid Role ID")
	}

	type Req struct {
		Name        string   `json:"name"`
		Permissions []string `json:"permissions"`
	}
	var req Req
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request body")
	}

	if err := service.UpdateRole(uint(id), req.Name, req.Permissions); err != nil {
		return utils.Error(c, 500, err.Error())
	}
	return utils.Success(c, "Role updated successfully")
}

func DeleteRoleHandler(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return utils.Error(c, 400, "Invalid Role ID")
	}

	if err := service.DeleteRole(uint(id)); err != nil {
		return utils.Error(c, 400, err.Error())
	}
	return utils.Success(c, "Role deleted successfully")
}

func UpdateAdminRoleHandler(c *fiber.Ctx) error {
	type Req struct {
		AdminID uint `json:"admin_id"`
		RoleID  uint `json:"role_id"`
	}
	var req Req
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)

	if err := service.UpdateAdminRole(req.AdminID, req.RoleID, actorID, actorRole); err != nil {
		return utils.Error(c, 400, err.Error())
	}

	return utils.Success(c, "Admin role updated successfully")
}
