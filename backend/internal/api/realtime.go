package api

import (
	"log"
	"sync"

	"github.com/gofiber/contrib/websocket"
)

// Store active connections
var (
	adminClients = make(map[*websocket.Conn]bool)
	clientsMux   sync.Mutex
)

// WebSocket Handler for Admin Dashboard
func WebSocketHandler(c *websocket.Conn) {
	// Register the client
	clientsMux.Lock()
	adminClients[c] = true
	clientsMux.Unlock()

	log.Println("Admin connected to WebSocket")

	defer func() {
		// Unregister on close
		clientsMux.Lock()
		delete(adminClients, c)
		clientsMux.Unlock()
		c.Close()
		log.Println("Admin disconnected from WebSocket")
	}()

	for {
		// Keep the connection alive.
		// If ReadMessage fails (connection closed), break the loop.
		_, _, err := c.ReadMessage()
		if err != nil {
			break
		}
	}
}

// Broadcast function to notify all connected admins
func BroadcastVoteUpdate(electionTitle string) {
	clientsMux.Lock()
	defer clientsMux.Unlock()

	message := map[string]string{
		"type":     "VOTE_CAST",
		"message":  "New vote received",
		"election": electionTitle,
	}

	for client := range adminClients {
		if err := client.WriteJSON(message); err != nil {
			log.Printf("WebSocket write error: %v", err)
			client.Close()
			delete(adminClients, client)
		}
	}
}
