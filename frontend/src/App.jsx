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
      const ws = new WebSocket('ws://34.219.101.222:5173/ws');
      
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

          <label htmlFor="question1">
            In general, how would you consider the quality of LLM translation compared to human expert translators from 1 (very poor) to 5 (very strong)?
          </label>
          <select id="question1" value={question1} onChange={(e) => setQuestion1(e.target.value)}>
            <option value="" disabled>
              Select
            </option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>

          <label htmlFor="question2">
            How would you consider LLM translations in facilitating seamless conversations between people speaking different languages from 1 (very poor) to 5 (very strong)?
          </label>
          <select id="question2" value={question2} onChange={(e) => setQuestion2(e.target.value)}>
            <option value="" disabled>
              Select
            </option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>

          <label htmlFor="question3">
            How effective do you think LLMs are at avoiding the "translationese" problem (producing translations that sound unnatural or machine-like)? Respond from 1 (very ineffective) to 5 (very effective).
          </label>
          <select id="question3" value={question3} onChange={(e) => setQuestion3(e.target.value)}>
            <option value="" disabled>
              Select
            </option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>

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
