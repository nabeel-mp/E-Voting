package surepass

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"os"
)

type Client struct {
	APIKey string
}

func NewClient() *Client {
	return &Client{
		APIKey: os.Getenv("SUREPASS_API_KEY"),
	}
}

func (c *Client) SendOTP(aadhaar string) (string, error) {
	payload := map[string]interface{}{
		"id_number": aadhaar,
		"consent":   true,
	}

	body, _ := json.Marshal(payload)

	req, err := http.NewRequest(
		"POST",
		"https://api.surepass.io/v1/aadhaar/otp",
		bytes.NewBuffer(body),
	)

	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}

	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	if result["success"] != true {
		return "", errors.New("otp initiation failed")
	}

	return result["reference_id"].(string), nil

}

func (c *Client) VerifyOTP(reference, otp string) error {
	payload := map[string]interface{}{
		"reference_id": reference,
		"otp":          otp,
	}

	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest(
		"POST",
		"https://api.surepass.io/v1/aadhaar/otp/verify",
		bytes.NewBuffer(body),
	)

	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var res map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&res)

	if res["success"] != true {
		return errors.New("invalid otp")
	}

	return nil
}
