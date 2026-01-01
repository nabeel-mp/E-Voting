package models

type Admin struct {
	BaseModel

	Email    string `gorm:"uniqueIndex;not null"`
	Password string `gorm:"not null"`
	Role     string `gorm:"not null"` // SUPER_ADMIN | SUB_ADMIN
	IsActive bool   `gorm:"default:true"`
}
