package models

import "time"

type Election struct {
	BaseModel
	Title       string    `gorm:"not null" json:"title"`
	Description string    `json:"description"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`

	ElectionType string `json:"election_type"`

	District      string `json:"district"` // Always required
	Block         string `json:"block"`    // Required if Type is Block or Grama Panchayat
	LocalBodyName string `json:"local_body_name"`

	IsActive    bool   `gorm:"default:false" json:"is_active"`
	IsPublished bool   `gorm:"default:false" json:"is_published"`
	Status      string `gorm:"default:'UPCOMING'" json:"status"`
}
