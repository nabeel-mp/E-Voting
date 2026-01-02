package models

type Voter struct {
	BaseModel

	VoterUniqueID string `gorm:"uniqueIndex;not null"`
	AadhaarHash   string `gorm:"uniqueIndex;not null"`
	Name          string
	Region        string
	IsActive      bool `gorm:"default:true"`
}
