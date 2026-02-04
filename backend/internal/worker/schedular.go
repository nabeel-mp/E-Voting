package worker

import (
	"E-voting/internal/service"
	"log"
	"time"
)

func StartScheduler() {
	ticker := time.NewTicker(1 * time.Minute)
	go func() {
		for range ticker.C {
			log.Println(" [Worker] Running maintenance tasks...")

			// Call the shared service
			service.SyncElectionsLogic()
			service.RetryVotesLogic()

			log.Println(" [Worker] Tasks finished.")
		}
	}()
}
