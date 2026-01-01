package main

import (
	"E-voting/internal/config"
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/utils"
	"fmt"
	"log"
)

func Main() {
	config.LoadConfig()
	database.ConnectPostgres()

	password, _ := utils.HashPassword("super786")

	admin := models.Admin{
		Email:    "nabeelmp698@gmail.com",
		Password: password,
		Role:     "SUPER_ADMIN",
		IsActive: true,
	}

	err := database.PostgresDB.Create(&admin).Error
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(" Super Admin created")
}
