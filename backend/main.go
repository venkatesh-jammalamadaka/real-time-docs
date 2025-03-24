package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// -------------------- WebSocket Client Struct --------------------

type Client struct {
	conn  *websocket.Conn
	docID string
	send  chan []byte
}

// -------------------- Shared State --------------------

var (
	documents      = make(map[string]string)    // docID → content
	clients        = make(map[string][]*Client) // docID → list of clients
	documentsMutex sync.Map                     // docID → *sync.Mutex (for documents)
	clientsMutex   sync.Map                     // docID → *sync.Mutex (for clients)
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// -------------------- Per-Document Lock Getters --------------------

func getDocMutex(docID string) *sync.Mutex {
	actual, _ := documentsMutex.LoadOrStore(docID, &sync.Mutex{})
	return actual.(*sync.Mutex)
}

func getClientsMutex(docID string) *sync.Mutex {
	actual, _ := clientsMutex.LoadOrStore(docID, &sync.Mutex{})
	return actual.(*sync.Mutex)
}

// -------------------- WebSocket Handler --------------------

func handleConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade HTTP to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade failed:", err)
		return
	}

	docID := r.URL.Query().Get("docID")
	if docID == "" {
		log.Println("Missing docID")
		conn.Close()
		return
	}

	// Create new WebSocket client
	client := &Client{
		conn:  conn,
		docID: docID,
		send:  make(chan []byte, 256),
	}

	addClient(client)

	// Send existing document content to the new user
	docMutex := getDocMutex(docID)
	docMutex.Lock()
	client.send <- []byte(documents[docID])
	docMutex.Unlock()

	// Start listening for messages
	go handleRead(client)
	go handleWrite(client)
}

// -------------------- Read from WebSocket --------------------

func handleRead(client *Client) {
	defer func() {
		removeClient(client)
		client.conn.Close()
	}()

	for {
		_, msg, err := client.conn.ReadMessage()
		if err != nil {
			break
		}

		// Update document content
		docMutex := getDocMutex(client.docID)
		docMutex.Lock()
		documents[client.docID] = string(msg)
		docMutex.Unlock()

		// Broadcast the update
		broadcast(client.docID, msg)
	}
}

// -------------------- Write to WebSocket --------------------

func handleWrite(client *Client) {
	defer client.conn.Close()

	for msg := range client.send {
		err := client.conn.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			break
		}
	}
}

// -------------------- Add/Remove Clients --------------------

func addClient(client *Client) {
	clMutex := getClientsMutex(client.docID)
	clMutex.Lock()
	clients[client.docID] = append(clients[client.docID], client)
	clMutex.Unlock()
}

func removeClient(client *Client) {
	clMutex := getClientsMutex(client.docID)
	clMutex.Lock()
	defer clMutex.Unlock()

	list := clients[client.docID]
	for i, c := range list {
		if c == client {
			clients[client.docID] = append(list[:i], list[i+1:]...)
			break
		}
	}
}

// -------------------- Broadcast Updates --------------------

func broadcast(docID string, msg []byte) {
	clMutex := getClientsMutex(docID)
	clMutex.Lock()
	defer clMutex.Unlock()

	for _, client := range clients[docID] {
		select {
		case client.send <- msg:
		default:
			// If the send buffer is full or broken, remove the client
			removeClient(client)
		}
	}
}

// -------------------- Main --------------------

func main() {
	http.HandleFunc("/ws", handleConnections)
	fmt.Println("WebSocket server running on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
