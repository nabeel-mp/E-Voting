package service

import (
	"E-voting/internal/models"
	"E-voting/internal/repository"
	"E-voting/internal/utils"
	"errors"
)

func CreateSubAdmin(email, password string) error {
	hashedPwd, err := utils.HashPassword(password)
	if err != nil {
		return err
	}

	admin := &models.Admin{
		Email:    email,
		Password: hashedPwd,
		Role:     "SUB_ADMIN",
		IsActive: true,
	}

	err = repository.CreateSubAdmin(admin)
	if err != nil {
		return errors.New("admin already exists or invalid data")
	}

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

	token, err := utils.GenerateJWT(admin.ID, admin.Role)
	if err != nil {
		return "", err
	}

	return token, nil
}

func ListAdmins() ([]models.Admin, error) {
	return repository.GetAllAdmins()
}

func BlockUnblockSubAdmin(
	targetAdminID uint,
	requesterRole string,
	requesterID uint,
	block bool,
) error {

	admin, err := repository.FindAdminByID(targetAdminID)
	if err != nil {
		return errors.New("admin not found")
	}

	// Prevent blocking Super Admin
	if admin.Role == "SUPER_ADMIN" {
		return errors.New("cannot block super admin")
	}

	// Prevent self-block
	if admin.ID == requesterID {
		return errors.New("cannot block yourself")
	}

	// Only Sub Admins can be blocked/unblocked
	if admin.Role != "SUB_ADMIN" {
		return errors.New("invalid target admin")
	}

	return repository.UpdateAdminStatus(admin.ID, !block)
}
