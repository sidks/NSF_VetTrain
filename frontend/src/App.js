import React, { useState, useEffect, useRef } from 'react';
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'; // import for web speech api hook
// import { useWhisper } from '@chengsokdara/use-whisper'; // import for whisper api react hook
import './App.css';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  // Added all the questions in the state
  // Each question has an ID, question, category, answer, Label, and Reasoning
  const [allQuestions, setAllQuestions] = useState([
    { id: 1, question: 'Tell me about yourself. What are you looking for currently?', category: 'Introduction', answer: '', Label: '', Reasoning: '' },
    { id: 2, question: 'How do you react in a situation where you need to make an immediate decision on a major issue? Can you give me an example where you were involved in such a situation?', category: 'Mental Capability', answer: '', Label: '', Reasoning: ''  },
    { id: 3, question: 'How do you react in a situation where you need to make an immediate decision on a major issue?', category: 'Mental Capability', answer: '', Label: '', Reasoning: '' }, 
    { id: 4, question: 'What is your biggest achievement/accomplishment that you are proud of?', category: 'Knowledge and Skills', answer: '', Label: '', Reasoning: ''  },
    { id: 5, question: 'What are the strengths you think are transferrable from your service in military?', category: 'Knowledge and Skills', answer: '', Label: '', Reasoning: '' },
    { id: 6, question: 'What do you think is an area of improvement for you?', category: 'Knowledge and Skills', answer: '', Label: '', Reasoning: ''  },
    { id: 7, question: 'What would be the most impactful leadership role that you\'ve had that would demonstrate that behavior?', category: 'Leadership', answer: '' , Label: '', Reasoning: '' },
    { id: 8, question: 'How do you define leadership?', category: 'Leadership', answer: '' },
    { id: 9, question: 'What questions would you ask to a candidate when you are selecting someone for your team?', category: 'Communication and Interpersonal Skills', answer: '', Label: '', Reasoning: ''  },
    { id: 10, question: 'How do you handle a conversation with someone with a different opinion than yours?', category: 'Communication and Interpersonal Skills', answer: '' , Label: '', Reasoning: '' },
    { id: 11, question: 'What is the most challenging work or school group that you had to collaborate with, and how did you establish rapport with that group? What actions did you take to gain their confidence?', category: 'Communication and Interpersonal Skills', answer: '' , Label: '', Reasoning: '' },
    { id: 12, question: 'Can you describe a time where you had to deal with a major change in your work process? How did you deal with that change?', category: 'Basic Personality Tendencies', answer: '' , Label: '', Reasoning: '' },
    { id: 13, question: 'Tell me about a time when you, or your team were not meeting an established goal or deadline. What steps did you take to ensure that goal or deadline was met?', category: 'Basic Personality Tendencies', answer: '', Label: '', Reasoning: ''  },
    { id: 14, question: 'When there is a difference of opinion, how do you arbitrate a system?', category: 'Persuasion and Negotiation', answer: '' , Label: '', Reasoning: '' },
    { id: 15, question: 'Can you think of a situation where there was some kind of tension, or conflict between a couple of your team members, and how you negotiated that with them?', category: 'Persuasion and Negotiation', answer: '', Label: '', Reasoning: ''  },
    { id: 16, question: 'What is your focus after graduation?', category: 'Interests and Preferences', answer: '', Label: '', Reasoning: ''  },
    { id: 17, question: 'What role would be of interest to you?', category: 'Interests and Preferences', answer: '', Label: '', Reasoning: ''  },
    { id: 18, question: 'Do you have any questions for us?', category: 'Conclusion', answer: '', Label: '', Reasoning: '' },
    { id: 19, question: 'Why should we hire you?', category: 'Why', answer: '', Label: '', Reasoning: ''  },
  ]);

  // current Session Questions
  const [currentQuestions, setCurrentQuestions] = useState([ ]);
  // to check if the microphone is in listening mode or not
  const [isListening, setIsListening] = useState(false);

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  // API response
  const [currentResponse, setCurrentResponse] = useState({ Label: '', Reasoning: '', Jargon: [] });
  // const [currentCategory, setCurrentCategory] = useState('All Categories');
  const [error, setError] = useState("")
  // functions for the whisper api
  // const {
  //   recording,
  //   speaking,
  //   transcribing,
  //   transcript,
  //   pauseRecording,
  //   startRecording,
  //   stopRecording,
  // } = useWhisper({
  //   apiKey: `${process.env.REACT_APP_OPENAI_API_KEY}`, // YOUR_OPEN_AI_TOKEN
  // })

  // const {transcript, resetTranscript } = useSpeechRecognition();
  const [textAreaValue, setTextAreaValue] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const [lastAppendedTranscript, setLastAppendedTranscript] = useState(''); 
  const textareaRef = useRef(null);
  const [buttonColor, setButtonColor] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';


  const startInterview = () => {
    setShowIntro(false); // Hide the intro and show the main content
     const introQuestions = allQuestions.filter(question => question.category === 'Introduction');
     const conclusionQuestions = allQuestions.filter(question => question.category === 'Conclusion');
     const otherQuestions = allQuestions.filter(question => question.category !== 'Introduction' && question.category !== 'Conclusion');
   
    const shuffledQuestions = otherQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffledQuestions.slice(0, 6);
    
    const newQuestionsOrder = [...introQuestions, ...selectedQuestions, ...conclusionQuestions];
    
    setCurrentQuestions(newQuestionsOrder);
    
    // old sorting logic for the questions  
    // const shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random());
    // const selectedQuestions = shuffledQuestions.slice(0, 6);
    // setCurrentQuestions(selectedQuestions);
    
  };


  // Show the intro page again and Reset the question index to the start
  const startOver = () => {
    setShowIntro(true); 
    setCurrentQuestionIndex(0);
  };

  // next and previous question functions update the current question index
  const goToNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => Math.min(prevIndex + 1, currentQuestions.length - 1));
  };

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  // on recording change state of the button and start or stop the recording
  // const onRecordingButton = () => {
  //   setIsListening(prevState => !prevState);
  //   setButtonColor(!buttonColor);
  // };

  const onRecordingButton = async () => {
    if (!isListening) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      let chunks = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });

        const formData = new FormData();
        formData.append("audio", blob);

        const response = await fetch(`${API_BASE_URL}/transcribe`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        setTextAreaValue(prev => {
          const updated = (prev + " " + data.text).trim();
          updateCurrentAnswer(updated);
          return updated;
        });
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsListening(true);
      setButtonColor(false);

    } else {
      mediaRecorder.stop();
      setIsListening(false);
      setButtonColor(true);
    }
  };

  // once the answer is updated, update the current question answer in the state
  const updateCurrentAnswer = (newAnswer) => {
    setCurrentQuestions(prevQuestions => 
      prevQuestions.map((question, index) => 
        index === currentQuestionIndex ? { ...question, answer: newAnswer } : question
      )
    );
  };

  // useEffect to start and stop the recording based on the isListening state
  // useEffect(() => {
  //   if (isListening) {
  //     startRecording();
  //   } else {
  //     stopRecording(); 
  //   }
  //   return () => {
  //   };
  // }, [isListening]);

  // useEffect(() => {
  //   // Update both the textAreaValue and the current question's answer
  //   setTextAreaValue(prevValue => {
  //     const newValue = `${prevValue} ${transcript.text}`.trim();
  //     updateCurrentAnswer(newValue);
  //     return newValue;
  //   });
  //   const textarea = textareaRef.current;
  //   if (textarea) {
  //     textarea.style.height = 'auto';
  //     textarea.style.height = `${textarea.scrollHeight}px`;
  //   }
  // }, [transcript.text]);


  const handleTextAreaChange = (event) => {
    setError("");
    const newValue = event.target.value;
    setTextAreaValue(newValue);
    updateCurrentAnswer(newValue);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      // Set height based on scroll height
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // useEffect to update the text area with answer based on current question index.
  useEffect(() => {
    const currentAnswer = currentQuestions[currentQuestionIndex]?.answer || '';
    const currentLabel = currentQuestions[currentQuestionIndex]?.Label || '';
    const currentReasoning = currentQuestions[currentQuestionIndex]?.Reasoning || '';
    setTextAreaValue(currentAnswer);
    // setCurrentResponse({Label: currentLabel, Reasoning: currentReasoning})
    setCurrentResponse(prev => ({
      ...prev,
      Label: currentLabel,
      Reasoning: currentReasoning
    }));
    setError("")
  }, [currentQuestionIndex, currentQuestions]);

  
  // Submit the answer to the API and update the state with the API response
  const handleSubmit = async () => {
    if(currentQuestion.answer === ""){
      setError("Please fill a response.")
      return
    }
    console.log(`Submitting answer for question ${currentQuestion.id}: ${currentQuestion.answer}`);
    console.log(JSON.stringify({
      currentQuestion: currentQuestion.question,
      currentAnswer: currentQuestion.answer
    }));
    // const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'
    const response = await fetch(`${API_BASE_URL}/api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentQuestion: currentQuestion.question,
        currentAnswer: currentQuestion.answer
      }),
    })
    const data = await response.json();
    console.log("response: ", data);
    // Extracting values
    const { reason, ans, military_jargon } = data;

    const modelResponse = {
      Label: ans,
      Reasoning: reason,
      Jargon: military_jargon || []
    };

    // Update the state with the API response
    setCurrentResponse(modelResponse);
    const updatedQuestions = currentQuestions.map((question) => {
      if (question.id === currentQuestion.id) { 
        // Assuming currentQuestionId is the ID of the question being answered
        return { ...question, Label: modelResponse.Label, Reasoning: modelResponse.Reasoning };
      }
      return question;
    });

    setCurrentQuestions(updatedQuestions);
  };

  // Reset the answer in the text area
  const resetingTranscript = () => {
    setTextAreaValue('');
    updateCurrentAnswer('');
  };

  // Check if the browser supports the speech recognition API
  // if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
  //   return null;
  // }

  let btn_class = buttonColor ? "record-button" : "redButton";
 
  // Display the intro page based on showIntro state, otherwise display the main content
  // can be changed to using react router for better navigation
  if (showIntro) {
    return (  
      <div className="intro-page">
        <h1>Welcome to the Veteran's Interview Preparation Web Application</h1>
        <p>This app will guide you through a series of questions to help you prepare for your interview.</p>
        <button onClick={startInterview}>Start Interview Preparation</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1 className="app-title">NSF VetTrain</h1>
      <div className="question-container">
       {/* Displaying the current question, category and question number */}
      <div className="question-number"> Question {currentQuestionIndex + 1} of {currentQuestions.length} </div>
        <div className="category">Category: {currentQuestion.category}</div>
        <div className="question">Question: {currentQuestion.question}</div>
       {/* Displaying the text area for the answer */}
        <textarea
        ref={textareaRef}
          value={textAreaValue}
          placeholder="Type your answer here"
          onChange={handleTextAreaChange}
          className="answer-input"
        />
        {/* Displaying the previous, next, recording and submits button */}
        <div className="button-container">
          <button onClick={goToPreviousQuestion} className="next-button" disabled={currentQuestionIndex === 0}>
            Previous Question
          </button>
          <button onClick={goToNextQuestion} className="next-button">
            Next Question
          </button>
          <button onClick={startOver} className="start-over-button">Start Over</button>
          <button className={btn_class} onClick={onRecordingButton}>
             {/* based on isListening state, change the button text */}
            {isListening ? 'Stop Recording' : 'Record Answer'}
          </button>
          <button className="record-button" onClick={resetingTranscript}>Reset Answer</button>
          <button onClick={handleSubmit} className="submit-button">Submit</button>
        </div>
        {/* Displaying the API response */}
        {currentResponse.Label && (
          <div className="api-response">
            <div className="answer-api-response">Label: {currentResponse.Label}</div>
            <div className="answer-api-response">Reasoning: {currentResponse.Reasoning}</div>
            <div className="answer-api-response">Military Jargon: {currentResponse.Jargon && currentResponse.Jargon.length > 0 ? currentResponse.Jargon.join(", ") : "None detected"}</div>
          </div>
        )}
        {
          error!=="" && (
            <div className="global-error">{error}</div>
          )
        }
      </div>
    </div>
  );
}


export default App;
