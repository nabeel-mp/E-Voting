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

func GetAllAdmins() ([]models.Admin, error) {
	var admins []models.Admin
	err := database.PostgresDB.Find(&admins).Error
	return admins, err
}

func FindAdminByID(id uint) (*models.Admin, error) {
	var admin models.Admin
	err := database.PostgresDB.First(&admin, id).Error
	return &admin, err
}

func UpdateAdminStatus(id uint, status bool) error {
	return database.PostgresDB.
		Model(&models.Admin{}).
		Where("id = ?", id).
		Update("is_active", status).
		Error
}
