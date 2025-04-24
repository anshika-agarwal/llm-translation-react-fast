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
    timeoutTitle: "Connection Timeout",
    timeoutMessage:
      "Sorry, we could not pair you at this time. Please return the study and try again later.",
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
    postSurveyTitle: "Survey",
    // Questions
    comprehensionQuestion: "Q1. How easy was it to understand the messages you received?",
    comprehensionOptions: {
      "1": "Not at all easy",
      "2": "",
      "3": "",
      "4": "Somewhat easy",
      "5": "",
      "6": "",
      "7": "Extremely easy"
    },
    
    closenessQuestion: "Q2. How close do you feel toward your chat partner?",
    closenessOptions: {
      "1": "Not at all",
      "2": "",
      "3": "",
      "4": "Somewhat",
      "5": "",
      "6": "",
      "7": "A great deal"
    },
    
    enjoymentQuestion: "Q3. How much did you enjoy the conversation?",
    enjoymentOptions: {
      "1": "Not at all",
      "2": "",
      "3": "",
      "4": "Somewhat",
      "5": "",
      "6": "",
      "7": "A great deal"
    },
    
    engagementQuestion: "Q4. How engaging was the conversation?",
    engagementOptions:{
      "1": "Not at all",
      "2": "",
      "3": "",
      "4": "Somewhat",
      "5": "",
      "6": "",
      "7": "A great deal"
    },
    
    listeningQuestion: "Q5. How much do you agree with the following statement: The other person seemed to really listen to me.",
    interestQuestion: "Q6. How much do you agree with the following statement: The other person seemed interested in what I was thinking and feeling.",
    commongroundQuestion: 'Q7. How much do you agree with the following statement: The other person was "on the same wavelength" with me.',
    responsivenessQuestion: "Q8. How much do you agree with the following statement: The other person was responsive to my questions and answers.",
    perceptionOptions: {
      "1": "Strongly disagree",
      "2": "",
      "3": "",
      "4": "Neutral",
      "5": "",
      "6": "",
      "7": "Strongly agree"
    },
    
    futureInteractionQuestion: "Q9. How willing would you be to converse with your chat partner again in the future?",
    futureInteractionOptions: {
      "1": "Not at all",
      "2": "",
      "3": "",
      "4": "Somewhat",
      "5": "",
      "6": "",
      "7": "A great deal"
    },

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
    timeoutTitle: "Connection Timeout",
    timeoutMessage:
      "Lo sentimos, no pudimos encontrar un compañero en este momento. Serás redirigido y podrás intentarlo más tarde.",
    partnerDisconnectedMessage:
      "Tu compañero se desconectó. Por favor, completa tu encuesta antes de cerrar.",

    /* Language Selection */
    selectLanguageTitle: "Selecciona tu Idioma",
    selectLanguageSubtitle:
      "Elige tu idioma nativo o más fluido para el chat",
    selectLanguagePrompt: "Seleccionar Idioma",

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
    postSurveyTitle: "Encuesta",
    comprehensionQuestion:
      "P1. ¿Qué tan fácil fue entender cada mensaje que recibiste?",
    comprehensionOptions: {
      "1": "Muchísimo difícil",
      "2": "",
      "3": "",
      "4": "Moderadamente fácil",
      "5": "",
      "6": "",
      "7": "Muchísimo fácil"
    },

    closenessQuestion: "P2. ¿Qué tan cercano te sientes a tu compañero?",
    closenessOptions: {
      "1": "Nada",
      "2": "",
      "3": "",
      "4": "Moderadamente",
      "5": "",
      "6": "",
      "7": "Muchísimo"
    },

    enjoymentQuestion: "P3. ¿Cuánto disfrutaste la conversación?",
    enjoymentOptions: {
      "1": "Nada",
      "2": "",
      "3": "",
      "4": "Moderadamente",
      "5": "",
      "6": "",
      "7": "Muchísimo"
    },

    engagementQuestion: "P4. ¿Qué tan interesante fue la conversación?",
    engagementOptions: {
      "1": "Nada",
      "2": "",
      "3": "",
      "4": "Moderadamente",
      "5": "",
      "6": "",
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
      "1": "Totalmente en desacuerdo",
      "2": "",
      "3": "",
      "4": "Neutro",
      "5": "",
      "6": "",
      "7": "Totalmente de acuerdo"
    },

    futureInteractionQuestion:
      "P9. ¿Con qué disposición conversarías de nuevo con tu compañero?",
    futureInteractionOptions: {
      "1": "Nada",
      "2": "",
      "3": "",
      "4": "Moderadamente",
      "5": "",
      "6": "",
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
    timeoutTitle: "Connection Timeout",
    timeoutMessage:
      "抱歉，目前无法为您匹配伙伴。系统将引导您退出，请稍后再试。",
    partnerDisconnectedMessage:
      "您的伙伴已断开连接，请完成调查后再关闭页面。",

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
    postSurveyTitle: "后测问卷",
    comprehensionQuestion: "Q1. 您多大程度可以很容易地理解您收到的信息？",
    comprehensionOptions: {
      "1": "毫无",
      "2": "",
      "3": "",
      "4": "中等，中立",
      "5": "",
      "6": "",
      "7": "非常多"
    },

    closenessQuestion: "Q2. 经过这次聊天，您觉得和您的聊天对象有多亲近？",
    closenessOptions: {
      "1": "毫无",
      "2": "",
      "3": "",
      "4": "中等，中立",
      "5": "",
      "6": "",
      "7": "非常多"
    },

    enjoymentQuestion: "Q3. 您多大程度享受了这次聊天？",
    enjoymentOptions: {
      "1": "毫无",
      "2": "",
      "3": "",
      "4": "中等，中立",
      "5": "",
      "6": "",
      "7": "非常多"
    },

    engagementQuestion: "Q4. 你觉得这次对话的参与感怎么样？",
    engagementOptions: {
      "1": "毫无",
      "2": "",
      "3": "",
      "4": "中等，中立",
      "5": "",
      "6": "",
      "7": "非常多"
    },

    listeningQuestion: "Q5. 您多大程度上同意这句话：对方真的在用心倾听我",
    interestQuestion: "Q6. 您多大程度上同意这句话：对方对我的想法和感受感兴趣。",
    commongroundQuestion: "Q7. 您多大程度上同意这句话：对方与我'志同道合'。",
    responsivenessQuestion: "Q8. 您多大程度上同意这句话：对方对我的问题/回答有所回应。",
    perceptionOptions: {
      "1": "非常不同意",
      "2": "",
      "3": "",
      "4": "中立",
      "5": "",
      "6": "",
      "7": "非常同意"
    },

    futureInteractionQuestion:
      "Q9. 您今后有多大程度愿意与对方再次聊天",
    futureInteractionOptions: {
      "1": "毫无",
      "2": "",
      "3": "",
      "4": "中等，中立",
      "5": "",
      "6": "",
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
  },

  dutch: {
    // Header
    title: "Welkom in de Chat Room!",
    researchStudyInfo: "U bent uitgenodigd om deel te nemen aan een onderzoek naar interpersoonlijke communicatie. U wordt gevraagd om 3 minuten anoniem te chatten met een andere gebruiker en vragen over uw chatervaring te beantwoorden. U wordt gevraagd om over het volgende onderwerp te chatten: Als je iets zou kunnen veranderen aan de manier waarop je bent opgevoed, wat zou dat dan zijn?",
    
    // System Messages
    thankYouMessage: "Bedankt voor uw feedback! U wordt doorgestuurd naar de voltooiingspagina.",
    noPartnerFoundMessage: "Sorry, we konden u op dit moment niet koppelen. Probeer het later opnieuw.",
    connectionLostMessage: "De verbinding met de server is verbroken. Uw enquête kan niet worden verzonden.",
    fillAllFieldsMessage: "Beantwoord alle enquêtevragen voordat u verzendt.",
    serverErrorMessage: "Verbindingsfout. Probeer het opnieuw.",
    timeoutTitle: "Connection Timeout",
    timeoutMessage: "Sorry, we konden u op dit moment niet koppelen. U wordt doorgestuurd om het later opnieuw te proberen.",
    partnerDisconnectedMessage: "Uw chatpartner is verbroken. Voltooi uw enquête voordat u sluit.",
    
    // Buttons
    findPartnerButton: "Vind Chat Partner",
    sendButton: "Versturen",
    endChatButton: "Chat Beëindigen",
    submitSurveyButton: "Enquête Verzenden",
    
    // Chat Interface
    chatRoomTitle: "Chat Room",
    messagePlaceholder: "Typ uw bericht...",
    conversationStarterLabel: "Voorgesteld gespreksonderwerp:",
    
    // Waiting Room
    waitingTitle: "Op Zoek Naar Een Chat Partner",
    waitingDescription: "We zoeken een chatpartner voor u. Dit kan tien seconden duren. Als we geen partner kunnen vinden, wordt u gevraagd om terug te keren en het later opnieuw te proberen.",
    waitTimeLabel: "Wachttijd:",
    
    // Post-Survey
    postSurveyTitle: "Nabespreking",
    comprehensionQuestion: "V1. Hoe gemakkelijk was het om elk ontvangen bericht te begrijpen?",
    comprehensionOptions: {
      "1": "Helemaal niet",
      "2": "",
      "3": "",
      "4": "Enigszins",
      "5": "",
      "6": "",
      "7": "Heel veel"
    },
    
    closenessQuestion: "V2. Hoe verbonden voelde u zich met uw chatpartner?",
    closenessOptions: {
      "1": "Helemaal niet",
      "2": "",
      "3": "",
      "4": "Enigszins",
      "5": "",
      "6": "",
      "7": "Heel veel"
    },
    
    enjoymentQuestion: "V3. Hoeveel plezier had u in het gesprek?",
    enjoymentOptions: {
      "1": "Helemaal niet",
      "2": "",
      "3": "",
      "4": "Enigszins",
      "5": "",
      "6": "",
      "7": "Heel veel"
    },
    
    engagementQuestion: "V4. Hoe boeiend was het gesprek?",
    engagementOptions: {
      "1": "Helemaal niet",
      "2": "",
      "3": "",
      "4": "Enigszins",
      "5": "",
      "6": "",
      "7": "Heel veel"
    },
    
    listeningQuestion: "V5. In hoeverre bent u het eens met de volgende uitspraak: De ander leek echt naar mij te luisteren.",
    interestQuestion: "V6. In hoeverre bent u het eens met de volgende uitspraak: De ander leek geïnteresseerd in wat ik denk en voel.",
    commongroundQuestion: "V7. In hoeverre bent u het eens met de volgende uitspraak: De ander 'zat op dezelfde golflengte' als ik.",
    responsivenessQuestion: "V8. In hoeverre bent u het eens met de volgende uitspraak: De ander reageerde op mijn vragen/antwoorden.",
    perceptionOptions: {
      "1": "Helemaal mee oneens",
      "2": "",
      "3": "",
      "4": "Neutraal",
      "5": "",
      "6": "",
      "7": "Helemaal mee eens"
    },
    
    futureInteractionQuestion: "V9. Hoe bereid bent u om in de toekomst opnieuw met uw chatpartner te praten?",
    futureInteractionOptions: {
      "1": "Helemaal niet",
      "2": "",
      "3": "",
      "4": "Enigszins",
      "5": "",
      "6": "",
      "7": "Heel veel"
    },
    
    reasoningQuestion: "V10. Leg uw redenering uit:",
    reasoningPlaceholder: "Leg uw redenering uit...",
    
    partnerIdentityQuestion: "V11. Met wie denkt u dat u aan het chatten was?",
    partnerIdentityOptions: {
      "ai": "AI",
      "native": "Moedertaalspreker van uw taal",
      "nonNative": "Niet-moedertaalspreker van uw taal"
    },
    
    identityReasoningQuestion: "V12. Leg uw redenering uit:",
    identityReasoningPlaceholder: "Leg uw redenering uit...",
    
    // Messages
    surveySubmittedMessage: "Bedankt voor uw feedback! U wordt doorgestuurd naar de voltooiingspagina.",
    conversationStarters: {
      english: [
        "If you could change anything about the way you were raised, what would it be?"
      ],
      spanish: [
        "Si pudieras cambiar algo sobre la forma en que te criaron, ¿qué sería?"
      ],
      chinese: [
        "如果你可以改变你的成长方式，你会改变什么？"
      ],
      dutch: [
        "Als je iets zou kunnen veranderen aan de manier waarop je bent opgevoed, wat zou dat dan zijn?"
      ],
      korean: [
        "당신이 자라온 방식을 바꿀 수 있다면, 무엇을 바꾸고 싶으신가요?"
      ]
    }
  },

  korean: {
    // Header
    title: "채팅방에 오신 것을 환영합니다!",
    researchStudyInfo: "대인 커뮤니케이션 연구에 참여하도록 초대되었습니다. 다른 사용자와 3분 동안 익명으로 채팅하고 채팅 경험에 대한 설문 조사에 응답하도록 요청받을 것입니다. 다음 주제에 대해 채팅하도록 요청받을 것입니다: 당신이 자라온 방식을 바꿀 수 있다면, 무엇을 바꾸고 싶으신가요?",
    
    // System Messages
    thankYouMessage: "피드백 감사합니다! 완료 페이지로 이동합니다.",
    noPartnerFoundMessage: "죄송합니다. 현재 파트너를 찾을 수 없습니다. 나중에 다시 시도해 주세요.",
    connectionLostMessage: "서버와의 연결이 끊어졌습니다. 설문을 제출할 수 없습니다.",
    fillAllFieldsMessage: "제출하기 전에 모든 설문 질문에 답변해 주세요.",
    serverErrorMessage: "연결 오류입니다. 다시 시도해 주세요.",
    timeoutTitle: "Connection Timeout",
    timeoutMessage: "죄송합니다. 현재 파트너를 찾을 수 없습니다. 나중에 다시 시도하도록 안내됩니다.",
    partnerDisconnectedMessage: "채팅 파트너가 연결을 끊었습니다. 닫기 전에 설문을 완료해 주세요.",
    
    // Buttons
    findPartnerButton: "채팅 파트너 찾기",
    sendButton: "보내기",
    endChatButton: "채팅 종료",
    submitSurveyButton: "설문 제출",
    
    // Chat Interface
    chatRoomTitle: "채팅방",
    messagePlaceholder: "메시지를 입력하세요...",
    conversationStarterLabel: "제안된 대화 시작 주제:",
    
    // Waiting Room
    waitingTitle: "채팅 파트너 찾는 중",
    waitingDescription: "채팅 파트너를 찾고 있습니다. 10초 정도 소요될 수 있습니다. 파트너를 찾을 수 없는 경우, 나중에 다시 시도하도록 안내됩니다.",
    waitTimeLabel: "대기 시간:",
    
    // Post-Survey
    postSurveyTitle: "사후 설문",
    comprehensionQuestion: "Q1. 받은 각 메시지를 이해하기 얼마나 쉬웠나요?",
    comprehensionOptions: {
      "1": "전혀그렇지않다",
      "2": "",
      "3": "",
      "4": "보통이다",
      "5": "",
      "6": "",
      "7": "매우 그렇다"
    },
    
    closenessQuestion: "Q2: 채팅 파트너와 얼마나 친화감을 느꼈나요?",
    closenessOptions: {
      "1": "전혀그렇지않다",
      "2": "",
      "3": "",
      "4": "보통이다",
      "5": "",
      "6": "",
      "7": "매우 그렇다"
    },
    
    enjoymentQuestion: "Q3. 대화를 얼마나 즐겼나요?",
    enjoymentOptions: {
      "1": "전혀그렇지않다",
      "2": "",
      "3": "",
      "4": "보통이다",
      "5": "",
      "6": "",
      "7": "매우 그렇다"
    },
    
    engagementQuestion: "Q4. 대화가 얼마나 흥미로웠나요?",
    engagementOptions: {
      "1": "전혀그렇지않다",
      "2": "",
      "3": "",
      "4": "보통이다",
      "5": "",
      "6": "",
      "7": "매우 그렇다"
    },
    
    listeningQuestion: "Q5. 다음 문장에 얼마나 동의하십니까: 상대방은 내 얘기를 신중하게 들었다.",
    interestQuestion: "Q6. 다음 문장에 얼마나 동의하십니까: 상대방은 내가 생각하고 느끼는 것에 관심이 있었다.",
    commongroundQuestion: "Q7. 다음 문장에 얼마나 동의하십니까: 상대방은 나와 생각이 같거나 통하는게 많았다.",
    responsivenessQuestion: "Q8. 다음 문장에 얼마나 동의하십니까: 상대방은 내 질문/답변에 제대로 대응했다.",
    perceptionOptions: {
      "1": "전혀 동의하지 않음",
      "2": "",
      "3": "",
      "4": "중립",
      "5": "",
      "6": "",
      "7": "전적으로 동의함"
    },
    
    futureInteractionQuestion: "Q9. 앞으로 채팅 파트너와 다시 대화할 의향이 얼마나 있습니까?",
    futureInteractionOptions: {
      "1": "전혀그렇지않다",
      "2": "",
      "3": "",
      "4": "보통이다",
      "5": "",
      "6": "",
      "7": "매우 그렇다"
    },
    
    reasoningQuestion: "Q10. 그 이유를 설명해 주세요:",
    reasoningPlaceholder: "이유를 설명해 주세요...",
    
    partnerIdentityQuestion: "Q11. 누구와 채팅했다고 생각하나요?",
    partnerIdentityOptions: {
      "ai": "인공지능",
      "native": "해당 언어의 원어민",
      "nonNative": "해당 언어의 비원어민"
    },
    
    identityReasoningQuestion: "Q12. 그 이유를 설명해 주세요:",
    identityReasoningPlaceholder: "이유를 설명해 주세요...",
    
    // Messages
    surveySubmittedMessage: "피드백 감사합니다! 완료 페이지로 이동합니다.",
    conversationStarters: {
      english: [
        "If you could change anything about the way you were raised, what would it be?"
      ],
      spanish: [
        "Si pudieras cambiar algo sobre la forma en que te criaron, ¿qué sería?"
      ],
      chinese: [
        "如果你可以改变你的成长方式，你会改变什么？"
      ],
      dutch: [
        "Als u iets zou kunnen veranderen aan de manier waarop u bent opgevoed, wat zou dat zijn?"
      ],
      korean: [
        "어렸을 때의 환경이나 자란 방식을 바꿀 수 있다면 무엇을 바꾸고 싶나요?"
      ]
    }
  }
};

export default translations;