import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from './LanguageContext';

function App() {
  const { getText, formatText, displayLanguage, language, translations } = useLanguage();

  // States for UI visibility and data
  const [isPaired, setIsPaired] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showChatPartnerPopup, setShowChatPartnerPopup] = useState(false);
  const [messages, setMessages] = useState([]);
  const [timer, setTimer] = useState("3:00");
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  // States for presurvey
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

  // Add state for completed survey
  const [surveyCompleted, setSurveyCompleted] = useState(false);

  // Add this near the top with other state declarations
  const [conversationStarter, setConversationStarter] = useState("");

  // Add new state for waiting
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitStartTime, setWaitStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Add this near the top with other state declarations
  const [prolificPid, setProlificPid] = useState(null);

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
      setQualityRating("");
      setSeamlessRating("");
      setTranslationeseRating("");
      setEngagementRating("");
      setFriendlinessRating("");
      setOverallRating("");
      setContinueChat("");
      setChatPartnerType("");
      setChatReasoningText("");
      setIsNativeSpeaker("");
      setNativeSpeakerReason("");
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

  // Add this effect after other useEffect declarations
  useEffect(() => {
    // Extract PROLIFIC_PID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const pid = urlParams.get('PROLIFIC_PID');
    if (pid) {
      setProlificPid(pid);
      console.log("Found Prolific ID:", pid);
    }
  }, []);

  // Function to initiate a chat (creates a WebSocket connection)
  const findPair = async () => {
    setIsWaiting(true);
    setWaitStartTime(Date.now());
    if (!qualityRating || !seamlessRating || !translationeseRating) {
      alert(getText('fillPresurveyMessage'));
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
          language: displayLanguage,
          qualityRating: qualityRating,
          seamlessRating: seamlessRating,
          translationeseRating: translationeseRating,
          prolific_pid: prolificPid
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
          const starter = translations[currentLanguage].conversationStarters[starterIndex];
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
        } else if (data.type === "surveyReceived") {
          setShowSurvey(false);
          setSurveyCompleted(true);
          alert(getText('thankYouMessage'));
          window.location.href = "https://app.prolific.com/submissions/complete?cc=CGX95L68";
        } else if (data.type === "waitingRoomTimeout") {
          setShowChatPartnerPopup(false);
          alert(getText('noPartnerFoundMessage'));
          window.location.href = "https://app.prolific.com/submissions/complete?cc=C1MWSEL0";
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
    // Note: We no longer close the survey here - we wait for the surveyReceived message
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

        {!isPaired && (
          <div className="rating-section">
            <div className="rating-card">
              <p>{getText('llmComparisonQuestion')}</p>
              <div className="radio-group">
                {Object.entries(getText('llmComparisonOptions')).map(([value, label]) => (
                  <div key={value} className="radio-option">
                    <input
                      type="radio"
                      id={`quality-${value}`}
                      name="qualityRating"
                      value={value}
                      checked={qualityRating === value}
                      onChange={(e) => setQualityRating(e.target.value)}
                    />
                    <label className="radio-option-label" htmlFor={`quality-${value}`}>
                      <span className="radio-value">{value}</span>
                      <span className="radio-description">{label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="rating-card">
              <p>{getText('seamlessConversationQuestion')}</p>
              <div className="radio-group">
                {Object.entries(getText('seamlessConversationOptions')).map(([value, label]) => (
                  <div key={value} className="radio-option">
                    <input
                      type="radio"
                      id={`seamless-${value}`}
                      name="seamlessRating"
                      value={value}
                      checked={seamlessRating === value}
                      onChange={(e) => setSeamlessRating(e.target.value)}
                    />
                    <label className="radio-option-label" htmlFor={`seamless-${value}`}>
                      <span className="radio-value">{value}</span>
                      <span className="radio-description">{label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="rating-card">
              <p>{getText('translationeseQuestion')}</p>
              <div className="radio-group">
                {Object.entries(getText('translationeseOptions')).map(([value, label]) => (
                  <div key={value} className="radio-option">
                    <input
                      type="radio"
                      id={`translationese-${value}`}
                      name="translationeseRating"
                      value={value}
                      checked={translationeseRating === value}
                      onChange={(e) => setTranslationeseRating(e.target.value)}
                    />
                    <label className="radio-option-label" htmlFor={`translationese-${value}`}>
                      <span className="radio-value">{value}</span>
                      <span className="radio-description">{label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button className="button-primary find-partner-btn" onClick={findPair}>
              {getText('findPartnerButton')}
            </button>
          </div>
        )}

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
                  <p>{getText('conversationStarterLabel')}</p>
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

            <button className="button-primary end-chat-btn" onClick={endChat}>
              {getText('endChatButton')}
            </button>
          </div>
        )}

        {/* Survey Section */}
        {showSurvey && (
          <div className="survey-section">
            <h2>{getText('postSurveyTitle')}</h2>
            
            {/* Engagement Rating */}
            <div className="survey-question">
              <h3>{getText('engagementQuestion')}</h3>
              <div className="radio-group">
                {Object.entries(getText('engagementOptions')).map(([value, label]) => (
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

            {/* Friendliness Rating */}
            <div className="survey-question">
              <h3>{getText('friendlinessQuestion')}</h3>
              <div className="radio-group">
                {Object.entries(getText('friendlinessOptions')).map(([value, label]) => (
                  <div key={value} className="radio-option">
                    <input
                      type="radio"
                      id={`friendliness-${value}`}
                      name="friendlinessRating"
                      value={value}
                      checked={friendlinessRating === value}
                      onChange={(e) => setFriendlinessRating(e.target.value)}
                    />
                    <label className="radio-option-label" htmlFor={`friendliness-${value}`}>
                      <span className="radio-value">{value}</span>
                      <span className="radio-description">{label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Quality Rating */}
            <div className="survey-question">
              <h3>{getText('overallQuestion')}</h3>
              <div className="radio-group">
                {Object.entries(getText('overallOptions')).map(([value, label]) => (
                  <div key={value} className="radio-option">
                    <input
                      type="radio"
                      id={`quality-${value}`}
                      name="overallRating"
                      value={value}
                      checked={overallRating === value}
                      onChange={(e) => setOverallRating(e.target.value)}
                    />
                    <label className="radio-option-label" htmlFor={`quality-${value}`}>
                      <span className="radio-value">{value}</span>
                      <span className="radio-description">{label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Conversation */}
            <div className="survey-question">
              <h3>{getText('continueQuestion')}</h3>
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
                  <label className="binary-radio-label" htmlFor="continue-yes">{getText('yesOption')}</label>
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
                  <label className="binary-radio-label" htmlFor="continue-no">{getText('noOption')}</label>
                </div>
              </div>
            </div>

            {/* Chat Partner Type */}
            <div className="survey-question">
              <h3>{getText('chatPartnerQuestion')}</h3>
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
                  <label className="binary-radio-label" htmlFor="partner-real">{getText('realPersonOption')}</label>
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
                  <label className="binary-radio-label" htmlFor="partner-ai">{getText('aiBotOption')}</label>
                </div>
              </div>
            </div>

            {/* Reasoning */}
            <div className="survey-question">
              <h3>{formatText('reasoningQuestion', chatPartnerType === "real" ? getText('realPersonOption').toLowerCase() : getText('aiBotOption').toLowerCase())}</h3>
              <textarea
                value={chatReasoningText}
                onChange={(e) => setChatReasoningText(e.target.value)}
                placeholder={getText('reasoningPlaceholder')}
                rows="4"
              />
            </div>

            {/* Native Speaker Questions - Only show if chatPartnerType is "real" */}
            {chatPartnerType === "real" && (
              <>
                <div className="survey-question">
                  <h3>{getText('nativeSpeakerQuestion')}</h3>
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
                      <label className="binary-radio-label" htmlFor="native-yes">{getText('yesOption')}</label>
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
                      <label className="binary-radio-label" htmlFor="native-no">{getText('noOption')}</label>
                    </div>
                  </div>
                </div>

                <div className="survey-question">
                  <h3>{formatText('nativeSpeakerReasonQuestion', isNativeSpeaker === "yes" ? getText('nativeOption') : getText('nonNativeOption'))}</h3>
                  <textarea
                    value={nativeSpeakerReason}
                    onChange={(e) => setNativeSpeakerReason(e.target.value)}
                    placeholder={getText('reasoningPlaceholder')}
                    rows="4"
                  />
                </div>
              </>
            )}

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