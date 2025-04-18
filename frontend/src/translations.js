const translations = {
  english: {
    // Header
    title: "Welcome to Chat Room!",
    researchStudyInfo: "You are invited to participate in a research study on interpersonal communication. You will be asked to chat anonymously with another user for 3 minutes and answer survey questions about your chat experience. You will be asked to chat about the following prompt: If you could change anything about the way you were raised, what would it be?",
    
    // System Messages
    thankYouMessage: "Thank you for your feedback! You will be redirected to the completion page.",
    noPartnerFoundMessage: "Sorry we could not pair you at this time. Please try again later",
    connectionLostMessage: "Connection to the server has been lost. Your survey cannot be submitted.",
    fillAllFieldsMessage: "Please answer all the survey questions before submitting.",
    serverErrorMessage: "Connection error. Please try again.",
    timeoutMessage: "Sorry, we could not pair you at this time. You will be redirected to return and please try again later.",
    partnerDisconnectedMessage: "Your partner disconnected. Please complete your survey before closing.",
    
    // Language Selection
    selectLanguageTitle: "Select Your Language",
    selectLanguageSubtitle: "Choose your native/most fluent language for the chat",
    selectLanguagePrompt: "Select Language",
    
    // Pre-survey Questions
    llmComparisonQuestion: "How does LLM translation compare to human translators?",
    llmComparisonOptions: {
      "1": "Much worse",
      "2": "Slightly worse",
      "3": "About same",
      "4": "Slightly better",
      "5": "Much better"
    },
    
    seamlessConversationQuestion: "How much do you agree with the following statement: LLM translations can facilitate seamless conversations between people speaking different languages?",
    seamlessConversationOptions: {
      "1": "Strongly disagree",
      "2": "Disagree",
      "3": "Neutral",
      "4": "Agree",
      "5": "Strongly agree"
    },
    
    translationeseQuestion: "How effective do you think LLMs are at avoiding the \"translationese\" problem (producing translations that sound unnatural or machine-like)?",
    translationeseOptions: {
      "1": "Very ineffective",
      "2": "Somewhat ineffective",
      "3": "Neutral",
      "4": "Somewhat effective",
      "5": "Very effective"
    },
    
    // Buttons
    findPartnerButton: "Find Chat Partner",
    sendButton: "Send",
    endChatButton: "End Chat",
    submitSurveyButton: "Submit Survey",
    
    // Chat Interface
    chatRoomTitle: "Chat Room",
    messagePlaceholder: "Type your message...",
    conversationStarterLabel: "Suggested conversation starter:",
    
    // Waiting Room
    waitingTitle: "Looking for a Chat Partner",
    waitingDescription: "We are looking for a chat partner for you. This may take ten seconds. If we cannot find a partner, you will be requested to return and try again later.",
    waitTimeLabel: "Wait time:",
    
    // Post-Survey
    postSurveyTitle: "Post-Survey",
    comprehensionQuestion: "Q1. How easy was it to understand each message you received?",
    comprehensionOptions: {
      "1": "Very difficult",
      "2": "Difficult",
      "3": "Neutral",
      "4": "Easy",
      "5": "Very easy"
    },
    
    closenessQuestion: "Q2. How close do you feel toward your chat partner?",
    closenessOptions: {
      "1": "Not at all",
      "2": "A little",
      "3": "Moderately",
      "4": "Somewhat",
      "5": "Quite a bit",
      "6": "A lot",
      "7": "A great deal"
    },
    
    enjoymentQuestion: "Q3. How much did you enjoy the conversation?",
    enjoymentOptions: {
      "1": "Not at all",
      "2": "A little",
      "3": "Moderately",
      "4": "Somewhat",
      "5": "Quite a bit",
      "6": "A lot",
      "7": "A great deal"
    },
    
    engagementQuestion: "Q4. How engaging was the conversation?",
    engagementOptions: {
      "1": "Not at all",
      "2": "A little",
      "3": "Moderately",
      "4": "Somewhat",
      "5": "Quite a bit",
      "6": "A lot",
      "7": "A great deal"
    },
    
    listeningQuestion: "Q5. How much do you agree with the following statement: The other seemed to really listen to me.",
    interestQuestion: "Q6. How much do you agree with the following statement: The other seemed interested in what I am thinking and feeling.",
    commongroundQuestion: "Q7. How much do you agree with the following statement: The other was \"on the same wavelength\" with me.",
    responsivenessQuestion: "Q8. How much do you agree with the following statement: The other was responsive to my questions/answers.",
    perceptionOptions: {
      "1": "Not at all true",
      "2": "Slightly true",
      "3": "Somewhat true",
      "4": "Moderately true",
      "5": "Quite true",
      "6": "Very true",
      "7": "Extremely true"
    },
    
    futureInteractionQuestion: "Q9. How much are you willing to converse with your chat partner in the future?",
    futureInteractionOptions: {
      "1": "Not at all",
      "2": "A little",
      "3": "Moderately",
      "4": "Somewhat",
      "5": "Quite a bit",
      "6": "A lot",
      "7": "A great deal"
    },
    
    reasoningQuestion: "Q10. Please explain your reasoning:",
    reasoningPlaceholder: "Please explain your reasoning...",
    
    partnerIdentityQuestion: "Q11. Who do you think you were chatting with?",
    partnerIdentityOptions: {
      "ai": "AI",
      "native": "Native speaker of your language",
      "nonNative": "Non-native speaker of your language"
    },
    
    identityReasoningQuestion: "Q12. Please explain your reasoning:",
    identityReasoningPlaceholder: "Please explain your reasoning...",
    
    // Messages
    surveySubmittedMessage: "Thank you for your feedback! You were in fact chatting with a real person. You will be redirected to the completion page.",
    fillPresurveyMessage: "Please fill in all fields before finding a chat partner",
    conversationStarters: [
      "What would constitute a \"perfect\" day for you?",
      "What do you value most in a friendship?",
      "How do you feel about your relationship with your mother?"
    ]
  },
  
  spanish: {
    // Header
    title: "Bienvenido al Chat Room!",
    researchStudyInfo: "Estás invitado a participar en un estudio de investigación sobre comunicación interpersonal. Se te pedirá que chatees de forma anónima con otro usuario durante 3 minutos y respondas preguntas de la encuesta sobre tu experiencia de chat. Se te puede preguntar uno de los siguientes temas (tomados del Paradigma de Amigos Rápidos):\n\n1) ¿Qué constituiría un día \"perfecto\" para ti?\n\n\n2) ¿Qué valoras más en una amistad?\n\n\n3) ¿Cómo te sientes acerca de tu relación con tu madre?",
    
    // System Messages
    thankYouMessage: "¡Gracias por tus comentarios! Estabas chatando con una persona real. Serás redirigido a la página de inicio.",
    noPartnerFoundMessage: "Lo sentimos, no pudimos encontrar un compañero en este momento. Por favor, inténtalo de nuevo más tarde",
    connectionLostMessage: "Se ha perdido la conexión con el servidor. Tu encuesta no puede ser enviada.",
    fillAllFieldsMessage: "Por favor responde todas las preguntas de la encuesta antes de enviar.",
    serverErrorMessage: "Error de conexión. Por favor, inténtalo de nuevo.",
    timeoutMessage: "Lo sentimos, no pudimos encontrar un compañero en este momento. Serás redirigido para volver y por favor inténtalo de nuevo más tarde.",
    partnerDisconnectedMessage: "Tu compañero se desconectó. Por favor, completa tu encuesta antes de cerrar.",
    
    // Language Selection
    selectLanguageTitle: "Seleccione su Idioma",
    selectLanguageSubtitle: "Elija su idioma nativo/más fluido para el chat",
    selectLanguagePrompt: "Seleccionar Idioma",
    
    // Pre-survey Questions
    llmComparisonQuestion: "¿Cómo se compara la traducción de LLM con los traductores humanos?",
    llmComparisonOptions: {
      "1": "Mucho peor",
      "2": "Algo peor",
      "3": "Igual",
      "4": "Algo mejor",
      "5": "Mucho mejor"
    },
    
    seamlessConversationQuestion: "¿Qué tan de acuerdo está con la siguiente afirmación: las traducciones LLM pueden facilitar conversaciones fluidas entre personas que hablan diferentes idiomas?",
    seamlessConversationOptions: {
      "1": "Totalmente en desacuerdo",
      "2": "En desacuerdo",
      "3": "Neutral",
      "4": "De acuerdo",
      "5": "Totalmente de acuerdo"
    },
    
    translationeseQuestion: "¿Qué tan efectivos cree que son los LLM para evitar el problema de \"traducción\" (producir traducciones que suenan antinaturales o mecánicas)?",
    translationeseOptions: {
      "1": "Muy inefectivos",
      "2": "Algo inefectivos",
      "3": "Neutral",
      "4": "Algo efectivos",
      "5": "Muy efectivos"
    },
    
    // Buttons
    findPartnerButton: "Encontrar Compañero de Chat",
    sendButton: "Enviar",
    endChatButton: "Terminar Chat",
    submitSurveyButton: "Enviar Encuesta",
    
    // Chat Interface
    chatRoomTitle: "Sala de Chat",
    messagePlaceholder: "Escribe tu mensaje...",
    conversationStarterLabel: "Sugerencia para iniciar la conversación:",
    
    // Waiting Room
    waitingTitle: "Buscando Compañero de Chat",
    waitingDescription: "Estamos buscando un compañero de chat para ti. Esto puede tardar diez segundos. Si no encontramos un compañero, serás solicitado a regresar y volver a intentarlo más tarde.",
    waitTimeLabel: "Tiempo de espera:",
    
    // Post-Survey
    postSurveyTitle: "Encuesta Posterior",
    comprehensionQuestion: "P1. ¿Qué tan fácil fue entender cada mensaje que recibiste?",
    comprehensionOptions: {
      "1": "Muy difícil",
      "2": "Difícil",
      "3": "Neutral",
      "4": "Fácil",
      "5": "Muy fácil"
    },
    
    closenessQuestion: "P2. ¿Qué tan cercano te sientes con tu compañero de chat?",
    closenessOptions: {
      "1": "Nada",
      "2": "Un poco",
      "3": "Moderadamente",
      "4": "Algo",
      "5": "Bastante",
      "6": "Mucho",
      "7": "Muchísimo"
    },
    
    enjoymentQuestion: "P3. ¿Cuánto disfrutaste la conversación?",
    enjoymentOptions: {
      "1": "Nada",
      "2": "Un poco",
      "3": "Moderadamente",
      "4": "Algo",
      "5": "Bastante",
      "6": "Mucho",
      "7": "Muchísimo"
    },
    
    engagementQuestion: "P4. ¿Qué tan atractiva fue la conversación?",
    engagementOptions: {
      "1": "Nada",
      "2": "Un poco",
      "3": "Moderadamente",
      "4": "Algo",
      "5": "Bastante",
      "6": "Mucho",
      "7": "Muchísimo"
    },
    
    listeningQuestion: "P5. Qué tan de acuerdo estás con la siguiente afirmación: El otro parecía realmente escucharme.",
    interestQuestion: "P6. Qué tan de acuerdo estás con la siguiente afirmación: El otro parecía interesado en lo que pienso y siento.",
    commongroundQuestion: "P7. Qué tan de acuerdo estás con la siguiente afirmación: El otro estaba \"en la misma sintonía\" que yo.",
    responsivenessQuestion: "P8. Qué tan de acuerdo estás con la siguiente afirmación: El otro respondió a mis preguntas/respuestas.",
    perceptionOptions: {
      "1": "Nada cierto",
      "2": "Ligeramente cierto",
      "3": "Algo cierto",
      "4": "Moderadamente cierto",
      "5": "Bastante cierto",
      "6": "Muy cierto",
      "7": "Extremadamente cierto"
    },
    
    futureInteractionQuestion: "P9. ¿Cuánto estás dispuesto a conversar con tu compañero de chat en el futuro?",
    futureInteractionOptions: {
      "1": "Nada",
      "2": "Un poco",
      "3": "Moderadamente",
      "4": "Algo",
      "5": "Bastante",
      "6": "Mucho",
      "7": "Muchísimo"
    },
    
    reasoningQuestion: "P10. Por favor explica tu razonamiento:",
    reasoningPlaceholder: "Por favor explica tu razonamiento...",
    
    partnerIdentityQuestion: "P11. ¿Con quién crees que estabas chateando?",
    partnerIdentityOptions: {
      "ai": "IA",
      "native": "Hablante nativo de tu idioma",
      "nonNative": "Hablante no nativo de tu idioma"
    },
    
    identityReasoningQuestion: "P12. Por favor explica tu razonamiento:",
    identityReasoningPlaceholder: "Por favor explica tu razonamiento...",
    
    // Messages
    surveySubmittedMessage: "¡Gracias por tus comentarios! Serás redirigido a la página de completación.",
    fillPresurveyMessage: "Por favor completa todos los campos antes de buscar un compañero de chat",
    conversationStarters: [
      "¿Qué constituiría un día \"perfecto\" para ti?",
      "¿Qué es lo que más valoras en una amistad?",
      "¿Cómo te sientes acerca de tu relación con tu madre?"
    ]
  }
};

export default translations; 