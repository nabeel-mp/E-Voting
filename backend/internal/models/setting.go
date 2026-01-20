package models

type SystemSetting struct {
	Key         string `gorm:"primaryKey" json:"key"`
	Value       string `json:"value"`
	Description string `json:"description"`
	Type        string `json:"type"`
	Category    string `json:"category"`
}
