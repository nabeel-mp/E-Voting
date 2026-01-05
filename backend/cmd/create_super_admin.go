package main

import (
	"E-voting/internal/config"
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/utils"
	"fmt"
	"log"

	"gorm.io/gorm"
)

func Main() {
	config.LoadConfig()
	database.ConnectPostgres()

	err := database.PostgresDB.Transaction(func(tx *gorm.DB) error {
		role := models.Role{
			Name:        "SUPER_ADMIN",
			Permissions: "all",
		}

		if err := tx.Where(models.Role{Name: "SUPER_ADMIN"}).FirstOrCreate(&role).Error; err != nil {
			return err
		}

		password, err := utils.HashPassword("super786")
		if err != nil {
			return err
		}

		admin := models.Admin{
			Email:    "nabeelmp698@gmail.com",
			Password: password,
			RoleID:   role.ID,
			IsSuper:  true,
			IsActive: true,
		}

		return tx.Where(models.Admin{Email: admin.Email}).FirstOrCreate(&admin).Error
	})

	if err != nil {
		log.Fatalf("Failed to seed Super Admin: %v", err)
	}

	fmt.Println("Successfully created Super Admin and linked to Role.")
}
