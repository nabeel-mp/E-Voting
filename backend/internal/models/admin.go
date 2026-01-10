// internal/models/admin.go
package models

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
	RoleID      uint   `gorm:"not null"`
	Role        Role   `gorm:"foreignKey:RoleID"`
	IsActive    bool   `gorm:"default:true"`
	IsSuper     bool   `gorm:"default:false"`
	Avatar      string `json:"avatar"`
	Preferences string `json:"preferences"`
}
