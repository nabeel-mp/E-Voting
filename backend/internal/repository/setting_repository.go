package repository

import (
	"E-voting/internal/database"
	"E-voting/internal/models"
)

func GetSettingValue(key string) string {
	var setting models.SystemSetting
	err := database.PostgresDB.Where("key = ?", key).First(&setting).Error
	if err != nil {
		return ""
	}
	return setting.Value
}
