package middleware

import (
	"E-voting/internal/config"
	"E-voting/internal/utils"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware(roles ...string) fiber.Handler {
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
		role := claims["role"].(string)

		for _, r := range roles {
			if r == role {
				c.Locals("user_id", claims["user_id"])
				c.Locals("role", role)
				return c.Next()
			}
		}

		return utils.Error(c, 403, "Access denied")
	}
}
