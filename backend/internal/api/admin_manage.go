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
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

func getAggregatedPermissions(roles []models.Role) string {
	permSet := make(map[string]bool)
	for _, role := range roles {
		perms := strings.Split(role.Permissions, ",")
		for _, p := range perms {
			cleanP := strings.TrimSpace(p)
			if cleanP != "" {
				permSet[cleanP] = true
			}
		}
	}
	var aggregated []string
	for p := range permSet {
		aggregated = append(aggregated, p)
	}
	return strings.Join(aggregated, ",")
}

type CreateSubAdminRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	RoleIDs  []uint `json:"role_ids"`
}

type AssignRolesRequest struct {
	AdminID uint   `json:"admin_id"`
	RoleIDs []uint `json:"role_ids"`
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

	userIDLocal := c.Locals("user_id")
	roleLocal := c.Locals("role")

	if userIDLocal == nil || roleLocal == nil {
		return utils.Error(c, 401, "Unauthorized: user data missing")
	}

	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)

	var roles []models.Role
	if err := database.PostgresDB.Where("id IN ?", req.RoleIDs).Find(&roles).Error; err != nil {
		return utils.Error(c, 404, "One or more roles not found")
	}

	hashedPassword, _ := utils.HashPassword(req.Password)
	newAdmin := models.Admin{
		Email:    req.Email,
		Password: hashedPassword,
		Roles:    roles,
		IsSuper:  false,
		IsActive: true,
	}

	if err := database.PostgresDB.Create(&newAdmin).Error; err != nil {
		return utils.Error(c, 500, "Failed to create admin")
	}

	service.LogAdminAction(actorID, actorRole, "CREATE_SUB_ADMIN", newAdmin.ID, map[string]interface{}{"email": req.Email})

	return utils.Success(c, "Sub Admin created successfully")
}

func ListAdmins(c *fiber.Ctx) error {
	var admins []models.Admin
	if err := database.PostgresDB.Preload("Roles").Find(&admins).Error; err != nil {
		return utils.Error(c, 500, "Failed to fetch admins")
	}

	response := make([]fiber.Map, 0)
	for _, a := range admins {
		var roleNames []string
		for _, r := range a.Roles {
			roleNames = append(roleNames, r.Name)
		}

		response = append(response, fiber.Map{
			"id":           a.ID,
			"name":         a.Name,
			"email":        a.Email,
			"roles":        roleNames,
			"is_active":    a.IsActive,
			"is_available": a.IsAvailable,
			"is_super":     a.IsSuper,
			"created":      a.CreatedAt,
		})
	}

	return utils.Success(c, response)
}

func AssignRolesHandler(c *fiber.Ctx) error {
	var req AssignRolesRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	var admin models.Admin
	if err := database.PostgresDB.First(&admin, req.AdminID).Error; err != nil {
		return utils.Error(c, 404, "Admin not found")
	}

	if admin.IsSuper {
		return utils.Error(c, 403, "Cannot change roles for Super Admin")
	}

	var roles []models.Role
	if len(req.RoleIDs) > 0 {
		if err := database.PostgresDB.Where("id IN ?", req.RoleIDs).Find(&roles).Error; err != nil {
			return utils.Error(c, 500, "Failed to fetch roles")
		}
	}

	if err := database.PostgresDB.Model(&admin).Association("Roles").Replace(roles); err != nil {
		return utils.Error(c, 500, "Failed to assign roles")
	}

	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)
	service.LogAdminAction(actorID, actorRole, "ASSIGN_ROLES", admin.ID, nil)

	return utils.Success(c, "Roles updated successfully")
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
	if err := database.PostgresDB.Preload("Roles").First(&admin, userID).Error; err != nil {
		return utils.Error(c, 404, "Admin not found")
	}

	if admin.IsSuper && req.Email != admin.Email {
		return utils.Error(c, 403, "Super Admin email is restricted")
	}

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

	combinedPerms := getAggregatedPermissions(admin.Roles)
	roleNames := "Multi-Role"
	if len(admin.Roles) == 1 {
		roleNames = admin.Roles[0].Name
	}

	token, err := utils.GenerateJWT(admin.ID, roleNames, combinedPerms, admin.IsSuper, admin.Name, admin.Email, admin.Avatar)
	if err != nil {
		return utils.Error(c, 500, "Token generation failed")
	}

	return utils.Success(c, fiber.Map{"token": token})
}

func UploadAvatar(c *fiber.Ctx) error {
	userIDFloat, ok := c.Locals("user_id").(float64)
	if !ok {
		return utils.Error(c, 401, "Invalid session")
	}
	userID := uint(userIDFloat)

	file, err := c.FormFile("avatar")
	if err != nil {
		return utils.Error(c, 400, "No image uploaded")
	}

	if file.Size > 2*1024*1024 {
		return utils.Error(c, 400, "Image too large (Max 2MB)")
	}

	filename := fmt.Sprintf("admin_%d_%d%s", userID, time.Now().Unix(), filepath.Ext(file.Filename))
	savePath := filepath.Join("./uploads/avatars", filename)

	if err := c.SaveFile(file, savePath); err != nil {
		return utils.Error(c, 500, "Failed to save image")
	}

	avatarURL := "/uploads/avatars/" + filename
	if err := database.PostgresDB.Model(&models.Admin{}).Where("id = ?", userID).Update("avatar", avatarURL).Error; err != nil {
		return utils.Error(c, 500, "Failed to update database")
	}

	var admin models.Admin
	if err := database.PostgresDB.Preload("Roles").First(&admin, userID).Error; err != nil {
		return utils.Error(c, 500, "Failed to fetch user")
	}

	combinedPerms := getAggregatedPermissions(admin.Roles)
	roleNames := "Multi-Role"
	if len(admin.Roles) == 1 {
		roleNames = admin.Roles[0].Name
	}

	token, err := utils.GenerateJWT(admin.ID, roleNames, combinedPerms, admin.IsSuper, admin.Name, admin.Email, admin.Avatar)
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

	jsonBytes, err := json.Marshal(req)
	if err != nil {
		return utils.Error(c, 500, "Failed to process data")
	}

	if err := database.PostgresDB.Model(&models.Admin{}).Where("id = ?", userID).Update("preferences", string(jsonBytes)).Error; err != nil {
		return utils.Error(c, 500, "Failed to update preferences")
	}

	return utils.Success(c, "Preferences updated")
}

func GetAllVoters(c *fiber.Ctx) error {
	voters, err := repository.GetAllVoters()
	if err != nil {
		return utils.Error(c, 500, "Failed to fetch voters")
	}
	fmt.Printf("Fetched %d voters from database.\n", len(voters))
	return utils.Success(c, voters)
}

// func DeleteVoter(c *fiber.Ctx) error {
// 	id, err := c.ParamsInt("id")
// 	if err != nil {
// 		return utils.Error(c, 400, "Invalid Voter ID")
// 	}

// 	if err := database.PostgresDB.Delete(&models.Voter{}, id).Error; err != nil {
// 		return utils.Error(c, 500, "Failed to delete voter")
// 	}

// 	return utils.Success(c, "Voter deleted successfully")
// }

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

// func UpdateAdminRoleHandler(c *fiber.Ctx) error {
// 	type Req struct {
// 		AdminID uint `json:"admin_id"`
// 		RoleID  uint `json:"role_id"`
// 	}
// 	var req Req
// 	if err := c.BodyParser(&req); err != nil {
// 		return utils.Error(c, 400, "Invalid request")
// 	}

// 	actorID := uint(c.Locals("user_id").(float64))
// 	actorRole := c.Locals("role").(string)

// 	if err := service.UpdateAdminRole(req.AdminID, req.RoleID, actorID, actorRole); err != nil {
// 		return utils.Error(c, 400, err.Error())
// 	}

// 	return utils.Success(c, "Admin role updated successfully")
// }

func UpdateAdminRoleHandler(c *fiber.Ctx) error {
	return AssignRolesHandler(c)
}

func ToggleAvailabilityHandler(c *fiber.Ctx) error {
	var req struct {
		AdminID uint `json:"admin_id"`
	}
	if err := c.BodyParser(&req); err != nil {
		return utils.Error(c, 400, "Invalid request")
	}

	actorID := uint(c.Locals("user_id").(float64))
	actorRole := c.Locals("role").(string)

	if err := service.ToggleAdminAvailability(req.AdminID, actorID, actorRole); err != nil {
		return utils.Error(c, 500, err.Error())
	}

	return utils.Success(c, "Availability status updated")
}
