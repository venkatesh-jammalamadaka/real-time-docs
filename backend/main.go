package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// WebSocket upgrader
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// In-memory document storage (for now)
var documents = make(map[string]string)          // Key: docID, Value: content
var clients = make(map[string][]*websocket.Conn) // Track connected users per document

// Handle WebSocket connections
func handleConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade failed:", err)
		return
	}
	defer conn.Close()

	// Read docID from query params
	docID := r.URL.Query().Get("docID")
	if docID == "" {
		log.Println("Missing docID")
		return
	}

	// Store the connection
	clients[docID] = append(clients[docID], conn)

	// Send existing document content to the new connection
	conn.WriteMessage(websocket.TextMessage, []byte(documents[docID]))

	// Handle incoming messages
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}

		// Update document content
		documents[docID] = string(msg)

		// Broadcast update to all clients
		for _, client := range clients[docID] {
			if client != conn { // Don't send to the sender
				client.WriteMessage(websocket.TextMessage, msg)
			}
		}
	}
}

// Handle document retrieval via HTTP
func getDocumentHandler(w http.ResponseWriter, r *http.Request) {
	docID := r.URL.Query().Get("docID")
	if docID == "" {
		http.Error(w, "Missing docID", http.StatusBadRequest)
		return
	}

	// Return document content
	w.Write([]byte(documents[docID]))
}

func main() {
	http.HandleFunc("/ws", handleConnections)
	http.HandleFunc("/document", getDocumentHandler)

	fmt.Println("Server running on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
