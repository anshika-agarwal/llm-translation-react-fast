import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from './LanguageContext';

function App() {
  const { getText, formatText, displayLanguage, language, translations, prolificPid, studyId, sessionId } = useLanguage();

  // States for UI visibility and data
  const [isPaired, setIsPaired] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showChatPartnerPopup, setShowChatPartnerPopup] = useState(false);
  const [messages, setMessages] = useState([]);
  const [timer, setTimer] = useState("3:00");
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  // Chat input
  const [chatMessage, setChatMessage] = useState("");

  // Survey responses
  const [comprehensionRating, setComprehensionRating] = useState("");
  const [closenessRating, setClosenessRating] = useState("");
  const [enjoymentRating, setEnjoymentRating] = useState("");
  const [engagementRating, setEngagementRating] = useState("");
  const [listeningRating, setListeningRating] = useState("");
  const [interestRating, setInterestRating] = useState("");
  const [commongroundRating, setCommongroundRating] = useState("");
  const [responsivenessRating, setResponsivenessRating] = useState("");
  const [futureInteractionRating, setFutureInteractionRating] = useState("");
  const [reasoningText, setReasoningText] = useState("");
  const [partnerIdentity, setPartnerIdentity] = useState("");
  const [identityReasoningText, setIdentityReasoningText] = useState("");

  // Refs for WebSocket and typing timeout
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Add state for completed survey
  const [surveyCompleted, setSurveyCompleted] = useState(false);

  // Add this near the top with other state declarations
  const [conversationStarter, setConversationStarter] = useState("");

  // Add new state for waiting
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitStartTime, setWaitStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Effect to scroll to top when sections change
  React.useEffect(() => {
    if (showChat || showSurvey || isPaired) {
      scrollToTop();
    }
  }, [showChat, showSurvey, isPaired]);

  // Effect to reset states when survey is completed
  React.useEffect(() => {
    if (surveyCompleted) {
      setIsPaired(false);
      setShowChat(false);
      setShowSurvey(false);
      setMessages([]);
      setComprehensionRating("");
      setClosenessRating("");
      setEnjoymentRating("");
      setEngagementRating("");
      setListeningRating("");
      setInterestRating("");
      setCommongroundRating("");
      setResponsivenessRating("");
      setFutureInteractionRating("");
      setReasoningText("");
      setPartnerIdentity("");
      setIdentityReasoningText("");
      setSurveyCompleted(false);
      scrollToTop();
    }
  }, [surveyCompleted]);

  useEffect(() => {
    let intervalId;
    if (waitStartTime && isWaiting) {
      intervalId = setInterval(() => {
        const elapsed = Math.floor((Date.now() - waitStartTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [waitStartTime, isWaiting]);

  // Function to initiate a chat (creates a WebSocket connection)
  const findPair = async () => {
    setIsWaiting(true);
    setWaitStartTime(Date.now());
    
    console.log("Attempting to find chat partner...");
    setShowChatPartnerPopup(true);

    if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
      console.log("Creating new WebSocket connection...");
      const ws = new WebSocket('ws://34.219.101.222:8000/ws');
      
      ws.onopen = () => {
        console.log("WebSocket connection opened successfully");
        const data = {
          type: "language",
          language: displayLanguage,
          prolific_pid: prolificPid,
          study_id: studyId,
          session_id: sessionId
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
          // Get the conversation starter from translations using the index
          const starterIndex = data.starter_index;
          const currentLanguage = language.toLowerCase();
          const starter = translations[currentLanguage].conversationStarters[currentLanguage][starterIndex];
          setConversationStarter(starter);
          console.log(data.message);
        } else if (data.type === "timer") {
          const minutes = Math.floor(data.remaining_time / 60);
          const seconds = data.remaining_time % 60;
          setTimer(`${minutes}:${seconds.toString().padStart(2, "0")}`);
        } else if (data.type === "message") {
          setMessages((prev) => [...prev, { text: data.text, sender: "partner" }]);
          setIsPartnerTyping(false);
        } else if (data.type === "typing") {
          handleTypingStatus(data.status);
        } else if (data.type === "survey" || data.type === "expired") {
          setShowChat(false);
          setShowSurvey(true);
          setConversationId(data.conversation_id);
          console.log(data.message);
        } else if (data.type === "surveyCompleted") {
          console.log("Survey submission confirmed");
          // Show thank you message and redirect immediately for this user
          setShowSurvey(false);
          setSurveyCompleted(true);
          alert(getText('thankYouMessage'));
          window.location.href = "https://app.prolific.com/submissions/complete?cc=C18NAU1C";
        } else if (data.type === "waitingRoomTimeout") {
          setShowChatPartnerPopup(false);
          setIsWaiting(false);
          setWaitStartTime(null);
          setElapsedTime(0);
          // Clean up WebSocket connection
          if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
          }
          alert(getText('timeoutMessage'));
          window.location.href = "https://app.prolific.com/submissions/complete?cc=CSNW5H07";
        } else if (data.type === "info") {
          // Handle partner disconnection notification
          console.log("Partner status update:", data.message);
          // Show the translated message to the user
          alert(getText('partnerDisconnectedMessage'));
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
        alert(getText('serverErrorMessage'));
        setShowChatPartnerPopup(false);
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed with code:", event.code);
        console.log("Close reason:", event.reason);
        // Only close the popup if we're not paired or if we've completed the survey
        if (!isPaired || surveyCompleted) {
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

  // Submit survey responses
  const submitSurvey = () => {
    const requiredFields = [
      comprehensionRating,
      closenessRating,
      enjoymentRating,
      engagementRating,
      listeningRating,
      interestRating,
      commongroundRating,
      responsivenessRating,
      futureInteractionRating,
      reasoningText,
      partnerIdentity,
      identityReasoningText
    ];

    if (requiredFields.some(field => !field)) {
      alert("Please answer all the survey questions before submitting.");
      return;
    }

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      alert("Connection to the server has been lost. Your survey cannot be submitted.");
      return;
    }

    const surveyData = {
      type: "survey",
      comprehensionRating,
      closenessRating,
      enjoymentRating,
      engagementRating,
      listeningRating,
      interestRating,
      commongroundRating,
      responsivenessRating,
      futureInteractionRating,
      reasoningText,
      partnerIdentity,
      identityReasoningText
    };

    console.log("Submitting survey data:", surveyData);
    socketRef.current.send(JSON.stringify(surveyData));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Add this function to handle typing status
  const handleTypingStatus = (status) => {
    setIsPartnerTyping(status === "typing");
  };

  return (
    <div className="app-container">
      <div className="app-content">
        <header className="app-header">
          <h1>{getText('title')}</h1>
          {conversationId && (
            <div className="conversation-id">ID: {conversationId}</div>
          )}
        </header>

        {/* Chat Section */}
        {showChat && (
          <div className="chat-section">
            <div className="chat-header">
              <h2>{getText('chatRoomTitle')}</h2>
              <div className="timer">{timer}</div>
            </div>

            <div className="messages-container">
              {conversationStarter && (
                <div className="conversation-starter">
                  <p className="starter-question">{conversationStarter}</p>
                </div>
              )}
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`message ${msg.sender === 'user' ? 'user' : 'partner'}`}
                >
                  {msg.text}
                </div>
              ))}
              {isPartnerTyping && (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
              <input
                type="text"
                placeholder={getText('messagePlaceholder')}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onInput={sendTypingStatus}
              />
              <button onClick={sendMessage}>{getText('sendButton')}</button>
            </div>
          </div>
        )}

        {/* Welcome Container - Only show when not in chat or survey */}
        {!showChat && !showSurvey && (
          <div className="welcome-container">
            <p className="research-info">{translations[language].researchStudyInfo}</p>
            {!isPaired && (
              <button className="button-primary find-partner-btn" onClick={findPair}>
                {getText('findPartnerButton')}
              </button>
            )}
          </div>
        )}

        {/* Survey Section */}
        {showSurvey && (
          <div className="survey-section">
            <h2>{getText('postSurveyTitle')}</h2>
            
            {/* Comprehension Rating */}
            <div className="survey-question">
              <h3>{getText('comprehensionQuestion')}</h3>
              <div className="radio-group">
                {Object.entries(translations[language][getText('comprehensionOptions')]).map(([value, label]) => (
                  <div key={value} className="radio-option">
                    <input
                      type="radio"
                      id={`comprehension-${value}`}
                      name="comprehensionRating"
                      value={value}
                      checked={comprehensionRating === value}
                      onChange={(e) => setComprehensionRating(e.target.value)}
                    />
                    <label className="radio-option-label" htmlFor={`comprehension-${value}`}>
                      <span className="radio-value">{value}</span>
                      <span className="radio-description">{label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Closeness Rating */}
            <div className="survey-question">
              <h3>{getText('closenessQuestion')}</h3>
              <div className="radio-group">
                {Object.entries(translations[language][getText('closenessOptions')]).map(([value, label]) => (
                  <div key={value} className="radio-option">
                    <input
                      type="radio"
                      id={`closeness-${value}`}
                      name="closenessRating"
                      value={value}
                      checked={closenessRating === value}
                      onChange={(e) => setClosenessRating(e.target.value)}
                    />
                    <label className="radio-option-label" htmlFor={`closeness-${value}`}>
                      <span className="radio-value">{value}</span>
                      <span className="radio-description">{label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Enjoyment Rating */}
            <div className="survey-question">
              <h3>{getText('enjoymentQuestion')}</h3>
              <div className="radio-group">
                {Object.entries(translations[language][getText('enjoymentOptions')]).map(([value, label]) => (
                  <div key={value} className="radio-option">
                    <input
                      type="radio"
                      id={`enjoyment-${value}`}
                      name="enjoymentRating"
                      value={value}
                      checked={enjoymentRating === value}
                      onChange={(e) => setEnjoymentRating(e.target.value)}
                    />
                    <label className="radio-option-label" htmlFor={`enjoyment-${value}`}>
                      <span className="radio-value">{value}</span>
                      <span className="radio-description">{label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Engagement Rating */}
            <div className="survey-question">
              <h3>{getText('engagementQuestion')}</h3>
              <div className="radio-group">
                {Object.entries(translations[language][getText('engagementOptions')]).map(([value, label]) => (
                  <div key={value} className="radio-option">
                    <input
                      type="radio"
                      id={`engagement-${value}`}
                      name="engagementRating"
                      value={value}
                      checked={engagementRating === value}
                      onChange={(e) => setEngagementRating(e.target.value)}
                    />
                    <label className="radio-option-label" htmlFor={`engagement-${value}`}>
                      <span className="radio-value">{value}</span>
                      <span className="radio-description">{label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Listening Rating */}
            <div className="survey-question">
              <h3>{getText('listeningQuestion')}</h3>
              <div className="radio-group">
                {Object.entries(translations[language].threePointScale).map(([value, label]) => (
                  <div key={value} className="radio-option">
                    <input
                      type="radio"
                      id={`listening-${value}`}
                      name="listeningRating"
                      value={value}
                      checked={listeningRating === value}
                      onChange={(e) => setListeningRating(e.target.value)}
                    />
                    <label className="radio-option-label" htmlFor={`listening-${value}`}>
                      <span className="radio-value">{value}</span>
                      <span className="radio-description">{label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Interest Rating */}
            <div className="survey-question">
              <h3>{getText('interestQuestion')}</h3>
              <div className="radio-group">
                {Object.entries(translations[language].threePointScale).map(([value, label]) => (
                  <div key={value} className="radio-option">
                    <input
                      type="radio"
                      id={`interest-${value}`}
                      name="interestRating"
                      value={value}
                      checked={interestRating === value}
                      onChange={(e) => setInterestRating(e.target.value)}
                    />
                    <label className="radio-option-label" htmlFor={`interest-${value}`}>
                      <span className="radio-value">{value}</span>
                      <span className="radio-description">{label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Ground Rating */}
            <div className="survey-question">
              <h3>{getText('commongroundQuestion')}</h3>
              <div className="radio-group">
                {Object.entries(translations[language].threePointScale).map(([value, label]) => (
                  <div key={value} className="radio-option">
                    <input
                      type="radio"
                      id={`commonground-${value}`}
                      name="commongroundRating"
                      value={value}
                      checked={commongroundRating === value}
                      onChange={(e) => setCommongroundRating(e.target.value)}
                    />
                    <label className="radio-option-label" htmlFor={`commonground-${value}`}>
                      <span className="radio-value">{value}</span>
                      <span className="radio-description">{label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Responsiveness Rating */}
            <div className="survey-question">
              <h3>{getText('responsivenessQuestion')}</h3>
              <div className="radio-group">
                {Object.entries(translations[language].threePointScale).map(([value, label]) => (
                  <div key={value} className="radio-option">
                    <input
                      type="radio"
                      id={`responsiveness-${value}`}
                      name="responsivenessRating"
                      value={value}
                      checked={responsivenessRating === value}
                      onChange={(e) => setResponsivenessRating(e.target.value)}
                    />
                    <label className="radio-option-label" htmlFor={`responsiveness-${value}`}>
                      <span className="radio-value">{value}</span>
                      <span className="radio-description">{label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Future Interaction Rating */}
            <div className="survey-question">
              <h3>{getText('futureInteractionQuestion')}</h3>
              <div className="radio-group">
                {Object.entries(translations[language].threePointScale).map(([value, label]) => (
                  <div key={value} className="radio-option">
                    <input
                      type="radio"
                      id={`futureInteraction-${value}`}
                      name="futureInteractionRating"
                      value={value}
                      checked={futureInteractionRating === value}
                      onChange={(e) => setFutureInteractionRating(e.target.value)}
                    />
                    <label className="radio-option-label" htmlFor={`futureInteraction-${value}`}>
                      <span className="radio-value">{value}</span>
                      <span className="radio-description">{label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Reasoning */}
            <div className="survey-question">
              <h3>{getText('reasoningQuestion')}</h3>
              <textarea
                value={reasoningText}
                onChange={(e) => setReasoningText(e.target.value)}
                placeholder={getText('reasoningPlaceholder')}
                rows="4"
              />
            </div>

            {/* Partner Identity */}
            <div className="survey-question">
              <h3>{getText('partnerIdentityQuestion')}</h3>
              <div className="radio-group">
                {Object.entries(translations[language][getText('partnerIdentityOptions')]).map(([value, label]) => (
                  <div key={value} className="radio-option">
                    <input
                      type="radio"
                      id={`partnerIdentity-${value}`}
                      name="partnerIdentity"
                      value={value}
                      checked={partnerIdentity === value}
                      onChange={(e) => setPartnerIdentity(e.target.value)}
                    />
                    <label className="radio-option-label" htmlFor={`partnerIdentity-${value}`}>
                      <span className="radio-description">{label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Identity Reasoning */}
            <div className="survey-question">
              <h3>{getText('identityReasoningQuestion')}</h3>
              <textarea
                value={identityReasoningText}
                onChange={(e) => setIdentityReasoningText(e.target.value)}
                placeholder={getText('identityReasoningPlaceholder')}
                rows="4"
              />
            </div>

            <button className="button-primary submit-survey-btn" onClick={submitSurvey}>
              {getText('submitSurveyButton')}
            </button>
          </div>
        )}

        {/* Chat Partner Popup */}
        {showChatPartnerPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <div className="loading-spinner"></div>
              <h2 className="popup-title">{getText('waitingTitle')}</h2>
              <div className="popup-wait-time">
                {getText('waitTimeLabel')} {formatTime(elapsedTime)}
              </div>
              <p className="popup-description">
                {getText('waitingDescription')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;