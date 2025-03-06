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

  // States for language selection and presurvey
  const [language, setLanguage] = useState("");
  const [question1, setQuestion1] = useState("");
  const [question2, setQuestion2] = useState("");
  const [question3, setQuestion3] = useState("");

  // Chat input
  const [chatMessage, setChatMessage] = useState("");

  // Survey responses
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
    if (!language || !question1 || !question2 || !question3) {
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
        const data = {
          type: "language",
          language: language,
          question1: question1,
          question2: question2,
          question3: question3,
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
          // Hide typing indicator if implemented
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

  // Send chat message
  const sendMessage = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "message", text: chatMessage }));
      setMessages((prev) => [...prev, { text: chatMessage, sender: "user" }]);
      setChatMessage("");
    }
  };

  // Send typing status
  const sendTypingStatus = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "typing" }));
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "stopTyping" }));
      }
    }, 3000);
  };

  // End the chat
  const endChat = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("Sending endChat message");
      socketRef.current.send(JSON.stringify({ type: "endChat" }));
    } else {
      console.error("WebSocket is not open; cannot send endChat message.");
    }
  };

  // Submit survey responses
  const submitSurvey = () => {
    if (
      !engagementRating ||
      !friendlinessRating ||
      !overallRating ||
      !sameLanguageRating ||
      !guessLanguage ||
      !nativeSpeakerReason
    ) {
      alert("Please answer all the survey questions before submitting.");
      return;
    }
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      alert("Connection to the server has been lost. Your survey cannot be submitted.");
      return;
    }
    const surveyData = {
      type: "survey",
      engagementRating,
      friendlinessRating,
      overallRating,
      sameLanguageRating,
      guessLanguage,
      nativeSpeakerReason,
    };
    console.log("Submitting survey data:", surveyData);
    socketRef.current.send(JSON.stringify(surveyData));
    alert("Thank you for your time and feedback!");
    setShowSurvey(false);
  };

  return (
    <div id="container">
      <h1>Translation Turing Test</h1>

      {/* Language Selection */}
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

      {/* Conversation ID Display */}
      {conversationId && <div id="conversation-id">Conversation ID: {conversationId}</div>}

      {/* Chat Section */}
      {showChat && (
        <div id="chat">
          <h3>Chat Room</h3>
          <div id="timer">Time Remaining: {timer}</div>
          <div id="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div id="typing-indicator">User is typing...</div>
          <input
            id="message"
            type="text"
            placeholder="Type your message here..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onInput={sendTypingStatus}
          />
          <button onClick={sendMessage}>Send</button>
          <button id="end-chat" onClick={endChat}>
            End Chat
          </button>
        </div>
      )}

      {/* Survey Section */}
      {showSurvey && (
        <div id="survey">
          <h3>Survey</h3>
          <div id="conversation-id">Conversation ID: {conversationId}</div>
          <label>
            How would you rate your conversation on engagement, where 1 is very unengaging and 5 is super engaging?
          </label>
          <select value={engagementRating} onChange={(e) => setEngagementRating(e.target.value)}>
            <option value="" disabled>
              Select
            </option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>

          <label>
            How would you rate your conversation on friendliness, where 1 is very unfriendly and 5 is super friendly?
          </label>
          <select value={friendlinessRating} onChange={(e) => setFriendlinessRating(e.target.value)}>
            <option value="" disabled>
              Select
            </option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>

          <label>
            How would you rate the conversation quality overall, where 1 is very bad and 5 is very good?
          </label>
          <select value={overallRating} onChange={(e) => setOverallRating(e.target.value)}>
            <option value="" disabled>
              Select
            </option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>

          <label>Do you think your chat partner is speaking the same language as you?</label>
          <select value={sameLanguageRating} onChange={(e) => setSameLanguageRating(e.target.value)}>
            <option value="" disabled>
              Select
            </option>
            <option value="1">Definitely not the same language</option>
            <option value="2">Likely not the same language</option>
            <option value="3">I cannot tell</option>
            <option value="4">Likely the same language</option>
            <option value="5">Definitely the same language</option>
          </select>

          <label>Which language do you think the person you are chatting with speaks?</label>
          <select value={guessLanguage} onChange={(e) => setGuessLanguage(e.target.value)}>
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

          <label>Why do you think the person you are chatting with speaks this language?</label>
          <textarea
            id="nativeSpeakerReason"
            rows="4"
            placeholder="Please share your thoughts here..."
            value={nativeSpeakerReason}
            onChange={(e) => setNativeSpeakerReason(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginTop: "5px",
              marginBottom: "15px",
              boxSizing: "border-box",
            }}
          ></textarea>

          <button onClick={submitSurvey}>Submit Feedback</button>
        </div>
      )}

      {/* Chat Partner Popup */}
      {showChatPartnerPopup && (
        <div id="chat-partner-popup" style={{ display: showChatPartnerPopup ? 'block' : 'none' }}>
          <p>Looking for a chat partner...</p>
        </div>
      )}
    </div>
  );
}

export default App;