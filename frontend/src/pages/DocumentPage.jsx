import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import debounce from "lodash.debounce";
import Editor from "../components/Editor"; // adjust path if needed

const DocumentPage = () => {
  const { docId } = useParams();
  const [remoteContent, setRemoteContent] = useState("");
  const socketRef = useRef(null);
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    // Create the WebSocket connection when docId changes.
    const ws = new WebSocket(`ws://localhost:8080/ws?docID=${docId}`);
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const newContent = event.data;
      // Update remoteContent only if it has changed.
      if (newContent !== remoteContent) {
        console.log("on message called")
        console.log("new conetent: ", newContent)
        console.log("remote conetent: ", remoteContent)
        isRemoteUpdate.current = true;
        setRemoteContent(newContent);
      }
    };

    return () => {
      ws.close();
    };
  }, [docId]); // Only depends on docId so that the connection remains stable.

  // Create a debounced function to send updates after 300ms of no typing.
  const debouncedSend = useCallback(
    debounce((newContent) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(newContent);
      }
    }, 300),
    []
  );

  const handleEditorChange = (newContent) => {
    // If the update came from a remote change, skip sending it back.
    if (isRemoteUpdate.current) {
      console.log("returning without debounce")
      isRemoteUpdate.current = false;
      return;
    }
    // Use the debounced function to send the update.
    console.log("debouncing")
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
