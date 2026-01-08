package utils

import (
	"math/rand"
)

func RandomNumber() int {
	return rand.Intn(900000) + 100000
}
