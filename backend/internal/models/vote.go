package models

import "time"

type Vote struct {
	BaseModel
	ElectionID  uint   `gorm:"not null"`
	CandidateID uint   `gorm:"not null"`
	VoteHash    string `gorm:"uniqueIndex;not null"`
	Timestamp   time.Time
}

type ElectionParticipation struct {
	ID         uint `gorm:"primaryKey"`
	VoterID    uint `gorm:"uniqueIndex:idx_voter_election"`
	ElectionID uint `gorm:"uniqueIndex:idx_voter_election"`
	Timestamp  time.Time
}
