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
	Postgres  struct {
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
	Blockchain struct {
		URL             string
		PrivateKey      string
		ContractAddress string
	}
	Twilio struct {
		AccountSID string
		AuthToken  string
		FromNumber string
	}
}

var Config AppConfig

func LoadConfig() {
	_ = godotenv.Load()

	Config = AppConfig{
		AppName:   os.Getenv("APP_NAME"),
		Port:      os.Getenv("APP_PORT"),
		Env:       os.Getenv("APP_ENV"),
		JWTSecret: os.Getenv("JWT_SECRET"),
	}

	ifnD := func(val, def string) string {
		if val == "" {
			return def
		}
		return val
	}
	Config.Port = ifnD(Config.Port, "8080")

	Config.Postgres.Host = os.Getenv("POSTGRES_HOST")
	Config.Postgres.Port = os.Getenv("POSTGRES_PORT")
	Config.Postgres.User = os.Getenv("POSTGRES_USER")
	Config.Postgres.Password = os.Getenv("POSTGRES_PASSWORD")
	Config.Postgres.DBName = os.Getenv("POSTGRES_DB")

	Config.Mongo.URI = os.Getenv("MONGO_URI")
	Config.Mongo.DB = os.Getenv("MONGO_DB")

	Config.Blockchain.URL = os.Getenv("BLOCKCHAIN_URL")
	Config.Blockchain.PrivateKey = os.Getenv("BLOCKCHAIN_PRIVATE_KEY")
	Config.Blockchain.ContractAddress = os.Getenv("BLOCKCHAIN_CONTRACT_ADDRESS")

	Config.Twilio.AccountSID = os.Getenv("TWILIO_ACCOUNT_SID")
	Config.Twilio.AuthToken = os.Getenv("TWILIO_AUTH_TOKEN")
	Config.Twilio.FromNumber = os.Getenv("TWILIO_PHONE_NUMBER")

	log.Println("Config loaded")
}
