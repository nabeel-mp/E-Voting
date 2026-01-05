package models

import "time"

type Voter struct {
	BaseModel
	FullName    string `gorm:"not null"`
	VoterID     string `gorm:"uniqueIndex;not null"` // Government Voter ID
	AadhaarHash string `gorm:"uniqueIndex;not null"`
	Mobile      string `gorm:"not null"`

	// OTP Fields
	CurrentOTP   string
	OTPExpiresAt time.Time
	IsVerified   bool `gorm:"default:false"`
}
