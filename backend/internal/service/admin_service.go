package service

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/repository"
	"E-voting/internal/utils"
	"errors"
	"strings"
)

func CreateRole(name string, permissions []string) error {
	role := models.Role{
		Name:        name,
		Permissions: strings.Join(permissions, ","),
	}
	return database.PostgresDB.Create(&role).Error
}

func GetRoles() ([]models.Role, error) {
	var roles []models.Role
	err := database.PostgresDB.Find(&roles).Error
	return roles, err
}

func CreateSubAdmin(
	email, password string,
	roleID uint,
	actorID uint,
	actorRole string,
) error {

	hashedPwd, err := utils.HashPassword(password)
	if err != nil {
		return err
	}

	admin := &models.Admin{
		Email:    email,
		Password: hashedPwd,
		RoleID:   roleID,
		IsActive: true,
		IsSuper:  false,
	}

	err = repository.CreateSubAdmin(admin)
	if err != nil {
		return errors.New("admin already exists")
	}

	LogAdminAction(
		actorID,
		actorRole,
		"CREATE_SUB_ADMIN",
		admin.ID,
		map[string]interface{}{
			"email":   email,
			"role_id": roleID,
		},
	)

	return nil
}

func AdminLogin(email, password string) (string, error) {
	admin, err := repository.FindAdminByEmail(email)
	if err != nil {
		return "", errors.New("invalid credentials")
	}

	if !utils.CheckPassword(password, admin.Password) {
		return "", errors.New("invalid credentials")
	}

	token, err := utils.GenerateJWT(admin.ID, admin.Role.Name, admin.Role.Permissions, admin.IsSuper, admin.Name, admin.Email, admin.Avatar)
	if err != nil {
		return "", err
	}

	return token, nil
}

func SetAdminStatus(targetID uint, requesterID uint, status bool) error {
	if targetID == requesterID {
		return errors.New("cannot modify yourself")
	}

	result := database.PostgresDB.Model(&models.Admin{}).
		Where("id = ? AND is_super = ?", targetID, false).
		Update("is_active", status)

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("admin not found or is a super admin")
	}
	return nil
}

func BlockUnblockSubAdmin(
	targetAdminID uint,
	requesterID uint,
	requesterRole string,
	block bool,
) error {

	admin, err := repository.FindAdminByID(targetAdminID)
	if err != nil {
		return errors.New("admin not found")
	}

	if admin.IsSuper {
		return errors.New("cannot modify super admin")
	}

	if admin.ID == requesterID {
		return errors.New("cannot modify yourself")
	}

	err = repository.UpdateAdminStatus(admin.ID, !block)
	if err != nil {
		return err
	}

	action := "UNBLOCK_SUB_ADMIN"
	if block {
		action = "BLOCK_SUB_ADMIN"
	}

	LogAdminAction(
		requesterID,
		requesterRole,
		action,
		admin.ID,
		map[string]interface{}{
			"email": admin.Email,
		},
	)

	return nil
}

func UpdateRole(id uint, name string, permissions []string) error {
	var role models.Role
	if err := database.PostgresDB.First(&role, id).Error; err != nil {
		return errors.New("role not found")
	}

	role.Name = name
	role.Permissions = strings.Join(permissions, ",")

	return database.PostgresDB.Save(&role).Error
}

func DeleteRole(id uint) error {
	var count int64
	database.PostgresDB.Model(&models.Admin{}).Where("role_id = ?", id).Count(&count)
	if count > 0 {
		return errors.New("cannot delete role: it is currently assigned to active staff members")
	}

	if err := database.PostgresDB.Delete(&models.Role{}, id).Error; err != nil {
		return err
	}
	return nil
}

func UpdateAdminRole(targetAdminID uint, newRoleID uint, requesterID uint, requesterRole string) error {
	// 1. Fetch Target Admin
	var targetAdmin models.Admin
	if err := database.PostgresDB.First(&targetAdmin, targetAdminID).Error; err != nil {
		return errors.New("admin not found")
	}

	// 2. Safety Checks
	if targetAdmin.IsSuper {
		return errors.New("cannot change role of a super admin")
	}
	if targetAdmin.ID == requesterID {
		return errors.New("cannot change your own role")
	}

	// 3. Update Role
	targetAdmin.RoleID = newRoleID
	if err := database.PostgresDB.Save(&targetAdmin).Error; err != nil {
		return err
	}

	// 4. Log Action
	LogAdminAction(requesterID, requesterRole, "UPDATE_ADMIN_ROLE", targetAdminID, map[string]interface{}{
		"new_role_id": newRoleID,
	})

	return nil
}
