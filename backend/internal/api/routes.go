// package api

// import (
// 	"E-voting/internal/middleware"
// 	"E-voting/internal/service"
// 	"E-voting/internal/utils"

// 	"github.com/gofiber/fiber/v2"
// )

// func RegisterRoutes(app *fiber.App) {

// 	app.Get("/health", func(c *fiber.Ctx) error {
// 		return utils.Success(c, service.HealthCheck())
// 	})

// 	// auth := app.Group("/auth")
// 	// // auth.Post("/admin/login", AdminLogin)
// 	// auth.Post("/voter/login", VoterLogin)
// 	// auth.Post("/voter/verify-otp", VerifyOTP)

// 	// voter := app.Group("/vote", middleware.PermissionMiddleware("VOTER"))

// 	app.Get("/admin/login", func(c *fiber.Ctx) error {
// 		return c.Render("admin/login", nil)
// 	})
// 	app.Get("/admin/roles/create", middleware.PermissionMiddleware("SUPER_ADMIN"), func(c *fiber.Ctx) error {
// 		return c.Render("admin/create_role", nil)
// 	})
// 	app.Get("/admin/staff/add", middleware.PermissionMiddleware("SUPER_ADMIN"), func(c *fiber.Ctx) error {
// 		return c.Render("admin/add_staff", nil)
// 	})
// 	app.Get("/admin/audit-logs", middleware.PermissionMiddleware("SUPER_ADMIN"), func(c *fiber.Ctx) error {
// 		return c.Render("admin/audit_logs", nil)
// 	})
// 	app.Get("/admin/voters", middleware.PermissionMiddleware("register_voter"), func(c *fiber.Ctx) error {
// 		return c.Render("admin/voters", nil)
// 	})
// 	app.Get("/admin/candidates", middleware.PermissionMiddleware("SUPER_ADMIN"), func(c *fiber.Ctx) error {
// 		return c.Render("admin/candidates", nil)
// 	})
// 	app.Get("/admin/results", middleware.PermissionMiddleware("view_results"), func(c *fiber.Ctx) error {
// 		return c.Render("admin/results", nil)
// 	})
// 	app.Get("/admin/settings", func(c *fiber.Ctx) error {
// 		return c.Render("admin/settings", nil)
// 	})

// 	auth := app.Group("/api/auth")
// 	auth.Post("/admin/login", AdminLogin)

// 	adminAuth := app.Group("/api/admin", middleware.PermissionMiddleware(""))
// 	adminAuth.Put("/update-profile", UpdateAdminProfile)

// 	adminGroup := app.Group("/admin", middleware.PermissionMiddleware("SUPER_ADMIN")) // Base middleware to check token

// 	adminGroup.Get("/dashboard", GetDashboardData)
// 	adminGroup.Get("/voters", func(c *fiber.Ctx) error { return c.Render("admin/voters", nil) })
// 	adminGroup.Get("/results", func(c *fiber.Ctx) error { return c.Render("admin/results", nil) })

// 	adminAction := app.Group("/api/admin", middleware.PermissionMiddleware("register_voter"))
// 	adminAction.Get("/voters", ListVoters) // The new function created in Step 1
// 	adminAction.Post("/voter/register", RegisterVoter)
// 	// adminAction := app.Group("/admin")

// 	// adminAction.Post("/voter/register", middleware.PermissionMiddleware("register_voter"), RegisterVoter)

// 	superAdminPage := app.Group("/admin", middleware.PermissionMiddleware("SUPER_ADMIN"))
// 	superAdminPage.Get("/roles/create", func(c *fiber.Ctx) error { return c.Render("admin/create_role", nil) })
// 	superAdminPage.Get("/staff/add", func(c *fiber.Ctx) error { return c.Render("admin/add_staff", nil) })
// 	superAdminPage.Get("/audit-logs", func(c *fiber.Ctx) error { return c.Render("admin/audit_logs", nil) })

// 	admin := app.Group("/api/admin", middleware.PermissionMiddleware("SUPER_ADMIN"))
// 	admin.Post("/parties", CreateParty)
// 	admin.Get("/parties", ListParties)
// 	admin.Post("/candidates", CreateCandidate)
// 	admin.Get("/candidates", ListCandidates)

// 	view := app.Group("/api", middleware.PermissionMiddleware("view_results"))
// 	view.Get("/election-results", GetElectionResults)

// 	// Admin Account Management
// 	// superAdmin.Post("/create-sub-admin", middleware.PermissionMiddleware("manage_admins"), CreateSubAdmin)
// 	// superAdmin.Get("/list", ListAdmins)
// 	// superAdmin.Post("/block", BlockSubAdmin)
// 	// superAdmin.Post("/unblock", UnblockSubAdmin)

// 	// System Audit Logs
// 	app.Get("/audit/logs", middleware.PermissionMiddleware("SUPER_ADMIN"), GetAuditLogs)

//		// Secure Test Route
//		// superAdmin.Get("/secure", func(c *fiber.Ctx) error {
//		// 	return utils.Success(c, "Welcome Super Admin")
//		// })
//	}
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

	// --- VIEW ROUTES (HTML) ---
	app.Get("/admin/login", func(c *fiber.Ctx) error {
		return c.Render("admin/login", nil)
	})

	// Protected Pages (Middleware verifies token presence/validity if applied,
	// but usually rendered pages are protected by client-side JS redirection if API fails.
	// We allow rendering, main.js will redirect if no token.)
	app.Get("/admin/dashboard", func(c *fiber.Ctx) error { return c.Render("admin/Dashboard", nil) })
	app.Get("/admin/settings", func(c *fiber.Ctx) error { return c.Render("admin/settings", nil) })
	app.Get("/admin/voters", func(c *fiber.Ctx) error { return c.Render("admin/voters", nil) })
	app.Get("/admin/results", func(c *fiber.Ctx) error { return c.Render("admin/results", nil) })
	app.Get("/admin/system-admins", func(c *fiber.Ctx) error { return c.Render("admin/admin", nil) })

	// Super Admin Pages
	// Ideally shielded by middleware, but client-side also handles it.
	superAdminPages := app.Group("/admin", middleware.PermissionMiddleware("SUPER_ADMIN"))
	superAdminPages.Get("/roles/create", func(c *fiber.Ctx) error { return c.Render("admin/create_role", nil) })
	superAdminPages.Get("/staff/add", func(c *fiber.Ctx) error { return c.Render("admin/add_staffs", nil) })
	superAdminPages.Get("/audit-logs", func(c *fiber.Ctx) error { return c.Render("admin/audit_logs", nil) })
	superAdminPages.Get("/candidates", func(c *fiber.Ctx) error { return c.Render("admin/candidates", nil) })

	// --- API ROUTES ---

	// 1. Auth Routes (Public)
	auth := app.Group("/api/auth")
	auth.Post("/admin/login", AdminLogin)
	auth.Post("/voter/login", VoterLogin)
	auth.Post("/voter/verify-otp", VerifyOTP)

	// 2. Admin API Routes

	// General Admin Profile
	adminAPI := app.Group("/api/admin", middleware.PermissionMiddleware(""))
	adminAPI.Put("/update-profile", UpdateAdminProfile)
	adminAPI.Get("/dashboard", GetDashboardData)

	// Voter Management (Requires 'register_voter' permission)
	voterMgmt := app.Group("/api/admin", middleware.PermissionMiddleware("register_voter"))
	voterMgmt.Get("/voters", ListVoters)
	voterMgmt.Post("/voter/register", RegisterVoter)

	// Results (Requires 'view_results' permission)
	resultsAPI := app.Group("/api/admin", middleware.PermissionMiddleware("view_results"))
	resultsAPI.Get("/election-results", GetElectionResults)

	// Candidates & Parties (Super Admin)
	candidateAPI := app.Group("/api/admin", middleware.PermissionMiddleware("SUPER_ADMIN"))
	candidateAPI.Post("/parties", CreateParty)
	candidateAPI.Get("/parties", ListParties)
	candidateAPI.Post("/candidates", CreateCandidate)
	candidateAPI.Get("/candidates", ListCandidates)

	// Staff & Role Management (Super Admin & 'manage_admins')
	// Mapped to match existing frontend AJAX calls
	staffMgmt := app.Group("/api/auth/admin", middleware.PermissionMiddleware("manage_admins"))
	staffMgmt.Post("/create-sub-admin", CreateSubAdmin)
	staffMgmt.Get("/roles", ListRolesHandler)
	staffMgmt.Post("/roles", CreateRoleHandler)

	// Admin List & Block (Matching admin.html legacy route)
	// admin.html calls /auth/admin/list.
	superAdminLegacy := app.Group("/auth/admin", middleware.PermissionMiddleware("SUPER_ADMIN"))
	superAdminLegacy.Get("/list", ListAdmins)
	superAdminLegacy.Post("/block", BlockSubAdmin)
	superAdminLegacy.Post("/unblock", UnblockSubAdmin)

	// Audit Logs
	app.Get("/api/audit/logs", middleware.PermissionMiddleware("SUPER_ADMIN"), GetAuditLogs)
}
