package api

import (
	"E-voting/internal/middleware"
	"E-voting/internal/service"
	"E-voting/internal/utils"

	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App) {

	app.Get("/health", func(c *fiber.Ctx) error {
		return utils.Success(c, service.HealthCheck())
	})
	app.Post("/auth/admin/login", AdminLogin)

	app.Get("/admin/secure",
		middleware.AuthMiddleware("SUPER_ADMIN"),
		func(c *fiber.Ctx) error {
			return utils.Success(c, "Welcome Super Admin")
		},
	)

	app.Post("/auth/voter/register", middleware.AuthMiddleware("SUB_ADMIN"), RegisterVoter)
	app.Post("/auth/voter/login", VoterLogin)

}
