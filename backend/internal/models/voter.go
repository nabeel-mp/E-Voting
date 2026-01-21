package models

import (
	"time"

	"gorm.io/gorm"
)

type Voter struct {
	BaseModel
	FullName    string `gorm:"not null" json:"FullName"`
	VoterID     string `gorm:"uniqueIndex;not null" json:"VoterID"`
	AadhaarHash string `gorm:"uniqueIndex;not null" json:"-"`
	Mobile      string `gorm:"not null" json:"Mobile"`

	AadhaarPlain string `json:"AadhaarPlain,omitempty"`

	CurrentOTP   string         `json:"-"`
	OTPExpiresAt time.Time      `json:"-"`
	IsVerified   bool           `gorm:"default:false" json:"IsVerified"`
	HasVoted     bool           `gorm:"default:false" json:"HasVoted"`
	IsBlocked    bool           `gorm:"default:false" json:"IsBlocked"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}
