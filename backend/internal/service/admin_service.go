package service

import (
	"E-voting/internal/models"
	"E-voting/internal/repository"
	"E-voting/internal/utils"
	"errors"
)

func CreateSubAdmin(
	email, password string,
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
		Role:     "SUB_ADMIN",
		IsActive: true,
	}

	err = repository.CreateAdmin(admin)
	if err != nil {
		return errors.New("admin already exists")
	}

	LogAdminAction(
		actorID,
		actorRole,
		"CREATE_SUB_ADMIN",
		admin.ID,
		map[string]interface{}{
			"email": email,
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
	requesterID uint,
	requesterRole string,
	block bool,
) error {

	admin, err := repository.FindAdminByID(targetAdminID)
	if err != nil {
		return errors.New("admin not found")
	}

	if admin.Role == "SUPER_ADMIN" {
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
