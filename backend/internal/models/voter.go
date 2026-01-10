package models

import "time"

type Voter struct {
	BaseModel
	FullName    string `gorm:"not null"`
	VoterID     string `gorm:"uniqueIndex;not null"`
	AadhaarHash string `gorm:"uniqueIndex;not null"`
	Mobile      string `gorm:"not null"`

	CurrentOTP   string
	OTPExpiresAt time.Time
	IsVerified   bool `gorm:"default:false"`
	HasVoted     bool `gorm:"default:false"`
}
