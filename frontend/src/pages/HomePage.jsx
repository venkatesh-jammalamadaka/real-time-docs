import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";

const HomePage = () => {
  const navigate = useNavigate();
  const [docId, setDocId] = useState("");

  const createNewDocument = () => {
    const newId = uuidV4(); // Generate a unique document ID
    navigate(`/doc/${newId}`); // Redirect to the new document
  };

  const openExistingDocument = () => {
    if (docId.trim()) {
      navigate(`/doc/${docId}`);
    }
  };

  return (
    <div className="home-container">
      <h1>Real-Time Docs</h1>
      <button onClick={createNewDocument}>Create New Document</button>
      <div>
        <input
          type="text"
          placeholder="Enter Document ID"
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
        />
        <button onClick={openExistingDocument}>Open Document</button>
      </div>
    </div>
  );
};

export default HomePage;
