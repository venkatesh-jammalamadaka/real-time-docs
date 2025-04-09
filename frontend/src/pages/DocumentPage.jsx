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
      // Use functional update so the current remoteContent is obtained.
      setRemoteContent((prevContent) => {
        if (newContent !== prevContent) {
          console.log("on message called");
          console.log("new content:", newContent);
          console.log("previous content:", prevContent);
          isRemoteUpdate.current = true;
          return newContent;
        }
        return prevContent;
      });
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

  // This function resets the remote update flag.
  const resetRemoteFlag = () => {
    isRemoteUpdate.current = false;
  };

  return (
    <div>
      <h2>Document: {docId}</h2>
      <Editor content={remoteContent} onChange={handleEditorChange} resetRemoteFlag={resetRemoteFlag}/>
    </div>
  );
};

export default DocumentPage;
