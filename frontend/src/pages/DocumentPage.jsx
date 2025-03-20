import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const DocumentPage = () => {
  const { docId } = useParams();
  const [content, setContent] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Fetch existing document content
    fetch(`http://localhost:8080/document?docID=${docId}`)
      .then((res) => res.text())
      .then(setContent);

    // Connect to WebSocket
    const ws = new WebSocket(`ws://localhost:8080/ws?docID=${docId}`);
    setSocket(ws);

    ws.onmessage = (event) => {
      setContent(event.data);
    };

    return () => ws.close(); // Cleanup
  }, [docId]);

  const handleChange = (e) => {
    setContent(e.target.value);
    if (socket) {
      socket.send(e.target.value); // Send to backend
    }
  };

  return (
    <div>
      <h2>Document: {docId}</h2>
      <textarea value={content} onChange={handleChange} rows="10" cols="50" />
    </div>
  );
};

export default DocumentPage;
