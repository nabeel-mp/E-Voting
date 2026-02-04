package service

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"fmt"
	"log"
	"time"
)

func SyncElectionsLogic() (int, []string) {
	var elections []models.Election
	if err := database.PostgresDB.Find(&elections).Error; err != nil {
		return 0, []string{fmt.Sprintf("DB Error: %v", err)}
	}

	successCount := 0
	logs := []string{}

	for _, e := range elections {
		startTime := e.StartDate.Unix()
		endTime := e.EndDate.Unix()

		// Attempt to create on chain
		txHash, err := CreateElectionOnChain(e.ID, startTime, endTime)
		if err == nil {
			successCount++
			msg := fmt.Sprintf("Election %d synced! Tx: %s", e.ID, txHash)
			logs = append(logs, msg)
			log.Println("🔧 [Service] " + msg)
		}
	}
	return successCount, logs
}

func RetryVotesLogic() (int, []string) {
	var stuckVotes []models.Vote

	if err := database.PostgresDB.
		Where("blockchain_tx = ? OR blockchain_tx IS NULL", "").
		Find(&stuckVotes).Error; err != nil {
		return 0, []string{fmt.Sprintf("DB Error: %v", err)}
	}

	if len(stuckVotes) == 0 {
		return 0, []string{}
	}

	successCount := 0
	logs := []string{}

	for _, vote := range stuckVotes {
		// 1. Find Voter via Participation
		var participation models.ElectionParticipation
		timeWindow := 2 * time.Second
		startTime := vote.Timestamp.Add(-timeWindow)
		endTime := vote.Timestamp.Add(timeWindow)

		if err := database.PostgresDB.
			Where("election_id = ? AND timestamp BETWEEN ? AND ?", vote.ElectionID, startTime, endTime).
			First(&participation).Error; err != nil {
			logs = append(logs, fmt.Sprintf("Vote %d: No voter found", vote.ID))
			continue
		}

		// 2. Retry Blockchain Write
		txHash, err := CastVoteOnChain(vote.ElectionID, vote.CandidateID, participation.VoterID)
		if err != nil {
			logs = append(logs, fmt.Sprintf("Vote %d: Failed again (%v)", vote.ID, err))
			continue
		}

		// 3. Update DB
		vote.BlockchainTx = txHash
		database.PostgresDB.Save(&vote)

		successCount++
		msg := fmt.Sprintf("Vote %d: REPAIRED! Tx: %s", vote.ID, txHash)
		logs = append(logs, msg)
		log.Println("🔧 [Service] " + msg)
	}

	return successCount, logs
}
