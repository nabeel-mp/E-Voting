package main

import (
	"E-voting/internal/api"
	"E-voting/internal/config"
	"E-voting/internal/database"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {

	config.LoadConfig()

	database.ConnectPostgres()
	database.ConnectMongo()

	if err := os.MkdirAll("./uploads/avatars", 0755); err != nil {
		log.Fatal("Failed to create upload directory:", err)
	}

	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173, http://localhost:3000", // Allow Vite frontend
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, HEAD, PUT, DELETE, PATCH",
	}))

	app.Static("/uploads", "./uploads")
	api.RegisterRoutes(app)

	app.Static("/", "./evoting-frontend/dist")

	app.Get("*", func(c *fiber.Ctx) error {
		return c.SendFile("./evoting-frontend/dist/index.html")
	})

	log.Printf(" %s running on port %s",
		config.Config.AppName,
		config.Config.Port,
	)

	log.Fatal(app.Listen(":" + config.Config.Port))
}
