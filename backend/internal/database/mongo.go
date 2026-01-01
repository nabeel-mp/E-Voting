package database

import (
	"E-voting/internal/config"
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoDB *mongo.Database

func ConnectMongo() {
	if config.Config.Mongo.URI == "" {
		log.Fatal("MONGO_URI is empty. Check .env file")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(config.Config.Mongo.URI))
	if err != nil {
		log.Fatal(" Failed to connect MongoDB:", err)
	}

	MongoDB = client.Database(config.Config.Mongo.DB)
	log.Println("MongoDB connected")
}
