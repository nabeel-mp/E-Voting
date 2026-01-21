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

	// // --- VIEW ROUTES (HTML) ---
	// app.Get("/admin/login", func(c *fiber.Ctx) error {
	// 	return c.Render("admin/login", nil)
	// })

	// // Protected Pages (Middleware verifies token presence/validity if applied,
	// // but usually rendered pages are protected by client-side JS redirection if API fails.
	// // We allow rendering, main.js will redirect if no token.)
	// app.Get("/admin/dashboard", func(c *fiber.Ctx) error { return c.Render("admin/Dashboard", nil) })
	// app.Get("/admin/settings", func(c *fiber.Ctx) error { return c.Render("admin/settings", nil) })
	// app.Get("/admin/voters", func(c *fiber.Ctx) error { return c.Render("admin/voters", nil) })
	// app.Get("/admin/results", func(c *fiber.Ctx) error { return c.Render("admin/results", nil) })
	// app.Get("/admin/system-admins", func(c *fiber.Ctx) error { return c.Render("admin/admin", nil) })

	// // Super Admin Pages
	// // Ideally shielded by middleware, but client-side also handles it.
	// superAdminPages := app.Group("/admin")
	// superAdminPages.Get("/roles/create", func(c *fiber.Ctx) error { return c.Render("admin/create_role", nil) })
	// superAdminPages.Get("/staff/add", func(c *fiber.Ctx) error { return c.Render("admin/add_staffs", nil) })
	// superAdminPages.Get("/audit-logs", func(c *fiber.Ctx) error { return c.Render("admin/audit_logs", nil) })
	// superAdminPages.Get("/candidates", func(c *fiber.Ctx) error { return c.Render("admin/candidates", nil) })

	// --- API ROUTES ---

	// 1. Auth Routes (Public)
	auth := app.Group("/api/auth")
	auth.Post("/admin/login", AdminLogin)
	auth.Post("/voter/login", VoterLogin)
	auth.Post("/voter/verify-otp", VerifyOTP)

	voterApp := app.Group("/api/voter", middleware.PermissionMiddleware(""))
	voterApp.Get("/elections", GetVoterElections)
	voterApp.Get("/elections/:id/candidates", GetVoterCandidates)
	voterApp.Post("/vote", CastVote)

	// 2. Admin API Routes

	// General Admin Profile
	adminAPI := app.Group("/api/admin", middleware.PermissionMiddleware(""))
	adminAPI.Get("/dashboard", GetDashboardData)
	adminAPI.Put("/update-profile", UpdateAdminProfile)
	adminAPI.Put("/change-password", ChangePassword)
	adminAPI.Post("/upload-avatar", UploadAvatar)
	adminAPI.Put("/notifications", UpdateNotifications)

	// Voter Management (Requires 'register_voter' permission)
	voterMgmt := app.Group("/api/admin", middleware.PermissionMiddleware("register_voter"))
	voterMgmt.Get("/voters", ListVoters)
	voterMgmt.Post("/voter/register", RegisterVoter)
	voterMgmt.Post("/voter/block", BlockVoter)
	voterMgmt.Post("/voter/unblock", UnblockVoter)
	voterMgmt.Get("/voters/export", ExportVotersCSV)
	voterMgmt.Post("/voters/import", ImportVotersCSV)

	voterMgmt.Post("/voter/verify", middleware.PermissionMiddleware("SUPER_ADMIN"), VerifyVoter)
	voterMgmt.Post("/voter/reject", middleware.PermissionMiddleware("SUPER_ADMIN"), RejectVoter)

	// Results (Requires 'view_results' permission)
	resultsAPI := app.Group("/api/admin", middleware.PermissionMiddleware("view_results"))
	resultsAPI.Get("/election-results", GetElectionResults)

	// Candidates & Parties (Super Admin)
	candidateAPI := app.Group("/api/admin", middleware.PermissionMiddleware("SUPER_ADMIN"))
	candidateAPI.Post("/parties", CreateParty)
	candidateAPI.Get("/parties", ListParties)
	candidateAPI.Put("/parties/:id", UpdateParty)
	candidateAPI.Delete("/parties/:id", DeleteParty)
	candidateAPI.Post("/candidates", CreateCandidate)
	candidateAPI.Get("/candidates", ListCandidates)
	candidateAPI.Put("/candidates/:id", UpdateCandidate)
	candidateAPI.Delete("/candidates/:id", DeleteCandidate)

	electionAPI := app.Group("/api/admin", middleware.PermissionMiddleware("SUPER_ADMIN"))
	electionAPI.Post("/elections", CreateElection)
	electionAPI.Put("/elections/:id", UpdateElection)
	electionAPI.Get("/elections", ListElections)
	electionAPI.Delete("/elections/:id", DeleteElection)
	electionAPI.Post("/elections/status", ToggleElectionStatus)
	electionAPI.Post("/elections/publish", ToggleElectionPublish)

	// Staff & Role Management (Super Admin & 'manage_admins')
	// Mapped to match existing frontend AJAX calls
	staffMgmt := app.Group("/api/auth/admin", middleware.PermissionMiddleware("manage_admins"))
	staffMgmt.Post("/create-sub-admin", CreateSubAdmin)
	staffMgmt.Get("/roles", ListRolesHandler)
	staffMgmt.Post("/roles", CreateRoleHandler)
	staffMgmt.Put("/roles/:id", UpdateRoleHandler)
	staffMgmt.Delete("/roles/:id", DeleteRoleHandler)

	staffMgmt.Post("/assign-roles", AssignRolesHandler)

	// Admin List & Block (Matching admin.html legacy route)
	// admin.html calls /auth/admin/list.
	superAdminLegacy := app.Group("/auth/admin", middleware.PermissionMiddleware("SUPER_ADMIN"))
	superAdminLegacy.Get("/list", ListAdmins)
	superAdminLegacy.Post("/block", BlockSubAdmin)
	superAdminLegacy.Post("/unblock", UnblockSubAdmin)
	superAdminLegacy.Post("/update-role", UpdateAdminRoleHandler)

	// Audit Logs
	app.Get("/api/audit/logs", middleware.PermissionMiddleware("SUPER_ADMIN"), GetAuditLogs)
	app.Get("/api/admin/config", middleware.PermissionMiddleware(""), GetSystemSettings)
	app.Post("/api/admin/config", middleware.PermissionMiddleware("SUPER_ADMIN"), UpdateSystemSettings)

}
