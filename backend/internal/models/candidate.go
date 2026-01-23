package models

type Party struct {
	BaseModel
	Name string `gorm:"uniqueIndex;not null" json:"name"`
	Logo string `json:"logo"`
}

type Candidate struct {
	BaseModel
	FullName   string `gorm:"not null" json:"full_name"`
	ElectionID uint   `gorm:"not null"`
	PartyID    uint   `gorm:"not null" json:"party_id"`
	Party      Party  `gorm:"foreignKey:PartyID" json:"party"`
	Bio        string `json:"bio"`
	Photo      string `json:"photo"`

	WardNumber string `json:"ward_number"`
}
