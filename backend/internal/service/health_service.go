package service

import "E-voting/internal/repository"

func HealthCheck() map[string]interface{} {
	return map[string]interface{}{
		"status":   "OK",
		"postgres": repository.CheckPostgres(),
		"mongo":    repository.CheckMongo(),
	}
}
