package models

import "time"

type Election struct {
	BaseModel
	Title       string    `gorm:"not null" json:"title"`
	Description string    `json:"description"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
	IsActive    bool      `gorm:"default:false" json:"is_active"`
	IsPublished bool      `gorm:"default:false" json:"is_published"`
}
