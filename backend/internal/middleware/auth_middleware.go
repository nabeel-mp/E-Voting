package middleware

import (
	"E-voting/internal/config"
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/utils"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func PermissionMiddleware(requiredPermission string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		if auth == "" {
			return utils.Error(c, 401, "Missing token")
		}

		tokenStr := strings.Replace(auth, "Bearer ", "", 1)
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return []byte(config.Config.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			return utils.Error(c, 401, "Invalid token")
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return utils.Error(c, 401, "Invalid token claims")
		}

		// Robustly handle number types from JSON (float64 default)
		var userID uint
		if idFloat, ok := claims["user_id"].(float64); ok {
			userID = uint(idFloat)
		} else {
			return utils.Error(c, 401, "Invalid user ID in token")
		}

		role, _ := claims["role"].(string)

		c.Locals("user_id", float64(userID)) // Store as float64 for consistency with handlers
		c.Locals("role", role)

		// 1. Super Admin bypass
		if role == "SUPER_ADMIN" {
			return c.Next()
		}

		// 2. Voter Logic
		if role == "VOTER" {
			if requiredPermission != "VOTER" && requiredPermission != "" {
				return utils.Error(c, 403, "Voters cannot access admin routes")
			}
			return c.Next()
		}

		// 3. Admin Logic
		var admin models.Admin
		if err := database.PostgresDB.Preload("Role").First(&admin, userID).Error; err != nil {
			return utils.Error(c, 401, "Admin account not found")
		}

		if !admin.IsActive {
			return utils.Error(c, 403, "Account has been deactivated")
		}

		// Check specific permission if required
		if requiredPermission != "" {
			// Check if permission exists in comma-separated list OR if role has 'all'
			perms := admin.Role.Permissions
			if perms != "all" && !strings.Contains(","+perms+",", ","+requiredPermission+",") {
				return utils.Error(c, 403, "Permission denied: "+requiredPermission)
			}
		}

		return c.Next()
	}
}
