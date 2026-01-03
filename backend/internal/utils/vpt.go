package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateVotingToken(voterID uint) (string, error) {
	claims := jwt.MapClaims{
		"voter_id": voterID,
		"type":     "VOTE_PERMISSION",
		"exp":      time.Now().Add(5 * time.Minute).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte("VOTE_SECRET"))
}
