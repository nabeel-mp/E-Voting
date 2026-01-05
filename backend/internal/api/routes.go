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

	auth := app.Group("/auth")
	auth.Post("/admin/login", AdminLogin)
	auth.Post("/voter/login", VoterLogin)
	auth.Post("/voter/verify-otp", VerifyOTP)

	// voter := app.Group("/vote", middleware.PermissionMiddleware("VOTER"))

	adminAction := app.Group("/admin")

	adminAction.Post("/voter/register", middleware.PermissionMiddleware("register_voter"), RegisterVoter)

	superAdmin := app.Group("/auth/admin", middleware.PermissionMiddleware("SUPER_ADMIN"))

	// Role & Permission Management
	superAdmin.Post("/roles", CreateRoleHandler)
	superAdmin.Get("/roles", ListRolesHandler)

	// Admin Account Management
	superAdmin.Post("/create-sub-admin", middleware.PermissionMiddleware("manage_admins"), CreateSubAdmin)
	superAdmin.Get("/list", ListAdmins)
	superAdmin.Post("/block", BlockSubAdmin)
	superAdmin.Post("/unblock", UnblockSubAdmin)

	// System Audit Logs
	app.Get("/audit/logs", middleware.PermissionMiddleware("SUPER_ADMIN"), GetAuditLogs)

	// Secure Test Route
	superAdmin.Get("/secure", func(c *fiber.Ctx) error {
		return utils.Success(c, "Welcome Super Admin")
	})
}
