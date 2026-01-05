package middleware

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/utils"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// func AuthMiddleware(roles ...string) fiber.Handler {
// 	return func(c *fiber.Ctx) error {
// 		auth := c.Get("Authorization")
// 		if auth == "" {
// 			return utils.Error(c, 401, "Missing token")
// 		}

// 		tokenStr := strings.Replace(auth, "Bearer ", "", 1)

// 		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
// 			return []byte(config.Config.JWTSecret), nil
// 		})

// 		if err != nil || !token.Valid {
// 			return utils.Error(c, 401, "Invalid token")
// 		}

// 		claims := token.Claims.(jwt.MapClaims)
// 		role := claims["role"].(string)

// 		for _, r := range roles {
// 			if r == role {
// 				c.Locals("user_id", claims["user_id"])
// 				c.Locals("role", role)
// 				return c.Next()
// 			}
// 		}

// 		return utils.Error(c, 403, "Access denied")
// 	}
// }

func PermissionMiddleware(requiredPermission string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		if auth == "" {
			return utils.Error(c, 401, "Missing token")
		}

		tokenStr := strings.Replace(auth, "Bearer ", "", 1)
		token, _ := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return []byte("YOUR_SECRET"), nil // Use config.Config.JWTSecret
		})

		claims := token.Claims.(jwt.MapClaims)
		isSuper := claims["is_super"].(bool)

		// Super Admin bypasses all permission checks
		if isSuper {
			return c.Next()
		}

		// Fetch admin role from DB to check permissions
		var admin models.Admin
		database.PostgresDB.Preload("Role").First(&admin, claims["user_id"])

		if !strings.Contains(admin.Role.Permissions, requiredPermission) {
			return utils.Error(c, 403, "Permission denied: "+requiredPermission)
		}

		return c.Next()
	}
}
