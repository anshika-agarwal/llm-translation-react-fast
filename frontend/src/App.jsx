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
  const [qualityRating, setQualityRating] = useState("");
  const [seamlessRating, setSeamlessRating] = useState("");
  const [translationeseRating, setTranslationeseRating] = useState("");  

  // Chat input
  const [chatMessage, setChatMessage] = useState("");

  // Survey responses
  const [engagementRating, setEngagementRating] = useState("");
  const [friendlinessRating, setFriendlinessRating] = useState("");
  const [overallRating, setOverallRating] = useState("");
  const [sameLanguageRating, setSameLanguageRating] = useState("");
  const [guessLanguage, setGuessLanguage] = useState("");
  const [nativeSpeakerReason, setNativeSpeakerReason] = useState("");
  const [continueChat, setContinueChat] = useState("");
  const [chatPartnerType, setChatPartnerType] = useState("");
  const [chatReasoningText, setChatReasoningText] = useState("");
  const [isNativeSpeaker, setIsNativeSpeaker] = useState("");

  // Refs for WebSocket and typing timeout
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Function to initiate a chat (creates a WebSocket connection)
  const findPair = () => {
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
    const requiredFields = [
      engagementRating,
      friendlinessRating,
      overallRating,
      continueChat,
      chatPartnerType,
      chatReasoningText
    ];

    // Only check native speaker fields if chatPartnerType is "real"
    const nativeSpeakerFields = chatPartnerType === "real" ? [
      isNativeSpeaker,
      nativeSpeakerReason
    ] : [];

    const allRequiredFields = [...requiredFields, ...nativeSpeakerFields];

    if (allRequiredFields.some(field => !field)) {
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
      continueChat,
      chatPartnerType,
      chatReasoningText,
      ...(chatPartnerType === "real" && {
        isNativeSpeaker,
        nativeSpeakerReason
      })
    };

    console.log("Submitting survey data:", surveyData);
    socketRef.current.send(JSON.stringify(surveyData));
    alert("Thank you for your time and feedback!");
    setShowSurvey(false);
  };

  return (
    <div className="app-container">
      <div className="app-content">
        <header className="app-header">
          <h1>Translation Turing Test</h1>
          {conversationId && (
            <div className="conversation-id">ID: {conversationId}</div>
          )}
        </header>

        {/* Language Selection */}
        {!isPaired && (
          <div className="language-selection">
            <div className="section-header">
              <h2>Select Your Language</h2>
              <p>Choose your native/most fluent language for the chat</p>
            </div>

            <div className="language-select">
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="" disabled>Select Language</option>
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
            </div>

            <div className="rating-section">
              <div className="rating-card">
                <h3>Translation Quality</h3>
                <p>How does LLM translation compare to human translators?</p>
                <div className="radio-group">
                  {[
                    { value: "1", label: "Much worse" },
                    { value: "2", label: "Slightly worse" },
                    { value: "3", label: "About same" },
                    { value: "4", label: "Slightly better" },
                    { value: "5", label: "Much better" }
                  ].map((option) => (
                    <div key={option.value} className="radio-option">
                      <input
                        type="radio"
                        id={`quality-${option.value}`}
                        name="qualityRating"
                        value={option.value}
                        checked={qualityRating === option.value}
                        onChange={(e) => setQualityRating(e.target.value)}
                      />
                      <label className="radio-option-label" htmlFor={`quality-${option.value}`}>
                        <span className="radio-value">{option.value}</span>
                        <span className="radio-description">{option.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rating-card">
                <h3>Translation Seamless Conversations</h3>
                <p>How much do you agree with the following statement: LLM translations can facilitate seamless conversations between people speaking different languages?</p>
                <div className="rating-grid">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label 
                      key={value}
                      className={`rating-option ${seamlessRating === value.toString() ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="seamlessRating"
                        value={value}
                        checked={seamlessRating === value.toString()}
                        onChange={(e) => setSeamlessRating(e.target.value)}
                      />
                      <span className="rating-value">{value}</span>
                      <span className="rating-label">
                        {value === 1 ? 'Strongly disagree' : 
                         value === 2 ? 'Disagree' :
                         value === 3 ? 'Neutral' :
                         value === 4 ? 'Agree' :
                         'Strongly agree'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rating-card">
                <h3>Translation Avoidance of Translationese</h3>
                <p>How effective do you think LLMs are at avoiding the "translationese" problem (producing translations that sound unnatural or machine-like)?</p>
                <div className="rating-grid">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label 
                      key={value}
                      className={`rating-option ${translationeseRating === value.toString() ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="translationeseRating"
                        value={value}
                        checked={translationeseRating === value.toString()}
                        onChange={(e) => setTranslationeseRating(e.target.value)}
                      />
                      <span className="rating-value">{value}</span>
                      <span className="rating-label">
                        {value === 1 ? 'Very ineffective' : 
                         value === 2 ? 'Somewhat ineffective' :
                         value === 3 ? 'Neutral' :
                         value === 4 ? 'Somewhat effective' :
                         'Very effective'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button className="find-partner-btn" onClick={findPair}>
              Find Chat Partner
            </button>
          </div>
        )}

        {/* Chat Section */}
        {showChat && (
          <div className="chat-section">
            <div className="chat-header">
              <h2>Chat Room</h2>
              <div className="timer">{timer}</div>
            </div>

            <div className="messages-container">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`message ${msg.sender === 'user' ? 'user' : 'partner'}`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onInput={sendTypingStatus}
              />
              <button onClick={sendMessage}>Send</button>
            </div>

            <button className="end-chat-btn" onClick={endChat}>
              End Chat
            </button>
          </div>
        )}

        {/* Survey Section */}
        {showSurvey && (
          <div className="survey-section">
            <h2>Post-Survey</h2>
            
            {/* Engagement Rating */}
            <div className="survey-question">
              <h3>1. How would you rate your conversation on engagement?</h3>
              <div className="radio-group">
                {[
                  { value: "1", label: "Very unengaging" },
                  { value: "2", label: "Somewhat unengaging" },
                  { value: "3", label: "Neutral" },
                  { value: "4", label: "Engaging" },
                  { value: "5", label: "Very engaging" }
                ].map((option) => (
                  <div key={option.value} className="radio-option">
                    <input
                      type="radio"
                      id={`engagement-${option.value}`}
                      name="engagementRating"
                      value={option.value}
                      checked={engagementRating === option.value}
                      onChange={(e) => setEngagementRating(e.target.value)}
                    />
                    <label className="radio-option-label" htmlFor={`engagement-${option.value}`}>
                      <span className="radio-value">{option.value}</span>
                      <span className="radio-description">{option.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Friendliness Rating */}
            <div className="survey-question">
              <h3>2. How would you rate your conversation on friendliness?</h3>
              <div className="radio-group">
                {[
                  { value: "1", label: "Very unfriendly" },
                  { value: "2", label: "Somewhat unfriendly" },
                  { value: "3", label: "Neutral" },
                  { value: "4", label: "Friendly" },
                  { value: "5", label: "Very friendly" }
                ].map((option) => (
                  <div key={option.value} className="radio-option">
                    <input
                      type="radio"
                      id={`friendliness-${option.value}`}
                      name="friendlinessRating"
                      value={option.value}
                      checked={friendlinessRating === option.value}
                      onChange={(e) => setFriendlinessRating(e.target.value)}
                    />
                    <label className="radio-option-label" htmlFor={`friendliness-${option.value}`}>
                      <span className="radio-value">{option.value}</span>
                      <span className="radio-description">{option.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Quality Rating */}
            <div className="survey-question">
              <h3>3. How would you rate the conversation quality overall?</h3>
              <div className="radio-group">
                {[
                  { value: "1", label: "Very bad" },
                  { value: "2", label: "Bad" },
                  { value: "3", label: "Neutral" },
                  { value: "4", label: "Good" },
                  { value: "5", label: "Very good" }
                ].map((option) => (
                  <div key={option.value} className="radio-option">
                    <input
                      type="radio"
                      id={`quality-${option.value}`}
                      name="overallRating"
                      value={option.value}
                      checked={overallRating === option.value}
                      onChange={(e) => setOverallRating(e.target.value)}
                    />
                    <label className="radio-option-label" htmlFor={`quality-${option.value}`}>
                      <span className="radio-value">{option.value}</span>
                      <span className="radio-description">{option.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Conversation */}
            <div className="survey-question">
              <h3>4. Do you want to continue conversing with this individual?</h3>
              <div className="binary-radio-group">
                <div className="binary-radio-option">
                  <input
                    type="radio"
                    id="continue-yes"
                    name="continueChat"
                    value="yes"
                    checked={continueChat === "yes"}
                    onChange={(e) => setContinueChat(e.target.value)}
                  />
                  <label className="binary-radio-label" htmlFor="continue-yes">Yes</label>
                </div>
                <div className="binary-radio-option">
                  <input
                    type="radio"
                    id="continue-no"
                    name="continueChat"
                    value="no"
                    checked={continueChat === "no"}
                    onChange={(e) => setContinueChat(e.target.value)}
                  />
                  <label className="binary-radio-label" htmlFor="continue-no">No</label>
                </div>
              </div>
            </div>

            {/* Chat Partner Type */}
            <div className="survey-question">
              <h3>5. Do you think you were chatting with a real person or AI bot?</h3>
              <div className="binary-radio-group">
                <div className="binary-radio-option">
                  <input
                    type="radio"
                    id="partner-real"
                    name="chatPartnerType"
                    value="real"
                    checked={chatPartnerType === "real"}
                    onChange={(e) => setChatPartnerType(e.target.value)}
                  />
                  <label className="binary-radio-label" htmlFor="partner-real">Real person</label>
                </div>
                <div className="binary-radio-option">
                  <input
                    type="radio"
                    id="partner-ai"
                    name="chatPartnerType"
                    value="ai"
                    checked={chatPartnerType === "ai"}
                    onChange={(e) => setChatPartnerType(e.target.value)}
                  />
                  <label className="binary-radio-label" htmlFor="partner-ai">AI bot</label>
                </div>
              </div>
            </div>

            {/* Reasoning */}
            <div className="survey-question">
              <h3>6. Why did you believe your chat was a {chatPartnerType === "real" ? "real person" : "AI bot"}?</h3>
              <textarea
                value={chatReasoningText}
                onChange={(e) => setChatReasoningText(e.target.value)}
                placeholder="Please explain your reasoning..."
                rows="4"
              />
            </div>

            {/* Native Speaker Questions - Only show if chatPartnerType is "real" */}
            {chatPartnerType === "real" && (
              <>
                <div className="survey-question">
                  <h3>7. Do you think you were chatting with a native speaker of the language you chose?</h3>
                  <div className="binary-radio-group">
                    <div className="binary-radio-option">
                      <input
                        type="radio"
                        id="native-yes"
                        name="isNativeSpeaker"
                        value="yes"
                        checked={isNativeSpeaker === "yes"}
                        onChange={(e) => setIsNativeSpeaker(e.target.value)}
                      />
                      <label className="binary-radio-label" htmlFor="native-yes">Yes</label>
                    </div>
                    <div className="binary-radio-option">
                      <input
                        type="radio"
                        id="native-no"
                        name="isNativeSpeaker"
                        value="no"
                        checked={isNativeSpeaker === "no"}
                        onChange={(e) => setIsNativeSpeaker(e.target.value)}
                      />
                      <label className="binary-radio-label" htmlFor="native-no">No</label>
                    </div>
                  </div>
                </div>

                <div className="survey-question">
                  <h3>8. Why did you believe your chat was a {isNativeSpeaker === "yes" ? "native" : "non-native"} speaker?</h3>
                  <textarea
                    value={nativeSpeakerReason}
                    onChange={(e) => setNativeSpeakerReason(e.target.value)}
                    placeholder="Please explain your reasoning..."
                    rows="4"
                  />
                </div>
              </>
            )}

            <button className="submit-survey-btn" onClick={submitSurvey}>
              Submit Survey
            </button>
          </div>
        )}

        {/* Chat Partner Popup */}
        {showChatPartnerPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <div className="loading-spinner"></div>
              <p>Looking for a chat partner...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;