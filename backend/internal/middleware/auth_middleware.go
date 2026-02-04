package middleware

import (
	"E-voting/internal/config"
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/utils"
	"fmt"
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

		var userID uint
		if idFloat, ok := claims["user_id"].(float64); ok {
			userID = uint(idFloat)
		} else {
			return utils.Error(c, 401, "Invalid user ID in token")
		}

		role, _ := claims["role"].(string)

		c.Locals("user_id", float64(userID))
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

			if requiredPermission != "VOTER" && requiredPermission != "" {
				return utils.Error(c, 403, "Voters cannot access restricted routes")
			}

			return c.Next()
		}

		// 3. Admin Logic
		var admin models.Admin
		if err := database.PostgresDB.Preload("Roles").First(&admin, userID).Error; err != nil {
			return utils.Error(c, 401, "Admin account not found")
		}

		fmt.Println("--- DEBUG MIDDLEWARE ---")
		fmt.Printf("User ID: %d | Requesting: %s\n", admin.ID, requiredPermission)
		fmt.Printf("Admin Roles Count: %d\n", len(admin.Roles))

		// if strings.HasPrefix(c.Path(), "/api/admin") && role == "VOTER" {
		// 	return utils.Error(c, 403, "Access Denied")
		// }

		if !admin.IsActive {
			return utils.Error(c, 403, "Account has been deactivated")
		}

		if admin.IsSuper {
			return c.Next()
		}

		if requiredPermission == "SUPER_ADMIN" {
			return utils.Error(c, 403, "Super Admin privilege required")
		}

		if requiredPermission != "" {
			hasPermission := false

			for _, r := range admin.Roles {

				fmt.Printf("DEBUG: Role: %s | DB Perms: %s | Required: %s\n", r.Name, r.Permissions, requiredPermission)
				permissions := strings.Split(r.Permissions, ",")

				for _, p := range permissions {
					p = strings.TrimSpace(p)

					if p == "all" || p == requiredPermission {
						hasPermission = true
						break
					}
				}

				if hasPermission {
					break
				}
			}

			if !hasPermission {
				return utils.Error(c, 403, "Permission denied: "+requiredPermission)
			}
		}

		return c.Next()
	}
}
