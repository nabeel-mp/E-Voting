package repository

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
)

func FindAdminByEmail(email string) (*models.Admin, error) {
	var admin models.Admin
	err := database.PostgresDB.
		Where("email = ? AND is_active = true", email).
		First(&admin).Error
	return &admin, err
}

func CreateAdmin(admin *models.Admin) error {
	return database.PostgresDB.Create(admin).Error
}

func CreateSubAdmin(admin *models.Admin) error {
	return database.PostgresDB.Create(admin).Error
}
