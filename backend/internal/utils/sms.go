package utils

import (
	"E-voting/internal/config"
	"fmt"

	"github.com/twilio/twilio-go"
	openapi "github.com/twilio/twilio-go/rest/api/v2010"
)

func SendSms(to string, otp string) error {
	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: config.Config.Twilio.AccountSID,
		Password: config.Config.Twilio.AuthToken,
	})

	params := &openapi.CreateMessageParams{}
	params.SetTo(to)
	params.SetFrom(config.Config.Twilio.FromNumber)
	params.SetBody(fmt.Sprintf("Your E-Voting OTP is: %s. Valid for 5 minutes.", otp))

	_, err := client.Api.CreateMessage(params)
	if err != nil {
		return fmt.Errorf("Failed to send SMS: %v", err)
	}
	return nil

}
