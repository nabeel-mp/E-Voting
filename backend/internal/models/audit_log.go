package models

import "time"

type AuditLog struct {
	ActorID   uint                   `bson:"actor_id"`
	ActorRole string                 `bson:"actor_role"`
	Action    string                 `bson:"action"`
	TargetID  uint                   `bson:"target_id,omitempty"`
	Metadata  map[string]interface{} `bson:"metadata,omitempty"`
	Timestamp time.Time              `bson:"timestamp"`
}
