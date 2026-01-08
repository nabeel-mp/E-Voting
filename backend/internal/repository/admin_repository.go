package repository

import (
	"E-voting/internal/database"
	"E-voting/internal/models"

	"gorm.io/gorm"
)

func FindAdminByEmail(email string) (*models.Admin, error) {
	var admin models.Admin
	err := database.PostgresDB.
		Preload("Role").
		Where("email = ? AND is_active = true", email).
		First(&admin).Error
	return &admin, err
}

func ActiveAdmin(db *gorm.DB) *gorm.DB {
	return db.Where("is_active = ?", true)
}

func CreateSubAdmin(admin *models.Admin) error {
	return database.PostgresDB.Create(admin).Error
}

func GetAllAdmins() ([]models.Admin, error) {
	var admins []models.Admin
	err := database.PostgresDB.Scopes(ActiveAdmin).Preload("Role").Find(&admins).Error
	return admins, err
}

func FindAdminByID(id uint) (*models.Admin, error) {
	var admin models.Admin
	err := database.PostgresDB.Preload("Role").First(&admin, id).Error
	return &admin, err
}

func UpdateAdminStatus(id uint, status bool) error {
	return database.PostgresDB.
		Model(&models.Admin{}).
		Where("id = ?", id).
		Update("is_active", status).
		Error
}
