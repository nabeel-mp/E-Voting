package models

import "time"

type Election struct {
	BaseModel
	Title       string    `gorm:"not null" json:"title"`
	Description string    `json:"description"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`

	District      string `json:"district"`
	LocalBodyType string `json:"local_body_type"`
	LocalBodyName string `json:"local_body_name"`
	Block         string `json:"block"`
	Ward          string `json:"ward"`

	IsActive    bool   `gorm:"default:false" json:"is_active"`
	IsPublished bool   `gorm:"default:false" json:"is_published"`
	Status      string `gorm:"default:'UPCOMING'" json:"status"`
}
