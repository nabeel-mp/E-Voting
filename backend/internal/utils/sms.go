package utils

import (
	"E-voting/internal/config"
	"fmt"
	"strings"

	"github.com/twilio/twilio-go"
	openapi "github.com/twilio/twilio-go/rest/api/v2010"
)

func SendSms(to string, otp string) error {

	if config.Config.Twilio.AccountSID == "" || config.Config.Twilio.AuthToken == "" {
		fmt.Println(" Twilio credentials missing. Skipping SMS.")
		return fmt.Errorf("Twilio credentials missing")
	}

	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: config.Config.Twilio.AccountSID,
		Password: config.Config.Twilio.AuthToken,
	})

	cleanNum := strings.TrimSpace(to)
	if !strings.HasPrefix(cleanNum, "+") {
		cleanNum = "+91" + cleanNum
	}

	params := &openapi.CreateMessageParams{}
	params.SetTo(to)
	params.SetFrom(config.Config.Twilio.FromNumber)
	params.SetBody(fmt.Sprintf("SEC-KERALA: Your OTP is %s. Valid for 5 mins.", otp))

	_, err := client.Api.CreateMessage(params)
	if err != nil {
		return fmt.Errorf("Failed to send SMS: %v", err)
	}
	return nil

}
