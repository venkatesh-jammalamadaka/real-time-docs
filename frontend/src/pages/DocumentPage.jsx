import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import debounce from "lodash.debounce";
import Editor from "../components/Editor"; // adjust path as needed

const DocumentPage = () => {
  const { docId } = useParams();
  const [remoteContent, setRemoteContent] = useState("");
  const socketRef = useRef(null);

  // Establish the WebSocket connection when docId changes.
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080/ws?docID=${docId}`);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const newContent = event.data;
      // Always update remoteContent with the latest content from the server.
      setRemoteContent(newContent);
      console.log("Received from server:", newContent);
    };

    return () => {
      ws.close();
    };
  }, [docId]);

  // Debounced function to send updates after 300ms.
  const debouncedSend = useCallback(
    debounce((newContent) => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        console.log("Sending update:", newContent);
        socketRef.current.send(newContent);
      }
    }, 300),
    []
  );

  // Every update from the editor is sent (no flag check)
  const handleEditorChange = (newContent) => {
    debouncedSend(newContent);
  };

  return (
    <div>
      <h2>Document: {docId}</h2>
      <Editor content={remoteContent} onChange={handleEditorChange} />
    </div>
  );
};

export default DocumentPage;
