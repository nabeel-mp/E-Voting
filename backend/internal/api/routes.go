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

	// --- PUBLIC ROUTES ---
	public := app.Group("/api/public")
	public.Get("/elections", GetPublishedElections)
	public.Get("/results", GetElectionResults)

	// --- API ROUTES ---

	// 1. Auth Routes (Public)
	auth := app.Group("/api/auth")
	auth.Post("/admin/login", AdminLogin)
	auth.Post("/voter/login", VoterLogin)
	auth.Post("/voter/verify-otp", VerifyOTP)
	auth.Post("/voter/register", RegisterVoter)

	voterApp := app.Group("/api/voter", middleware.PermissionMiddleware(""))
	voterApp.Get("/elections", GetVoterElections)
	voterApp.Get("/elections/:id/candidates", GetVoterCandidates)
	voterApp.Post("/vote", CastVote)

	common := app.Group("/api/common")
	common.Get("/kerala-data", GetReferenceData)

	// 2. Admin API Routes

	// General Admin Profile
	adminAPI := app.Group("/api/admin", middleware.PermissionMiddleware(""))
	adminAPI.Get("/dashboard", GetDashboardData)
	adminAPI.Put("/update-profile", UpdateAdminProfile)
	adminAPI.Put("/change-password", ChangePassword)
	adminAPI.Post("/upload-avatar", UploadAvatar)
	adminAPI.Put("/notifications", UpdateNotifications)
	adminAPI.Get("/elections", ListElections)
	adminAPI.Get("/config", GetSystemSettings)
	adminAPI.Get("/election-results", GetElectionResults)

	adminAPI.Post("/maintenance/sync-elections", ManualSyncElections)
	adminAPI.Post("/maintenance/retry-votes", ManualRetryVotes)

	// Voter Management
	voterListMgmt := app.Group("/api/admin", middleware.PermissionMiddleware("manage_voters"))
	voterListMgmt.Get("/voters", GetAllVoters)
	voterListMgmt.Get("/voters/export", ExportVotersCSV)

	voterMgmt := app.Group("/api/admin", middleware.PermissionMiddleware("register_voter"))
	voterMgmt.Post("/voter/register", RegisterVoter)
	voterMgmt.Put("/voter/:id", UpdateVoter)
	voterMgmt.Delete("/voter/:id", DeleteVoter)
	voterMgmt.Post("/voter/block", BlockVoter)
	voterMgmt.Post("/voter/unblock", UnblockVoter)
	voterMgmt.Post("/voters/import", ImportVotersCSV)

	verifyMgmt := app.Group("/api/admin", middleware.PermissionMiddleware("verify_voter"))
	verifyMgmt.Post("/voter/verify", VerifyVoter)
	verifyMgmt.Post("/voter/reject", RejectVoter)

	// Candidates & Parties (Super Admin)
	candidateAPI := app.Group("/api/admin", middleware.PermissionMiddleware("manage_candidates"))
	candidateAPI.Post("/parties", CreateParty)
	candidateAPI.Get("/parties", ListParties)
	candidateAPI.Put("/parties/:id", UpdateParty)
	candidateAPI.Delete("/parties/:id", DeleteParty)
	candidateAPI.Post("/candidates", CreateCandidate)
	candidateAPI.Get("/candidates", ListCandidates)
	candidateAPI.Put("/candidates/:id", UpdateCandidate)
	candidateAPI.Delete("/candidates/:id", DeleteCandidate)

	electionAPI := app.Group("/api/admin", middleware.PermissionMiddleware("manage_elections"))
	electionAPI.Post("/elections", CreateElection)
	electionAPI.Put("/elections/:id", UpdateElection)
	electionAPI.Delete("/elections/:id", DeleteElection)
	electionAPI.Post("/elections/status", ToggleElectionStatus)
	electionAPI.Post("/elections/publish", ToggleElectionPublish)

	// Staff & Role Management (Super Admin & 'manage_admins')
	staffMgmt := app.Group("/api/auth/admin", middleware.PermissionMiddleware("manage_admins"))
	staffMgmt.Post("/create-sub-admin", CreateSubAdmin)
	staffMgmt.Get("/roles", ListRolesHandler)
	staffMgmt.Post("/roles", CreateRoleHandler)
	staffMgmt.Put("/roles/:id", UpdateRoleHandler)
	staffMgmt.Delete("/roles/:id", DeleteRoleHandler)
	staffMgmt.Post("/toggle-availability", ToggleAvailabilityHandler)
	staffMgmt.Post("/assign-roles", AssignRolesHandler)

	// Admin List & Block (Matching admin.html legacy route)
	superAdminLegacy := app.Group("/auth/admin", middleware.PermissionMiddleware("SUPER_ADMIN"))
	superAdminLegacy.Get("/list", ListAdmins)
	superAdminLegacy.Post("/block", BlockSubAdmin)
	superAdminLegacy.Post("/unblock", UnblockSubAdmin)
	superAdminLegacy.Post("/update-role", UpdateAdminRoleHandler)

	// Audit Logs
	app.Get("/api/audit/logs", middleware.PermissionMiddleware("SUPER_ADMIN"), GetAuditLogs)
	app.Post("/api/admin/config", middleware.PermissionMiddleware("SUPER_ADMIN"), UpdateSystemSettings)

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
		// Logic to query eth client for transaction receipt
		return utils.Success(c, fiber.Map{"tx_hash": hash, "status": "Mined"})
	})

}
