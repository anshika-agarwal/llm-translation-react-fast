const translations = {
  english: {
    // Header
    title: "Welcome to Chat Room!",
    researchStudyInfo: "You are invited to participate in a research study on interpersonal communication. You will be asked to chat anonymously with another user for 3 minutes and answer survey questions about your chat experience. You may be asked one of the following prompts (sourced from the Fast Friends Paradigm):\n\n1) What would constitute a \"perfect\" day for you?\n\n\n2) What do you value most in a friendship?\n\n\n3) How do you feel about your relationship with your mother?",
    
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
    engagementQuestion: "1. How would you rate your conversation on engagement?",
    engagementOptions: {
      "1": "Very unengaging",
      "2": "Somewhat unengaging",
      "3": "Neutral",
      "4": "Engaging",
      "5": "Very engaging"
    },
    
    friendlinessQuestion: "2. How would you rate your conversation on friendliness?",
    friendlinessOptions: {
      "1": "Very unfriendly",
      "2": "Somewhat unfriendly",
      "3": "Neutral",
      "4": "Friendly",
      "5": "Very friendly"
    },
    
    overallQuestion: "3. How would you rate the conversation quality overall?",
    overallOptions: {
      "1": "Very bad",
      "2": "Bad",
      "3": "Neutral",
      "4": "Good",
      "5": "Very good"
    },
    
    continueQuestion: "4. Do you want to continue conversing with this individual?",
    yesOption: "Yes",
    noOption: "No",
    
    chatPartnerQuestion: "5. Do you think you were chatting with a real person or AI bot?",
    realPersonOption: "Real person",
    aiBotOption: "AI bot",
    
    reasoningQuestion: "6. Why did you believe your chat was a {0}?",
    reasoningPlaceholder: "Please explain your reasoning...",
    
    nativeSpeakerQuestion: "7. Do you think you were chatting with a native speaker of the same language?",
    nativeSpeakerReasonQuestion: "8. Why did you believe your chat was a {0} speaker?",
    nativeOption: "native",
    nonNativeOption: "non-native",
    
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
    engagementQuestion: "1. ¿Cómo calificaría su conversación en términos de participación?",
    engagementOptions: {
      "1": "Muy poco atractiva",
      "2": "Algo poco atractiva",
      "3": "Neutral",
      "4": "Atractiva",
      "5": "Muy atractiva"
    },
    
    friendlinessQuestion: "2. ¿Cómo calificaría su conversación en términos de amabilidad?",
    friendlinessOptions: {
      "1": "Muy poco amigable",
      "2": "Algo poco amigable",
      "3": "Neutral",
      "4": "Amigable",
      "5": "Muy amigable"
    },
    
    overallQuestion: "3. ¿Cómo calificaría la calidad general de la conversación?",
    overallOptions: {
      "1": "Muy mala",
      "2": "Mala",
      "3": "Neutral",
      "4": "Buena",
      "5": "Muy buena"
    },
    
    continueQuestion: "4. ¿Desea continuar conversando con esta persona?",
    yesOption: "Sí",
    noOption: "No",
    
    chatPartnerQuestion: "5. ¿Cree que estaba chateando con una persona real o un bot de IA?",
    realPersonOption: "Persona real",
    aiBotOption: "Bot de IA",
    
    reasoningQuestion: "6. ¿Por qué creíste que tu chat era {0}?",
    reasoningPlaceholder: "Por favor explica tu razonamiento...",
    
    nativeSpeakerQuestion: "7. ¿Crees que estabas chateando con un hablante nativo del mismo idioma?",
    nativeSpeakerReasonQuestion: "8. ¿Por qué creíste que tu chat era un hablante {0}?",
    nativeOption: "nativo",
    nonNativeOption: "no nativo",
    
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