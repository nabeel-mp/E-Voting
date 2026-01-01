package repository

import "E-voting/internal/database"

func CheckPostgres() bool {
	db := database.PostgresDB
	sqlDB, err := db.DB()
	if err != nil {
		return false
	}
	return sqlDB.Ping() == nil
}

func CheckMongo() bool {
	return database.MongoDB != nil
}
