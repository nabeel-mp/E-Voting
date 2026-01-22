package api

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
	"E-voting/internal/utils"
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func GetDashboardData(c *fiber.Ctx) error {
	var totalVoters int64
	var totalVotes int64
	var totalCandidates int64
	var activeElections int64

	recentLogs := []models.AuditLog{}

	database.PostgresDB.Model(&models.Voter{}).Count(&totalVoters)
	database.PostgresDB.Model(&models.Vote{}).Count(&totalVotes)

	database.PostgresDB.Model(&models.Candidate{}).Count(&totalCandidates)
	database.PostgresDB.Model(&models.Election{}).Where("is_active = ?", true).Count(&activeElections)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := database.MongoDB.Collection("audit_logs")

	findOptions := options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}}).SetLimit(5)

	cursor, err := collection.Find(ctx, bson.D{}, findOptions)
	if err == nil {
		if err := cursor.All(ctx, &recentLogs); err != nil {
		}
	}

	data := fiber.Map{
		"TotalVoters":     totalVoters,
		"VotesCast":       totalVotes,
		"Candidates":      totalCandidates,
		"ActiveElections": activeElections,
		"RecentActivity":  recentLogs,
	}

	return utils.Success(c, data)
}
