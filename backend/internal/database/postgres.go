package database

import (
	"E-voting/internal/config"
	"E-voting/internal/models"
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var PostgresDB *gorm.DB

func ConnectPostgres() {
	cfg := config.Config.Postgres

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		cfg.Host,
		cfg.User,
		cfg.Password,
		cfg.DBName,
		cfg.Port,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		log.Fatal(" Failed to connect to PostgreSQL:", err)
	}

	PostgresDB = db
	db.AutoMigrate(
		&models.Role{},
		&models.Admin{},
		&models.Voter{},
		&models.Party{},
		&models.Candidate{},
		&models.Vote{},
	)
	log.Println(" PostgreSQL connected & Migrated")
}
