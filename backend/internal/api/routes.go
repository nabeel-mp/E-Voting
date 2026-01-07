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

	// auth := app.Group("/auth")
	// // auth.Post("/admin/login", AdminLogin)
	// auth.Post("/voter/login", VoterLogin)
	// auth.Post("/voter/verify-otp", VerifyOTP)

	// voter := app.Group("/vote", middleware.PermissionMiddleware("VOTER"))

	app.Get("/admin/login", func(c *fiber.Ctx) error {
		return c.Render("admin/login", nil)
	})
	app.Get("/admin/roles/create", middleware.PermissionMiddleware("SUPER_ADMIN"), func(c *fiber.Ctx) error {
		return c.Render("admin/create_role", nil)
	})
	app.Get("/admin/staff/add", middleware.PermissionMiddleware("SUPER_ADMIN"), func(c *fiber.Ctx) error {
		return c.Render("admin/add_staff", nil)
	})
	app.Get("/admin/audit-logs", middleware.PermissionMiddleware("SUPER_ADMIN"), func(c *fiber.Ctx) error {
		return c.Render("admin/audit_logs", nil)
	})
	app.Get("/admin/voters", middleware.PermissionMiddleware("register_voter"), func(c *fiber.Ctx) error {
		return c.Render("admin/voters", nil)
	})
	app.Get("/admin/candidates", middleware.PermissionMiddleware("SUPER_ADMIN"), func(c *fiber.Ctx) error {
		return c.Render("admin/candidates", nil)
	})
	app.Get("/admin/results", middleware.PermissionMiddleware("view_results"), func(c *fiber.Ctx) error {
		return c.Render("admin/results", nil)
	})
	app.Get("/admin/settings", func(c *fiber.Ctx) error {
		return c.Render("admin/settings", nil)
	})

	auth := app.Group("/api/auth")
	auth.Post("/admin/login", AdminLogin)

	adminAuth := app.Group("/api/admin", middleware.PermissionMiddleware(""))
	adminAuth.Put("/update-profile", UpdateAdminProfile)

	adminGroup := app.Group("/admin", middleware.PermissionMiddleware("SUPER_ADMIN")) // Base middleware to check token

	adminGroup.Get("/dashboard", GetDashboardData)
	adminGroup.Get("/voters", func(c *fiber.Ctx) error { return c.Render("admin/voters", nil) })
	adminGroup.Get("/results", func(c *fiber.Ctx) error { return c.Render("admin/results", nil) })

	adminAction := app.Group("/api/admin", middleware.PermissionMiddleware("register_voter"))
	adminAction.Get("/voters", ListVoters) // The new function created in Step 1
	adminAction.Post("/voter/register", RegisterVoter)
	// adminAction := app.Group("/admin")

	// adminAction.Post("/voter/register", middleware.PermissionMiddleware("register_voter"), RegisterVoter)

	superAdminPage := app.Group("/admin", middleware.PermissionMiddleware("SUPER_ADMIN"))
	superAdminPage.Get("/roles/create", func(c *fiber.Ctx) error { return c.Render("admin/create_role", nil) })
	superAdminPage.Get("/staff/add", func(c *fiber.Ctx) error { return c.Render("admin/add_staff", nil) })
	superAdminPage.Get("/audit-logs", func(c *fiber.Ctx) error { return c.Render("admin/audit_logs", nil) })

	admin := app.Group("/api/admin", middleware.PermissionMiddleware("SUPER_ADMIN"))
	admin.Post("/parties", CreateParty)
	admin.Get("/parties", ListParties)
	admin.Post("/candidates", CreateCandidate)
	admin.Get("/candidates", ListCandidates)

	view := app.Group("/api", middleware.PermissionMiddleware("view_results"))
	view.Get("/election-results", GetElectionResults)

	// Admin Account Management
	// superAdmin.Post("/create-sub-admin", middleware.PermissionMiddleware("manage_admins"), CreateSubAdmin)
	// superAdmin.Get("/list", ListAdmins)
	// superAdmin.Post("/block", BlockSubAdmin)
	// superAdmin.Post("/unblock", UnblockSubAdmin)

	// System Audit Logs
	app.Get("/audit/logs", middleware.PermissionMiddleware("SUPER_ADMIN"), GetAuditLogs)

	// Secure Test Route
	// superAdmin.Get("/secure", func(c *fiber.Ctx) error {
	// 	return utils.Success(c, "Welcome Super Admin")
	// })
}
