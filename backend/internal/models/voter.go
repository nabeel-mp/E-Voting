package models

import (
	"time"

	"gorm.io/gorm"
)

type Voter struct {
	BaseModel
	FullName string `gorm:"not null" json:"FullName"`
	VoterID  string `gorm:"uniqueIndex;not null" json:"VoterID"`
	Mobile   string `gorm:"not null" json:"Mobile"`

	AadhaarNumber string `gorm:"uniqueIndex;not null" json:"AadhaarNumber"`

	Address    string `json:"Address"`
	District   string `json:"District"`
	Block      string `json:"Block"`
	Panchayath string `json:"Panchayath"`
	Ward       string `json:"Ward"`

	CurrentOTP   string         `json:"-"`
	OTPExpiresAt time.Time      `json:"-"`
	IsVerified   bool           `gorm:"default:false" json:"IsVerified"`
	HasVoted     bool           `gorm:"default:false" json:"HasVoted"`
	IsBlocked    bool           `gorm:"default:false" json:"IsBlocked"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}
