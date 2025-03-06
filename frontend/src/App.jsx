import React, { useState, useRef } from "react";

function App() {
  // States for UI visibility and data
  const [isPaired, setIsPaired] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showChatPartnerPopup, setShowChatPartnerPopup] = useState(false);
  const [messages, setMessages] = useState([]);
  const [timer, setTimer] = useState("3:00");

  // States for language selection and presurvey (updated with descriptive names)
  const [language, setLanguage] = useState("");
  const [qualityRating, setQualityRating] = useState("");
  const [seamlessRating, setSeamlessRating] = useState("");
  const [translationeseRating, setTranslationeseRating] = useState("");

  // Chat input
  const [chatMessage, setChatMessage] = useState("");

  // (Other survey states remain unchanged)
  const [engagementRating, setEngagementRating] = useState("");
  const [friendlinessRating, setFriendlinessRating] = useState("");
  const [overallRating, setOverallRating] = useState("");
  const [sameLanguageRating, setSameLanguageRating] = useState("");
  const [guessLanguage, setGuessLanguage] = useState("");
  const [nativeSpeakerReason, setNativeSpeakerReason] = useState("");

  // Refs for WebSocket and typing timeout
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Function to initiate a chat (creates a WebSocket connection)
  const findPair = () => {
    // Check that all fields are filled
    if (!language || !qualityRating || !seamlessRating || !translationeseRating) {
      alert("Please fill in all fields before finding a chat partner");
      return;
    }
    
    console.log("Attempting to find chat partner...");
    setShowChatPartnerPopup(true);

    if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
      console.log("Creating new WebSocket connection...");
      const ws = new WebSocket('ws://34.219.101.222:8000/ws');
      
      ws.onopen = () => {
        console.log("WebSocket connection opened successfully");
        // Send the updated survey data with descriptive field names
        const data = {
          type: "language",
          language: language,
          qualityRating: qualityRating,
          seamlessRating: seamlessRating,
          translationeseRating: translationeseRating,
        };
        console.log("Sending initial data:", data);
        ws.send(JSON.stringify(data));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "paired") {
          setIsPaired(true);
          setShowChat(true);
          setShowChatPartnerPopup(false);
          setConversationId(data.conversation_id);
          console.log(data.message);
        } else if (data.type === "timer") {
          const minutes = Math.floor(data.remaining_time / 60);
          const seconds = data.remaining_time % 60;
          setTimer(`${minutes}:${seconds.toString().padStart(2, "0")}`);
        } else if (data.type === "message") {
          setMessages((prev) => [...prev, { text: data.text, sender: "partner" }]);
        } else if (data.type === "typing") {
          // (Optional) Implement a typing indicator state here
        } else if (data.type === "survey" || data.type === "expired") {
          setShowChat(false);
          setShowSurvey(true);
          setConversationId(data.conversation_id);
          console.log(data.message);
        } else if (data.type === "waitingRoomTimeout") {
          alert("Could not find a chat partner. Try again later!");
          setShowChatPartnerPopup(false);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
        alert("Failed to connect to chat server. Please try again.");
        setShowChatPartnerPopup(false);
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed with code:", event.code);
        console.log("Close reason:", event.reason);
        if (!isPaired) {
          setShowChatPartnerPopup(false);
        }
      };

      socketRef.current = ws;
    } else {
      console.log("WebSocket already exists with readyState:", socketRef.current.readyState);
    }
  };

  return (
    <div id="container">
      <h1>Translation Turing Test</h1>

      {/* Language Selection & Presurvey Section */}
      {!isPaired && (
        <div id="language-selection">
          <label htmlFor="language">
            What is your native/most fluent language? This will be the language you chat in.
          </label>
          <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="" disabled>
              Select
            </option>
            <option value="chinese">Chinese</option>
            <option value="dutch">Dutch</option>
            <option value="english">English</option>
            <option value="french">French</option>
            <option value="german">German</option>
            <option value="hindi">Hindi</option>
            <option value="italian">Italian</option>
            <option value="japanese">Japanese</option>
            <option value="korean">Korean</option>
            <option value="spanish">Spanish</option>
          </select>

          {/* Quality of LLM Translation */}
          <div className="question-container">
            <p>
              In general, how would you consider the quality of LLM translation compared to human expert translators?
            </p>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="qualityRating"
                  value="1"
                  checked={qualityRating === "1"}
                  onChange={(e) => setQualityRating(e.target.value)}
                />
                1 (Much worse)
              </label>
              <label>
                <input
                  type="radio"
                  name="qualityRating"
                  value="2"
                  checked={qualityRating === "2"}
                  onChange={(e) => setQualityRating(e.target.value)}
                />
                2 (Slightly worse)
              </label>
              <label>
                <input
                  type="radio"
                  name="qualityRating"
                  value="3"
                  checked={qualityRating === "3"}
                  onChange={(e) => setQualityRating(e.target.value)}
                />
                3 (About the same)
              </label>
              <label>
                <input
                  type="radio"
                  name="qualityRating"
                  value="4"
                  checked={qualityRating === "4"}
                  onChange={(e) => setQualityRating(e.target.value)}
                />
                4 (Slightly better)
              </label>
              <label>
                <input
                  type="radio"
                  name="qualityRating"
                  value="5"
                  checked={qualityRating === "5"}
                  onChange={(e) => setQualityRating(e.target.value)}
                />
                5 (Much better)
              </label>
            </div>
          </div>

          {/* Agreement with LLM Translation Benefits */}
          <div className="question-container">
            <p>
              How much do you agree with the following statement: LLM translations can facilitate seamless conversations between people speaking different languages?
            </p>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="seamlessRating"
                  value="1"
                  checked={seamlessRating === "1"}
                  onChange={(e) => setSeamlessRating(e.target.value)}
                />
                1 (Strongly disagree)
              </label>
              <label>
                <input
                  type="radio"
                  name="seamlessRating"
                  value="2"
                  checked={seamlessRating === "2"}
                  onChange={(e) => setSeamlessRating(e.target.value)}
                />
                2 (Disagree)
              </label>
              <label>
                <input
                  type="radio"
                  name="seamlessRating"
                  value="3"
                  checked={seamlessRating === "3"}
                  onChange={(e) => setSeamlessRating(e.target.value)}
                />
                3 (Neutral)
              </label>
              <label>
                <input
                  type="radio"
                  name="seamlessRating"
                  value="4"
                  checked={seamlessRating === "4"}
                  onChange={(e) => setSeamlessRating(e.target.value)}
                />
                4 (Agree)
              </label>
              <label>
                <input
                  type="radio"
                  name="seamlessRating"
                  value="5"
                  checked={seamlessRating === "5"}
                  onChange={(e) => setSeamlessRating(e.target.value)}
                />
                5 (Strongly agree)
              </label>
            </div>
          </div>

          {/* Effectiveness at Avoiding "Translationese" */}
          <div className="question-container">
            <p>
              How effective do you think LLMs are at avoiding the "translationese" problem (producing translations that sound unnatural or machine-like)?
            </p>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="translationeseRating"
                  value="1"
                  checked={translationeseRating === "1"}
                  onChange={(e) => setTranslationeseRating(e.target.value)}
                />
                1 (Very ineffective)
              </label>
              <label>
                <input
                  type="radio"
                  name="translationeseRating"
                  value="2"
                  checked={translationeseRating === "2"}
                  onChange={(e) => setTranslationeseRating(e.target.value)}
                />
                2 (Somewhat ineffective)
              </label>
              <label>
                <input
                  type="radio"
                  name="translationeseRating"
                  value="3"
                  checked={translationeseRating === "3"}
                  onChange={(e) => setTranslationeseRating(e.target.value)}
                />
                3 (Neutral)
              </label>
              <label>
                <input
                  type="radio"
                  name="translationeseRating"
                  value="4"
                  checked={translationeseRating === "4"}
                  onChange={(e) => setTranslationeseRating(e.target.value)}
                />
                4 (Somewhat effective)
              </label>
              <label>
                <input
                  type="radio"
                  name="translationeseRating"
                  value="5"
                  checked={translationeseRating === "5"}
                  onChange={(e) => setTranslationeseRating(e.target.value)}
                />
                5 (Very effective)
              </label>
            </div>
          </div>

          <button onClick={findPair}>Find a Chat Partner</button>
        </div>
      )}

      {/* The rest of your App.jsx (conversation display, chat input, survey after chat, etc.) remains unchanged */}
    </div>
  );
}

export default App;
