package main

import (
	"E-voting/internal/api"
	"E-voting/internal/config"
	"E-voting/internal/database"
	"log"

	"github.com/gofiber/fiber/v2"
)

func main() {

	config.LoadConfig()

	database.ConnectPostgres()
	database.ConnectMongo()

	app := fiber.New()

	api.RegisterRoutes(app)

	log.Printf(" %s running on port %s",
		config.Config.AppName,
		config.Config.Port,
	)

	log.Fatal(app.Listen(":" + config.Config.Port))
}
