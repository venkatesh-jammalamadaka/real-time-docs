import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Editor from "../components/Editor"; // adjust path if needed

const DocumentPage = () => {
  // Extract docId from the URL using React Router
  const { docId } = useParams();

  // State to hold the content that comes from the server
  const [remoteContent, setRemoteContent] = useState("");

  // useRef for holding the WebSocket object so it persists between renders
  const socketRef = useRef(null);

  // A ref to flag if an update is coming from the server (remote)
  const isRemoteUpdate = useRef(false);

  // useEffect that runs when the document ID changes (i.e. when a new doc is loaded)
  useEffect(() => {
    // Establish the WebSocket connection to your backend on port 8080
    const ws = new WebSocket(`ws://localhost:8080/ws?docID=${docId}`);
    socketRef.current = ws; // save the socket reference

    // When a message is received from the server...
    ws.onmessage = (event) => {
      const newContent = event.data; // the server sends HTML content
      // Only update state if the new content is different from the current remoteContent.
      if (newContent !== remoteContent) {
        // Mark that this update came from the remote (server)
        isRemoteUpdate.current = true;
        // Update the remoteContent state
        setRemoteContent(newContent);
      }
    };

    // Clean up: when this component unmounts or docId changes, close the socket.
    return () => {
      ws.close();
    };
  }, [docId]); // Dependency is only docId so that remoteContent updates don't reinitialize the socket

  // Function to handle changes from the editor component
  const handleEditorChange = (newContent) => {
    // If the update came from the server, we ignore it here so that we don't echo it back.
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    // For local (user-typed) updates:
    // Optionally update local state (if needed) and send the new content to the server.
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(newContent);
    }
  };

  return (
    <div>
      <h2>Document: {docId}</h2>
      {/* 
          The Editor component receives:
            - content: The HTML content received from the server (remoteContent)
            - onChange: A function to handle changes (user typing)
          Notice: We are not using a key prop here so that the editor instance is preserved
      */}
      <Editor content={remoteContent} onChange={handleEditorChange} />
    </div>
  );
};

export default DocumentPage;
