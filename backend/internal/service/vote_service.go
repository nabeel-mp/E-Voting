package service

import (
	"E-voting/internal/models"
	"E-voting/internal/repository"
	"crypto/sha256"
	"fmt"
)

func CastVote(voterID uint, electionID, candidateID uint) (string, error) {
	// 1. Generate a unique hash for this specific vote (Verification Code)
	// Salt with voterID + electionID to ensure uniqueness but don't store the salt
	data := fmt.Sprintf("%d-%d-%d", voterID, electionID, candidateID)
	verificationHash := fmt.Sprintf("%x", sha256.Sum256([]byte(data)))

	vote := &models.Vote{
		ElectionID:  electionID,
		CandidateID: candidateID,
		VoteHash:    verificationHash,
	}

	// 2. Save to Postgres
	if err := repository.SaveVote(vote); err != nil {
		return "", err
	}

	// 3. Log to Audit Trail (MongoDB)
	LogAdminAction(0, "SYSTEM", "VOTE_CAST", vote.ID, map[string]interface{}{
		"election_id": electionID,
		"hash":        verificationHash,
	})

	return verificationHash, nil
}
