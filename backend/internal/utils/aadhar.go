package utils

import (
	"crypto/sha256"
	"encoding/hex"
)

func HashAadhaar(aadhaar string) string {
	hash := sha256.Sum256([]byte(aadhaar))
	return hex.EncodeToString(hash[:])
}
