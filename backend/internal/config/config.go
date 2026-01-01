package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type AppConfig struct {
	AppName   string
	Port      string
	Env       string
	JWTSecret string

	Postgres struct {
		Host     string
		Port     string
		User     string
		Password string
		DBName   string
	}

	Mongo struct {
		URI string
		DB  string
	}
}

var Config AppConfig

func LoadConfig() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal(" Failed to load .env file")
	}

	Config = AppConfig{
		AppName:   os.Getenv("APP_NAME"),
		Port:      os.Getenv("APP_PORT"),
		Env:       os.Getenv("APP_ENV"),
		JWTSecret: os.Getenv("JWT_SECRET"),
	}

	Config.Postgres.Host = os.Getenv("POSTGRES_HOST")
	Config.Postgres.Port = os.Getenv("POSTGRES_PORT")
	Config.Postgres.User = os.Getenv("POSTGRES_USER")
	Config.Postgres.Password = os.Getenv("POSTGRES_PASSWORD")
	Config.Postgres.DBName = os.Getenv("POSTGRES_DB")

	Config.Mongo.URI = os.Getenv("MONGO_URI")
	Config.Mongo.DB = os.Getenv("MONGO_DB")

	log.Println(" Config loaded")
}
