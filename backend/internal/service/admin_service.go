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
