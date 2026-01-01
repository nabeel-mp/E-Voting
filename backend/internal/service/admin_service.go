package service

import (
	"E-voting/internal/repository"
	"E-voting/internal/utils"
	"errors"
)

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
