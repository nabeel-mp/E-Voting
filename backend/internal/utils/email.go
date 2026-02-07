package utils

import (
	"fmt"
	"log"
)

func SendEmailOTP(toEmail, otp string) error {

	log.Println("========================================")
	log.Printf("📧 [MOCK EMAIL] To: %s", toEmail)
	log.Printf("⚠️ EMAIL BYPASS: OTP for %s is: %s", toEmail, otp)
	log.Println("========================================")

	// from := config.Config.SMTP.Email
	// password := config.Config.SMTP.Password
	// host := config.Config.SMTP.Host
	// port := config.Config.SMTP.Port
	// address := host + ":" + port

	// subject := "Subject: Admin Login OTP\n"
	// mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	// body := fmt.Sprintf(`
	// 	<html>
	// 		<body>
	// 			<h3>Admin Login Verification</h3>
	// 			<p>Your One-Time Password (OTP) for login is:</p>
	// 			<h2 style="color: #4f46e5;">%s</h2>
	// 			<p>This OTP is valid for 5 minutes. Do not share this with anyone.</p>
	// 		</body>
	// 	</html>
	// `, otp)

	// msg := []byte(subject + mime + body)

	// auth := smtp.PlainAuth("", from, password, host)

	// err := smtp.SendMail(address, auth, from, []string{toEmail}, msg)
	// if err != nil {
	// 	return err
	// }
	fmt.Printf("Skipping actual email send to %s (Render Firewall Bypass)\n", toEmail)
	return nil
}
