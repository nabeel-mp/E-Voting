package database

import (
	"E-voting/internal/models"
	"E-voting/internal/utils"
	"log"

	"gorm.io/gorm"
)

func SeedSuperAdmin() {
	err := PostgresDB.Transaction(func(tx *gorm.DB) error {
		// 1. Ensure the Role exists
		role := models.Role{
			Name:        "SUPER_ADMIN",
			Permissions: "all",
		}
		if err := tx.Where(models.Role{Name: "SUPER_ADMIN"}).FirstOrCreate(&role).Error; err != nil {
			return err
		}

		// 2. Define Super Admin credentials
		email := "nabeelmp698@gmail.com"
		password := "super786" // Default Password

		// 3. Check if Admin exists
		var count int64
		tx.Model(&models.Admin{}).Where("email = ?", email).Count(&count)
		if count > 0 {
			return nil // Admin already exists, skip
		}

		// 4. Create Admin if not exists
		hashedPwd, err := utils.HashPassword(password)
		if err != nil {
			return err
		}

		admin := models.Admin{
			Email:    email,
			Password: hashedPwd,
			RoleID:   role.ID,
			IsSuper:  true,
			IsActive: true,
		}

		if err := tx.Create(&admin).Error; err != nil {
			return err
		}

		log.Println(" Super Admin Account seeded successfully")
		return nil
	})

	if err != nil {
		log.Printf(" Failed to seed Super Admin: %v", err)
	}
}
