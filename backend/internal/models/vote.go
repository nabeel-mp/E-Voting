package models

import "time"

type Vote struct {
	BaseModel
	ElectionID  uint `gorm:"not null"`
	CandidateID uint `gorm:"not null"`
	// We do NOT store VoterID here to maintain anonymity.
	// Instead, we use a VoteHash for verification.
	VoteHash  string `gorm:"uniqueIndex;not null"`
	Timestamp time.Time
}
