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

		claims := token.Claims.(jwt.MapClaims)

		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			return utils.Error(c, 401, "Invalid token payload")
		}

		userID := uint(userIDFloat)

		c.Locals("user_id", userID)
		c.Locals("role", claims["role"])

		role := claims["role"].(string)

		if role == "SUPER_ADMIN" {
			return c.Next()
		}

		if requiredPermission == "" {
			return c.Next()
		}

		if role == "VOTER" {
			if requiredPermission != "VOTER" {
				return utils.Error(c, 403, "Voters cannot access admin routes")
			}
			return c.Next()
		}

		if role == "SUPER_ADMIN" {
			return c.Next()
		}

		var admin models.Admin
		if err := database.PostgresDB.Preload("Role").First(&admin, userID).Error; err != nil || !admin.IsActive {
			return utils.Error(c, 401, "Account inactive or not found")
		}
		if !strings.Contains(admin.Role.Permissions, requiredPermission) && admin.Role.Permissions != "all" {
			return utils.Error(c, 403, "Permission denied: "+requiredPermission)
		}

		return c.Next()
	}
}
