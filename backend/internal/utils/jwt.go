package utils

import (
	"E-voting/internal/config"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateJWT(userID uint, role string, permissions string, isSuper bool, name string, email string, avatar string) (string, error) {
	claims := jwt.MapClaims{
		"user_id":     userID,
		"role":        role,
		"name":        name,
		"email":       email,
		"avatar":      avatar,
		"permissions": permissions,
		"is_super":    isSuper,
		"exp":         time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.Config.JWTSecret))
}
