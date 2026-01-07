package main

import (
	"E-voting/internal/api"
	"E-voting/internal/config"
	"E-voting/internal/database"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/template/html/v2"
)

func main() {

	config.LoadConfig()

	engine := html.New("./templates", ".html")

	database.ConnectPostgres()
	database.ConnectMongo()

	app := fiber.New(fiber.Config{Views: engine})

	api.RegisterRoutes(app)

	app.Get("/admin/dashboard", api.GetDashboardData)

	log.Printf(" %s running on port %s",
		config.Config.AppName,
		config.Config.Port,
	)

	log.Fatal(app.Listen(":" + config.Config.Port))
}
