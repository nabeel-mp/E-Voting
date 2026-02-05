package utils

import (
	"context"
	"log"
	"path/filepath"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

var FirebaseAuth *auth.Client

func InitFirebase() {
	serviceAccountKeyPath := filepath.Join(".", "serviceAccountKey.json")

	opt := option.WithCredentialsFile(serviceAccountKeyPath)
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		log.Fatalf("error initializing firebase app: %v", err)
	}

	client, err := app.Auth(context.Background())
	if err != nil {
		log.Fatalf("error getting Auth client: %v", err)
	}

	FirebaseAuth = client
	log.Println("Firebase Admin SDK initialized")
}

func VerifyFirebaseToken(idToken string) (*auth.Token, error) {
	token, err := FirebaseAuth.VerifyIDToken(context.Background(), idToken)
	if err != nil {
		return nil, err
	}
	return token, nil
}
