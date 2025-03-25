const translations = {
  english: {
    // Header
    title: "Translation Turing Test",
    
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
    
    // Consent Form
    consentTitle: "Research Study Consent Form",
    consentDescription: "Description",
    consentDescriptionText: "You are invited to participate in a research study on the use of LLMs as translators and their effect on engagement and authenticity in conversation. You will be asked to chat anonymously with another user and answer survey questions about your chat experience.",
    consentTimeInvolvement: "Time Involvement",
    consentTimeInvolvementText: "Your participation will take approximately 5-7 minutes.",
    consentRisks: "Risks and Benefits",
    consentRisksText: "The risks associated with this study are none. Study data will be stored securely, in compliance with Stanford University standards, minimizing the risk of confidentiality breach.",
    consentBenefitsText: "The benefits which may reasonably be expected to result from this study are improved understanding of AI-assisted communication and translation. We cannot and do not guarantee or promise that you will receive any benefits from this study.",
    consentPayment: "Payments",
    consentPaymentText: "You will receive $2.75 as payment for your participation.",
    consentRights: "Participant's Rights",
    consentRightsText: "If you have read this form and have decided to participate in this project, please understand your participation is voluntary and you have the right to withdraw your consent or discontinue participation at any time without penalty or loss of benefits to which you are otherwise entitled.",
    consentAlternativeText: "The alternative is not to participate. You have the right to refuse to answer particular questions. The results of this research study may be presented at scientific or professional meetings or published in scientific journals. Your individual privacy will be maintained in all published and written data resulting from the study.",
    
    // Buttons
    findPartnerButton: "Find Chat Partner",
    continueButton: "Continue to Chat",
    sendButton: "Send",
    endChatButton: "End Chat",
    submitSurveyButton: "Submit Survey",
    
    // Chat Interface
    chatRoomTitle: "Chat Room",
    messagePlaceholder: "Type your message...",
    conversationStarterLabel: "Suggested conversation starter:",
    
    // Waiting Room
    waitingTitle: "Looking for a Chat Partner",
    waitingDescription: "We're working to pair you with a suitable chat partner. Most users are matched within 1-2 minutes. If you're not paired after this time, you may want to try again later when more users are active.",
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
    
    nativeSpeakerQuestion: "7. Do you think you were chatting with a native speaker of the language you chose?",
    nativeSpeakerReasonQuestion: "8. Why did you believe your chat was a {0} speaker?",
    nativeOption: "native",
    nonNativeOption: "non-native",
    
    // Messages
    surveySubmittedMessage: "Thank you for your feedback! You will be redirected to the start page.",
    fillAllFieldsMessage: "Please answer all the survey questions before submitting.",
    connectionLostMessage: "Connection to the server has been lost. Your survey cannot be submitted.",
    noPartnerMessage: "Could not find a chat partner. Try again later!",
    fillPresurveyMessage: "Please fill in all fields before finding a chat partner"
  },
  
  spanish: {
    // Header
    title: "Prueba de Turing de Traducción",
    
    // Language Selection
    selectLanguageTitle: "Seleccione su Idioma",
    selectLanguageSubtitle: "Elija su idioma nativo/más fluido para el chat",
    selectLanguagePrompt: "Seleccionar Idioma",
    
    // Pre-survey Questions
    llmComparisonQuestion: "¿Cómo se compara la traducción LLM con los traductores humanos?",
    llmComparisonOptions: {
      "1": "Mucho peor",
      "2": "Ligeramente peor",
      "3": "Aproximadamente igual",
      "4": "Ligeramente mejor",
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
    
    translationeseQuestion: "¿Qué tan efectivos cree que son los LLM para evitar el problema de \"translationese\" (producir traducciones que suenan poco naturales o mecánicas)?",
    translationeseOptions: {
      "1": "Muy ineficaz",
      "2": "Algo ineficaz",
      "3": "Neutral",
      "4": "Algo eficaz",
      "5": "Muy eficaz"
    },
    
    // Consent Form
    consentTitle: "Formulario de Consentimiento del Estudio de Investigación",
    consentDescription: "Descripción",
    consentDescriptionText: "Se le invita a participar en un estudio de investigación sobre el uso de LLMs como traductores y su efecto en el compromiso y la autenticidad en la conversación. Se le pedirá que chatee de forma anónima con otro usuario y responda preguntas de encuesta sobre su experiencia en el chat.",
    consentTimeInvolvement: "Tiempo de Participación",
    consentTimeInvolvementText: "Su participación tomará aproximadamente 5-7 minutos.",
    consentRisks: "Riesgos y Beneficios",
    consentRisksText: "Los riesgos asociados con este estudio son nulos. Los datos del estudio se almacenarán de forma segura, cumpliendo con los estándares de la Universidad de Stanford, minimizando el riesgo de violación de confidencialidad.",
    consentBenefitsText: "Los beneficios que razonablemente se pueden esperar de este estudio son una mejor comprensión de la comunicación y traducción asistida por IA. No podemos y no garantizamos ni prometemos que recibirá algún beneficio de este estudio.",
    consentPayment: "Pagos",
    consentPaymentText: "Recibirá $2.75 como pago por su participación.",
    consentRights: "Derechos del Participante",
    consentRightsText: "Si ha leído este formulario y ha decidido participar en este proyecto, por favor entienda que su participación es voluntaria y tiene el derecho de retirar su consentimiento o descontinuar la participación en cualquier momento sin penalización o pérdida de beneficios a los que tiene derecho.",
    consentAlternativeText: "La alternativa es no participar. Tiene el derecho de negarse a responder preguntas específicas. Los resultados de este estudio de investigación pueden ser presentados en reuniones científicas o profesionales o publicados en revistas científicas. Su privacidad individual se mantendrá en todos los datos publicados y escritos resultantes del estudio.",
    
    // Buttons
    findPartnerButton: "Encontrar Compañero de Chat",
    continueButton: "Continuar al Chat",
    sendButton: "Enviar",
    endChatButton: "Terminar Chat",
    submitSurveyButton: "Enviar Encuesta",
    
    // Chat Interface
    chatRoomTitle: "Sala de Chat",
    messagePlaceholder: "Escribe tu mensaje...",
    conversationStarterLabel: "Sugerencia para iniciar la conversación:",
    
    // Waiting Room
    waitingTitle: "Buscando Compañero de Chat",
    waitingDescription: "Estamos trabajando para emparejarte con un compañero de chat adecuado. La mayoría de los usuarios son emparejados en 1-2 minutos. Si no eres emparejado después de este tiempo, puedes intentarlo más tarde cuando haya más usuarios activos.",
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
    
    nativeSpeakerQuestion: "7. ¿Crees que estabas chateando con un hablante nativo del idioma que elegiste?",
    nativeSpeakerReasonQuestion: "8. ¿Por qué creíste que tu chat era un hablante {0}?",
    nativeOption: "nativo",
    nonNativeOption: "no nativo",
    
    // Messages
    surveySubmittedMessage: "¡Gracias por tus comentarios! Serás redirigido a la página de inicio.",
    fillAllFieldsMessage: "Por favor responde todas las preguntas de la encuesta antes de enviar.",
    connectionLostMessage: "Se ha perdido la conexión con el servidor. Tu encuesta no puede ser enviada.",
    noPartnerMessage: "No se pudo encontrar un compañero de chat. ¡Inténtalo más tarde!",
    fillPresurveyMessage: "Por favor completa todos los campos antes de buscar un compañero de chat"
  }
};

export default translations; 