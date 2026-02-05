// internal/models/admin.go
package models

import "time"

type Role struct {
	BaseModel
	Name        string `gorm:"uniqueIndex;not null"`
	Permissions string `gorm:"not null"`
}
type Admin struct {
	BaseModel
	Name        string `json:"name"`
	Email       string `gorm:"uniqueIndex;not null"`
	Password    string `gorm:"not null" json:"-"`
	Roles       []Role `gorm:"many2many:admin_roles;"`
	IsActive    bool   `gorm:"default:true"`
	IsSuper     bool   `gorm:"default:false"`
	IsAvailable bool   `gorm:"default:true" json:"is_available"`
	Avatar      string `json:"avatar"`
	Preferences string `json:"preferences"`

	OTP       string    `json:"-"`
	OTPExpiry time.Time `json:"-"`
}
