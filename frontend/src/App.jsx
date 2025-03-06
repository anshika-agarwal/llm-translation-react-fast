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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Translation Turing Test
          </h1>
          {conversationId && (
            <div className="text-sm text-gray-500">
              Conversation ID: {conversationId}
            </div>
          )}
        </header>

        {/* Language Selection */}
        {!isPaired && (
          <div className="space-y-8">
            <div className="space-y-4">
              <label htmlFor="language" className="block text-xl font-medium text-gray-900">
                Select Your Language
              </label>
              <p className="text-gray-500">
                Choose your native/most fluent language. This will be the language you chat in.
              </p>
              <select 
                id="language" 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-4 text-lg border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
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
            </div>

            {/* Rating Questions */}
            <div className="space-y-12">
              {/* Each question container */}
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-gray-900">
                  LLM Translation Quality Assessment
                </h3>
                <p className="text-gray-500">
                  In general, how would you consider the quality of LLM translation compared to human expert translators?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label 
                      key={value}
                      className={`
                        relative flex flex-col items-center p-4 border rounded-xl cursor-pointer
                        ${qualityRating === value.toString() 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-indigo-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="qualityRating"
                        value={value}
                        checked={qualityRating === value.toString()}
                        onChange={(e) => setQualityRating(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-2xl font-bold text-gray-900">{value}</span>
                      <span className="text-sm text-gray-500">
                        {value === 1 ? 'Much worse' : 
                         value === 2 ? 'Slightly worse' :
                         value === 3 ? 'About same' :
                         value === 4 ? 'Slightly better' :
                         'Much better'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-medium text-gray-900">
                  LLM Translation Seamless Conversations Assessment
                </h3>
                <p className="text-gray-500">
                  How much do you agree with the following statement: LLM translations can facilitate seamless conversations between people speaking different languages?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label 
                      key={value}
                      className={`
                        relative flex flex-col items-center p-4 border rounded-xl cursor-pointer
                        ${seamlessRating === value.toString() 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-indigo-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="seamlessRating"
                        value={value}
                        checked={seamlessRating === value.toString()}
                        onChange={(e) => setSeamlessRating(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-2xl font-bold text-gray-900">{value}</span>
                      <span className="text-sm text-gray-500">
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

              <div className="space-y-4">
                <h3 className="text-xl font-medium text-gray-900">
                  LLM Translation Avoidance of Translationese Assessment
                </h3>
                <p className="text-gray-500">
                  How effective do you think LLMs are at avoiding the "translationese" problem (producing translations that sound unnatural or machine-like)?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label 
                      key={value}
                      className={`
                        relative flex flex-col items-center p-4 border rounded-xl cursor-pointer
                        ${translationeseRating === value.toString() 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-indigo-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="translationeseRating"
                        value={value}
                        checked={translationeseRating === value.toString()}
                        onChange={(e) => setTranslationeseRating(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-2xl font-bold text-gray-900">{value}</span>
                      <span className="text-sm text-gray-500">
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

            <button 
              onClick={findPair}
              className="w-full py-4 text-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Find a Chat Partner
            </button>
          </div>
        )}

        {/* Chat Section */}
        {showChat && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Chat Room</h3>
              <div className="text-indigo-600 font-medium">
                Time Remaining: {timer}
              </div>
            </div>

            <div className="h-[500px] overflow-y-auto p-4 space-y-4 rounded-xl border border-gray-200 bg-white">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[80%] p-4 rounded-2xl
                    ${msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                    }
                  `}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onInput={sendTypingStatus}
                className="flex-1 p-4 text-lg rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button 
                onClick={sendMessage}
                className="px-8 py-4 font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700"
              >
                Send
              </button>
            </div>

            <button 
              onClick={endChat}
              className="w-full py-3 text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700"
            >
              End Chat
            </button>
          </div>
        )}

        {/* Survey Section */}
        {showSurvey && (
          <div className="space-y-8">
            <h3 className="text-xl font-semibold mb-4">Survey</h3>
            <div id="conversation-id" className="text-center text-gray-600 my-4">
              Conversation ID: {conversationId}
            </div>
            <label className="block text-gray-700 font-medium mb-2">
              How would you rate your conversation on engagement, where 1 is very unengaging and 5 is super engaging?
            </label>
            <select 
              value={engagementRating} 
              onChange={(e) => setEngagementRating(e.target.value)}
              className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="" disabled>
                Select
              </option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>

            <label className="block text-gray-700 font-medium mb-2">
              How would you rate your conversation on friendliness, where 1 is very unfriendly and 5 is super friendly?
            </label>
            <select 
              value={friendlinessRating} 
              onChange={(e) => setFriendlinessRating(e.target.value)}
              className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="" disabled>
                Select
              </option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>

            <label className="block text-gray-700 font-medium mb-2">
              How would you rate the conversation quality overall, where 1 is very bad and 5 is very good?
            </label>
            <select 
              value={overallRating} 
              onChange={(e) => setOverallRating(e.target.value)}
              className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="" disabled>
                Select
              </option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>

            <label className="block text-gray-700 font-medium mb-2">
              Do you think your chat partner is speaking the same language as you?
            </label>
            <select 
              value={sameLanguageRating} 
              onChange={(e) => setSameLanguageRating(e.target.value)}
              className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="" disabled>
                Select
              </option>
              <option value="1">Definitely not the same language</option>
              <option value="2">Likely not the same language</option>
              <option value="3">I cannot tell</option>
              <option value="4">Likely the same language</option>
              <option value="5">Definitely the same language</option>
            </select>

            <label className="block text-gray-700 font-medium mb-2">
              Which language do you think the person you are chatting with speaks?
            </label>
            <select 
              value={guessLanguage} 
              onChange={(e) => setGuessLanguage(e.target.value)}
              className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
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

            <label className="block text-gray-700 font-medium mb-2">
              Why do you think the person you are chatting with speaks this language?
            </label>
            <textarea
              id="nativeSpeakerReason"
              rows="4"
              placeholder="Please share your thoughts here..."
              value={nativeSpeakerReason}
              onChange={(e) => setNativeSpeakerReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
            ></textarea>

            <button 
              onClick={submitSurvey}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              Submit Feedback
            </button>
          </div>
        )}

        {/* Chat Partner Popup */}
        {showChatPartnerPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
                <p className="text-xl">Looking for a chat partner...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;