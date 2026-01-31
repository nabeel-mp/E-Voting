package api

import (
	"E-voting/internal/database"
	"E-voting/internal/utils"
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
)

func GetReferenceData(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := database.MongoDB.Collection("reference_data")

	var result struct {
		Data interface{} `bson:"data"`
	}

	// Fetch the document we seeded earlier
	err := collection.FindOne(ctx, bson.M{"type": "kerala_admin_data"}).Decode(&result)
	if err != nil {
		return utils.Error(c, 404, "Reference data not found")
	}

	return utils.Success(c, result.Data)
}
