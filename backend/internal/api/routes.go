package api

import (
	"E-voting/internal/middleware"
	"E-voting/internal/service"
	"E-voting/internal/utils"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(app *fiber.App) {

	app.Get("/health", func(c *fiber.Ctx) error {
		return utils.Success(c, service.HealthCheck())
	})

	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired

	})

	app.Get("/ws/notifications", websocket.New(WebSocketHandler))

	// --- PUBLIC ROUTES ---
	public := app.Group("/api/public")
	public.Get("/elections", GetPublishedElections)
	public.Get("/results", GetElectionResults)

	// --- API ROUTES ---

	// 1. Auth Routes (Public)
	auth := app.Group("/api/auth")
	auth.Post("/admin/login", AdminLogin)
	auth.Post("/admin/verify-otp", VerifyAdminOTP)
	auth.Post("/voter/login", VoterLogin)
	auth.Post("/voter/verify-otp", VerifyOTP)
	auth.Post("/voter/register", RegisterVoter)

	// Voter App Routes
	voterApp := app.Group("/api/voter", middleware.PermissionMiddleware(""))
	voterApp.Get("/elections", GetVoterElections)
	voterApp.Get("/elections/:id/candidates", GetVoterCandidates)
	voterApp.Post("/vote", CastVote)

	common := app.Group("/api/common")
	common.Get("/kerala-data", GetReferenceData)

	// 2. Admin API Routes
	adminAPI := app.Group("/api/admin", middleware.PermissionMiddleware(""))

	// General Admin Profile (No specific permission required beyond being an admin)
	adminAPI.Get("/dashboard", GetDashboardData)
	adminAPI.Put("/update-profile", UpdateAdminProfile)
	adminAPI.Put("/change-password", ChangePassword)
	adminAPI.Post("/upload-avatar", UploadAvatar)
	adminAPI.Put("/notifications", UpdateNotifications)
	adminAPI.Get("/elections", ListElections) // Viewing elections is open to all staff
	adminAPI.Get("/config", GetSystemSettings)
	adminAPI.Get("/election-results", GetElectionResults)

	adminAPI.Post("/maintenance/sync-elections", ManualSyncElections)
	adminAPI.Post("/maintenance/retry-votes", ManualRetryVotes)

	// --- SPECIFIC PERMISSIONS APPLIED PER ROUTE ---

	// Voter List Management (manage_voters)
	adminAPI.Get("/voters", middleware.PermissionMiddleware("manage_voters"), GetAllVoters)
	adminAPI.Get("/voters/export", middleware.PermissionMiddleware("manage_voters"), ExportVotersCSV)

	// Voter Registration & Management (register_voter)
	adminAPI.Post("/voter/register", middleware.PermissionMiddleware("register_voter"), RegisterVoter)
	adminAPI.Put("/voter/:id", middleware.PermissionMiddleware("register_voter"), UpdateVoter)
	adminAPI.Delete("/voter/:id", middleware.PermissionMiddleware("register_voter"), DeleteVoter)
	adminAPI.Post("/voter/block", middleware.PermissionMiddleware("register_voter"), BlockVoter)
	adminAPI.Post("/voter/unblock", middleware.PermissionMiddleware("register_voter"), UnblockVoter)
	adminAPI.Post("/voters/import", middleware.PermissionMiddleware("register_voter"), ImportVotersCSV)

	// Verification (verify_voter)
	adminAPI.Post("/voter/verify", middleware.PermissionMiddleware("verify_voter"), VerifyVoter)
	adminAPI.Post("/voter/reject", middleware.PermissionMiddleware("verify_voter"), RejectVoter)

	// Parties (manage_parties)
	adminAPI.Post("/parties", middleware.PermissionMiddleware("manage_parties"), CreateParty)
	adminAPI.Get("/parties", middleware.PermissionMiddleware("manage_parties"), ListParties)
	adminAPI.Put("/parties/:id", middleware.PermissionMiddleware("manage_parties"), UpdateParty)
	adminAPI.Delete("/parties/:id", middleware.PermissionMiddleware("manage_parties"), DeleteParty)

	// Candidates (manage_candidates)
	adminAPI.Post("/candidates", middleware.PermissionMiddleware("manage_candidates"), CreateCandidate)
	adminAPI.Get("/candidates", middleware.PermissionMiddleware("manage_candidates"), ListCandidates)
	adminAPI.Put("/candidates/:id", middleware.PermissionMiddleware("manage_candidates"), UpdateCandidate)
	adminAPI.Delete("/candidates/:id", middleware.PermissionMiddleware("manage_candidates"), DeleteCandidate)

	// Elections (manage_elections)
	adminAPI.Post("/elections", middleware.PermissionMiddleware("manage_elections"), CreateElection)
	adminAPI.Put("/elections/:id", middleware.PermissionMiddleware("manage_elections"), UpdateElection)
	adminAPI.Delete("/elections/:id", middleware.PermissionMiddleware("manage_elections"), DeleteElection)
	adminAPI.Post("/elections/status", middleware.PermissionMiddleware("manage_elections"), ToggleElectionStatus)
	adminAPI.Post("/elections/publish", middleware.PermissionMiddleware("manage_elections"), ToggleElectionPublish)

	// Staff & Role Management (manage_admins)
	// These use a different prefix (/api/auth/admin), so they were likely fine, but good to be safe.
	staffMgmt := app.Group("/api/auth/admin", middleware.PermissionMiddleware("manage_admins"))
	staffMgmt.Post("/create-sub-admin", CreateSubAdmin)
	staffMgmt.Get("/roles", ListRolesHandler)
	staffMgmt.Post("/roles", CreateRoleHandler)
	staffMgmt.Put("/roles/:id", UpdateRoleHandler)
	staffMgmt.Delete("/roles/:id", DeleteRoleHandler)
	staffMgmt.Post("/toggle-availability", ToggleAvailabilityHandler)
	staffMgmt.Post("/assign-roles", AssignRolesHandler)

	// Admin List & Block (SUPER_ADMIN)
	superAdminLegacy := app.Group("/auth/admin", middleware.PermissionMiddleware("SUPER_ADMIN"))
	superAdminLegacy.Get("/list", ListAdmins)
	superAdminLegacy.Post("/block", BlockSubAdmin)
	superAdminLegacy.Post("/unblock", UnblockSubAdmin)
	superAdminLegacy.Post("/update-role", UpdateAdminRoleHandler)

	// Audit Logs (SUPER_ADMIN)
	app.Get("/api/audit/logs", middleware.PermissionMiddleware("SUPER_ADMIN"), GetAuditLogs)
	app.Post("/api/admin/config", middleware.PermissionMiddleware("SUPER_ADMIN"), UpdateSystemSettings)

	// Blockchain Routes
	bc := app.Group("/api/blockchain")
	bc.Get("/verify/:election_id/:candidate_id", func(c *fiber.Ctx) error {
		elecID, _ := c.ParamsInt("election_id")
		candID, _ := c.ParamsInt("candidate_id")

		count, err := service.GetVotesFromChain(uint(elecID), uint(candID))
		if err != nil {
			return utils.Error(c, 500, "Blockchain read error")
		}

		return utils.Success(c, fiber.Map{
			"source":              "Ethereum Blockchain",
			"election_id":         elecID,
			"candidate_id":        candID,
			"verified_vote_count": count,
		})
	})

	bc.Get("/tx/:hash", func(c *fiber.Ctx) error {
		hash := c.Params("hash")
		return utils.Success(c, fiber.Map{"tx_hash": hash, "status": "Mined"})
	})
}
