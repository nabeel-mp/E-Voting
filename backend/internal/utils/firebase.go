package utils

import (
	"context"
	"log"
	"os"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

var FirebaseAuth *auth.Client

func InitFirebase() {
	var opt option.ClientOption
	creds := os.Getenv("FIREBASE_CREDENTIALS")
	if creds != "" {
		opt = option.WithCredentialsJSON([]byte(creds))
		log.Println("Firebase initialized using Environment Variable")
	} else {
		opt = option.WithCredentialsFile("serviceAccountKey.json")
		log.Println("Firebase initialized using local file")
	}

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
