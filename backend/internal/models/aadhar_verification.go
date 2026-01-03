package models

import "time"

type AadhaarVerification struct {
	BaseModel

	VoterID    uint
	Provider   string // SUREPASS
	Reference  string // Surepass reference_id
	Status     string // PENDING / VERIFIED / FAILED
	VerifiedAt *time.Time
	ExpiresAt  time.Time
}
