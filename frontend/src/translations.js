const translations = {
  english: {
    /* ───────── Header ───────── */
    title: "Welcome to Chat Room!",
    researchStudyInfo:
      "You are invited to participate in a research study on interpersonal communication. You will be asked to chat anonymously with another user for 3 minutes and answer survey questions about your chat experience. You will be asked to chat about the following prompt: If you could change anything about the way you were raised, what would it be?",

    /* ───────── System Messages ───────── */
    thankYouMessage:
      "Thank you for your feedback! You will be redirected to the completion page.",
    noPartnerFoundMessage:
      "Sorry we could not pair you at this time. Please try again later",
    connectionLostMessage:
      "Connection to the server has been lost. Your survey cannot be submitted.",
    fillAllFieldsMessage:
      "Please answer all the survey questions before submitting.",
    serverErrorMessage: "Connection error. Please try again.",
    timeoutMessage:
      "Sorry, we could not pair you at this time. You will be redirected to return and please try again later.",
    partnerDisconnectedMessage:
      "Your partner disconnected. Please complete your survey before closing.",

    /* ───────── Buttons ───────── */
    findPartnerButton: "Find Chat Partner",
    sendButton: "Send",
    endChatButton: "End Chat",
    submitSurveyButton: "Submit Survey",

    /* ───────── Chat Interface ───────── */
    chatRoomTitle: "Chat Room",
    messagePlaceholder: "Type your message...",
    conversationStarterLabel: "Suggested conversation starter:",

    /* ───────── Waiting Room ───────── */
    waitingTitle: "Looking for a Chat Partner",
    waitingDescription:
      "We are looking for a chat partner for you. This may take ten seconds. If we cannot find a partner, you will be requested to return and try again later.",
    waitTimeLabel: "Wait time:",

    /* ───────── Post‑survey ───────── */
    threePointScale: {
      "1": "Not at all",
      "2": "",
      "3": "",
      "4": "Somewhat",
      "5": "",
      "6": "",
      "7": "A great deal"
    },
    
    threePointEasyScale: {
      "1": "Not at all easy",
      "2": "",
      "3": "",
      "4": "Moderately easy",
      "5": "",
      "6": "",
      "7": "Extremely easy"
    },
    
    // Questions
    comprehensionQuestion: "Q1. How easy was it to understand the messages you received?",
    comprehensionOptions: "threePointEasyScale",
    
    closenessQuestion: "Q2. How close do you feel toward your chat partner?",
    closenessOptions: "threePointScale",
    
    enjoymentQuestion: "Q3. How much did you enjoy the conversation?",
    enjoymentOptions: "threePointScale",
    
    engagementQuestion: "Q4. How engaging was the conversation?",
    engagementOptions: "threePointScale",
    
    listeningQuestion: "Q5. How much do you agree with the following statement: The other person seemed to really listen to me.",
    interestQuestion: "Q6. How much do you agree with the following statement: The other person seemed interested in what I was thinking and feeling.",
    commongroundQuestion: 'Q7. How much do you agree with the following statement: The other person was "on the same wavelength" with me.',
    responsivenessQuestion: "Q8. How much do you agree with the following statement: The other person was responsive to my questions and answers.",
    perceptionOptions: "threePointScale",
    
    futureInteractionQuestion: "Q9. How willing would you be to converse with your chat partner again in the future?",
    futureInteractionOptions: "threePointScale",

    reasoningQuestion: "Q10. Please explain your reasoning:",
    reasoningPlaceholder: "Please explain your reasoning...",

    partnerIdentityQuestion: "Q11. Who do you think you were chatting with?",
    partnerIdentityOptions: {
      ai: "AI",
      native: "Native speaker of your language",
      nonNative: "Non‑native speaker of your language"
    },

    identityReasoningQuestion: "Q12. Please explain your reasoning:",
    identityReasoningPlaceholder: "Please explain your reasoning...",

    /* ───────── Messages ───────── */
    surveySubmittedMessage:
      "Thank you for your feedback! You will be redirected to the completion page.",
    fillPresurveyMessage:
      "Please fill in all fields before finding a chat partner",

    /* ───────── Conversation Starter ───────── */
    conversationStarter:
      "If you could change anything about the way you were raised, what would it be?"
  },

  /* ===================================================================== */

  spanish: {
    /* Header */
    title: "¡Bienvenido al Chat Room!",
    researchStudyInfo:
      "Estás invitado a participar en un estudio de investigación sobre comunicación interpersonal. Se te pedirá que chatees de forma anónima con otro usuario durante 3 minutos y respondas preguntas sobre tu experiencia. Se te pedirá que hables sobre el siguiente tema: Si pudieras cambiar algo sobre la forma en que te criaron, ¿qué sería?",

    /* System Messages */
    thankYouMessage:
      "¡Gracias por tus comentarios! Serás redirigido a la página de finalización.",
    noPartnerFoundMessage:
      "Lo sentimos, no pudimos encontrar un compañero en este momento. Por favor, inténtalo de nuevo más tarde",
    connectionLostMessage:
      "Se perdió la conexión con el servidor. Tu encuesta no puede enviarse.",
    fillAllFieldsMessage:
      "Por favor responde todas las preguntas de la encuesta antes de enviar.",
    serverErrorMessage: "Error de conexión. Por favor, inténtalo de nuevo.",
    timeoutMessage:
      "Lo sentimos, no pudimos encontrar un compañero en este momento. Serás redirigido y podrás intentarlo más tarde.",
    partnerDisconnectedMessage:
      "Tu compañero se desconectó. Por favor, completa tu encuesta antes de cerrar.",

    /* Language Selection */
    selectLanguageTitle: "Selecciona tu Idioma",
    selectLanguageSubtitle:
      "Elige tu idioma nativo o más fluido para el chat",
    selectLanguagePrompt: "Seleccionar Idioma",

    /* Pre‑survey */
    llmComparisonQuestion: "¿Cómo se compara la traducción con LLM con la de traductores humanos?",
    llmComparisonOptions: {
      "1": "Mucho peor",
      "2": "Algo peor",
      "3": "Más o menos igual",
      "4": "Algo mejor",
      "5": "Mucho mejor"
    },

    seamlessConversationQuestion:
      "¿En qué medida estás de acuerdo con la siguiente afirmación? Las traducciones con LLM pueden facilitar conversaciones fluidas entre personas que hablan distintos idiomas.",
    seamlessConversationOptions: {
      "1": "Totalmente en desacuerdo",
      "2": "En desacuerdo",
      "3": "Neutral",
      "4": "De acuerdo",
      "5": "Totalmente de acuerdo"
    },

    translationeseQuestion:
      '¿Qué tan efectivos crees que son los LLM para evitar el problema del "traduccionés" (traducciones que suenan antinaturales o mecánicas)?',
    translationeseOptions: {
      "1": "Nada efectivos",
      "2": "Poco efectivos",
      "3": "Neutral",
      "4": "Algo efectivos",
      "5": "Muy efectivos"
    },

    /* Buttons */
    findPartnerButton: "Encontrar Compañero",
    sendButton: "Enviar",
    endChatButton: "Terminar Chat",
    submitSurveyButton: "Enviar Encuesta",

    /* Chat Interface */
    chatRoomTitle: "Sala de Chat",
    messagePlaceholder: "Escribe tu mensaje...",
    conversationStarterLabel: "Sugerencia de inicio:",

    /* Waiting Room */
    waitingTitle: "Buscando Compañero",
    waitingDescription:
      "Estamos buscando un compañero de chat para ti. Esto puede tardar unos segundos. Si no encontramos uno, podrás intentarlo de nuevo más tarde.",
    waitTimeLabel: "Tiempo de espera:",

    /* Post‑survey */
    postSurveyTitle: "Encuesta Posterior",
    threePointScale: {
      "1": "En absoluto",
      "2": "",
      "3": "",
      "4": "Algo",
      "5": "",
      "6": "",
      "7": "Muchísimo"
    },
    
    threePointEasyScale: {
      "1": "Nada fácil",
      "2": "",
      "3": "",
      "4": "Moderadamente fácil",
      "5": "",
      "6": "",
      "7": "Extremadamente fácil"
    },
    
    comprehensionQuestion: "P1. ¿Qué tan fácil fue entender los mensajes que recibiste?",
    comprehensionOptions: "threePointEasyScale",
    
    closenessQuestion: "P2. ¿Qué tan cercano te sientes a tu compañero de chat?",
    closenessOptions: "threePointScale",
    
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

    engagementQuestion: "P4. ¿Qué tan interesante fue la conversación?",
    engagementOptions: {
      "1": "Nada",
      "2": "Un poco",
      "3": "Moderadamente",
      "4": "Algo",
      "5": "Bastante",
      "6": "Mucho",
      "7": "Muchísimo"
    },

    listeningQuestion:
      "P5. El otro parecía realmente escucharme.",
    interestQuestion:
      "P6. El otro parecía interesado en lo que pienso y siento.",
    commongroundQuestion:
      'P7. El otro estaba "en la misma sintonía" que yo.',
    responsivenessQuestion:
      "P8. El otro respondió a mis preguntas/respuestas.",
    perceptionOptions: {
      "1": "Nada cierto",
      "2": "Ligeramente cierto",
      "3": "Algo cierto",
      "4": "Moderadamente cierto",
      "5": "Bastante cierto",
      "6": "Muy cierto",
      "7": "Extremadamente cierto"
    },

    futureInteractionQuestion:
      "P9. ¿Con qué disposición conversarías de nuevo con tu compañero?",
    futureInteractionOptions: {
      "1": "Nada",
      "2": "Un poco",
      "3": "Moderadamente",
      "4": "Algo",
      "5": "Bastante",
      "6": "Mucho",
      "7": "Muchísimo"
    },

    reasoningQuestion: "P10. Explica tu razonamiento:",
    reasoningPlaceholder: "Escribe aquí tu explicación...",

    partnerIdentityQuestion: "P11. ¿Con quién crees que chateabas?",
    partnerIdentityOptions: {
      ai: "IA",
      native: "Hablante nativo",
      nonNative: "Hablante no nativo"
    },

    identityReasoningQuestion: "P12. Explica tu razonamiento:",
    identityReasoningPlaceholder: "Escribe aquí tu explicación...",

    /* Messages */
    surveySubmittedMessage:
      "¡Gracias por tus comentarios! Serás redirigido a la página de finalización.",
    fillPresurveyMessage:
      "Por favor completa todos los campos antes de buscar un compañero",

    /* Conversation Starter */
    conversationStarter:
      "Si pudieras cambiar algo sobre la forma en que te criaron, ¿qué sería?"
  },

  /* ===================================================================== */

  chinese: {
    /* Header */
    title: "欢迎来到聊天室！",
    researchStudyInfo:
      "您受邀参加一项关于人际沟通的研究。您将匿名与另一位用户聊天 3 分钟，并回答关于聊天体验的调查。聊天主题：如果你可以改变你的成长方式，你会改变什么？",

    /* System Messages */
    thankYouMessage: "感谢您的反馈！您将被重定向到完成页面。",
    noPartnerFoundMessage: "抱歉，目前无法为您匹配伙伴，请稍后再试。",
    connectionLostMessage: "与服务器的连接已断开，无法提交调查。",
    fillAllFieldsMessage: "提交前请回答所有调查问题。",
    serverErrorMessage: "连接错误，请重试。",
    timeoutMessage:
      "抱歉，目前无法为您匹配伙伴。系统将引导您退出，请稍后再试。",
    partnerDisconnectedMessage:
      "您的伙伴已断开连接，请完成调查后再关闭页面。",

    /* Language Selection */
    selectLanguageTitle: "选择您的语言",
    selectLanguageSubtitle: "请选择您最流利的语言进行聊天",
    selectLanguagePrompt: "选择语言",

    /* Pre‑survey */
    llmComparisonQuestion: "LLM 翻译与人工译者相比如何？",
    llmComparisonOptions: {
      "1": "差很多",
      "2": "稍差",
      "3": "差不多",
      "4": "稍好",
      "5": "好很多"
    },

    seamlessConversationQuestion:
      "您在多大程度上同意以下说法：LLM 翻译可以让不同语言的对话顺畅进行？",
    seamlessConversationOptions: {
      "1": "强烈不同意",
      "2": "不同意",
      "3": "中立",
      "4": "同意",
      "5": "强烈同意"
    },

    translationeseQuestion:
      '您认为 LLM 在避免"翻译腔"（不自然或机器味译文）方面有多有效？',
    translationeseOptions: {
      "1": "非常低效",
      "2": "有点低效",
      "3": "一般",
      "4": "较有效",
      "5": "非常有效"
    },

    /* Buttons */
    findPartnerButton: "寻找聊天伙伴",
    sendButton: "发送",
    endChatButton: "结束聊天",
    submitSurveyButton: "提交调查",

    /* Chat Interface */
    chatRoomTitle: "聊天室",
    messagePlaceholder: "输入消息...",
    conversationStarterLabel: "对话开场白：",

    /* Waiting Room */
    waitingTitle: "正在匹配聊天伙伴",
    waitingDescription:
      "我们正在为您寻找聊天伙伴，可能需要十秒左右。如暂未匹配成功，系统将提示您稍后重试。",
    waitTimeLabel: "等待时间：",

    /* Post‑survey */
    postSurveyTitle: "调查问卷",
    threePointScale: {
      "1": "完全不",
      "2": "",
      "3": "",
      "4": "有些",
      "5": "",
      "6": "",
      "7": "非常"
    },
    
    threePointEasyScale: {
      "1": "完全不容易",
      "2": "",
      "3": "",
      "4": "比较容易",
      "5": "",
      "6": "",
      "7": "非常容易"
    },
    
    comprehensionQuestion: "Q1. 您觉得理解收到的消息有多容易？",
    comprehensionOptions: "threePointEasyScale",
    
    closenessQuestion: "Q2. 您觉得与聊天伙伴有多亲近？",
    closenessOptions: "threePointScale",

    enjoymentQuestion: "Q3. 您对本次对话的享受程度如何？",
    enjoymentOptions: {
      "1": "毫无",
      "2": "少许",
      "3": "中等",
      "4": "较多",
      "5": "相当多",
      "6": "很多",
      "7": "非常多"
    },

    engagementQuestion: "Q4. 本次对话的吸引力如何？",
    engagementOptions: {
      "1": "毫无",
      "2": "少许",
      "3": "中等",
      "4": "较多",
      "5": "相当多",
      "6": "很多",
      "7": "非常多"
    },

    listeningQuestion:
      "Q5. 对方似乎真的在倾听我。",
    interestQuestion:
      "Q6. 对方似乎对我的想法和感受感兴趣。",
    commongroundQuestion:
      'Q7. 对方与我"志同道合"。',
    responsivenessQuestion:
      "Q8. 对方对我的问题/回答有回应。",
    perceptionOptions: {
      "1": "毫不同意",
      "2": "稍不同意",
      "3": "有点同意",
      "4": "中等同意",
      "5": "相当同意",
      "6": "非常同意",
      "7": "完全同意"
    },

    futureInteractionQuestion:
      "Q9. 您今后与该伙伴再次交流的意愿如何？",
    futureInteractionOptions: {
      "1": "毫无",
      "2": "少许",
      "3": "中等",
      "4": "较多",
      "5": "相当多",
      "6": "很多",
      "7": "非常多"
    },

    reasoningQuestion: "Q10. 请说明您的理由：",
    reasoningPlaceholder: "请输入您的理由...",

    partnerIdentityQuestion: "Q11. 您认为您刚才在与谁聊天？",
    partnerIdentityOptions: {
      ai: "人工智能",
      native: "该语言母语者",
      nonNative: "该语言非母语者"
    },

    identityReasoningQuestion: "Q12. 请说明您的理由：",
    identityReasoningPlaceholder: "请输入您的理由...",

    /* Messages */
    surveySubmittedMessage:
      "感谢您的反馈！您将被重定向到完成页面。",
    fillPresurveyMessage: "请在开始前完成所有问题",

    /* Conversation Starter */
    conversationStarter: "如果你可以改变你的成长方式，你会改变什么？"
  }
};

export default translations;