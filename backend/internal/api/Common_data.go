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

	var document bson.M
	err := collection.FindOne(ctx, bson.M{"type": "kerala_admin_data"}).Decode(&document)
	if err != nil {
		return utils.Error(c, 404, "Reference data not found")
	}

	payload, ok := document["data"].(bson.M)
	if !ok {
		return utils.Error(c, 500, "Invalid data structure in database")
	}

	return utils.Success(c, payload)
}

// 9KKYEPWQU2BWJWR7J1XSQUWS
