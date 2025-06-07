import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const StorytellingPractice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get selected story from location state if available
  const selectedStory = location.state?.selectedStory || null;
  
  // State for stories with localStorage persistence
  const [stories, setStories] = useState(() => {
    const savedStories = localStorage.getItem('stories');
    return savedStories ? JSON.parse(savedStories) : [];
  });
  
  // State for current story
  const [currentStory, setCurrentStory] = useState(selectedStory || {
    id: '',
    title: '',
    content: '',
    category: 'achievement',
    transcript: '',
    feedback: '',
    lastPracticed: null,
    practiceCount: 0
  });
  
  // State for practice mode
  const [isPracticing, setIsPracticing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [feedback, setFeedback] = useState({
    selfRating: '',
    abtAnalysis: {},
    contentAnalysis: {},
    timeAnalysis: {}
  });
  
  // State for error handling
  const [errorMessage, setErrorMessage] = useState('');
  const [microphoneAvailable, setMicrophoneAvailable] = useState(null);
  const [browserSupported, setBrowserSupported] = useState(null);
  
  // Speech recognition setup
  const [recognition, setRecognition] = useState(null);
  
  // Refs
  const recognitionRef = useRef(null);
  const transcriptTextareaRef = useRef(null);
  
  // Check browser support and microphone access on component mount
  useEffect(() => {
    // Check browser support for speech recognition
    const isSpeechRecognitionSupported = 
      'webkitSpeechRecognition' in window || 
      'SpeechRecognition' in window;
    
    setBrowserSupported(isSpeechRecognitionSupported);
    
    if (!isSpeechRecognitionSupported) {
      setErrorMessage('Speech recognition is not supported in this browser. Please try using Chrome, Edge, or Safari.');
      return;
    }
    
    // Check microphone access
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        setMicrophoneAvailable(true);
        initializeSpeechRecognition();
      })
      .catch(error => {
        console.error('Microphone access error:', error);
        setMicrophoneAvailable(false);
        setErrorMessage(`Microphone access denied: ${error.message}. Please check your browser permissions and try again.`);
      });
      
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
      
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []);
  
  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
        setErrorMessage('');
      };
      
      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        
        // Show specific error message based on error type
        let errorMsg = 'An error occurred with speech recognition.';
        
        switch (event.error) {
          case 'no-speech':
            errorMsg = 'No speech was detected. Please try speaking again.';
            break;
          case 'audio-capture':
            errorMsg = 'No microphone was found or microphone is not working.';
            setMicrophoneAvailable(false);
            break;
          case 'not-allowed':
            errorMsg = 'Microphone permission was denied. Please check your browser settings.';
            setMicrophoneAvailable(false);
            break;
          case 'network':
            errorMsg = 'Network error occurred. Please check your internet connection.';
            break;
          case 'aborted':
            // This is usually triggered when stopping recognition intentionally
            return;
          default:
            errorMsg = `Microphone error: ${event.error}. Please try again.`;
        }
        
        setErrorMessage(errorMsg);
        
        // Stop timer if it's running
        if (timerInterval) {
          clearInterval(timerInterval);
          setTimerInterval(null);
        }
      };
      
      recognitionInstance.onresult = (event) => {
        let interim = '';
        let final = transcript;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        
        setTranscript(final);
        setInterimTranscript(interim);
        
        // Auto-save transcript to current story
        setCurrentStory(prev => ({
          ...prev,
          transcript: final
        }));
        
        // Auto-scroll textarea to bottom
        if (transcriptTextareaRef.current) {
          transcriptTextareaRef.current.scrollTop = transcriptTextareaRef.current.scrollHeight;
        }
      };
      
      setRecognition(recognitionInstance);
      recognitionRef.current = recognitionInstance;
    }
  };
  
  // Load stories from localStorage whenever they might have changed elsewhere
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedStories = localStorage.getItem('stories');
        if (savedStories) {
          const parsedStories = JSON.parse(savedStories);
          setStories(parsedStories);
          
          // If current story exists in updated stories, update it
          if (currentStory.id) {
            const updatedCurrentStory = parsedStories.find(story => story.id === currentStory.id);
            if (updatedCurrentStory) {
              setCurrentStory(updatedCurrentStory);
            }
          }
        }
      } catch (e) {
        console.error("Error parsing stories from localStorage:", e);
      }
    };
    
    // Listen for storage changes from other components
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdated', handleStorageChange);
    };
  }, [currentStory.id]);
  
  // Save stories to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('stories', JSON.stringify(stories));
      
      // Dispatch storage event to notify other components
      window.dispatchEvent(new Event('storageUpdated'));
    } catch (e) {
      console.error("Error saving stories to localStorage:", e);
      setErrorMessage("Error saving stories. Please try again.");
    }
  }, [stories]);
  
  // Update current story when selected story changes
  useEffect(() => {
    if (selectedStory) {
      setCurrentStory(selectedStory);
      setTranscript(selectedStory.transcript || '');
    }
  }, [selectedStory]);
  
  // Start recording
  const startRecording = () => {
    // Clear any previous error messages
    setErrorMessage('');
    
    // Check if microphone is available
    if (!microphoneAvailable) {
      setErrorMessage('Microphone access is required. Please check your browser permissions and try again.');
      return;
    }
    
    if (recognition) {
      try {
        recognition.start();
        
        // Start timer
        const interval = setInterval(() => {
          setTimer(prevTimer => prevTimer + 1);
        }, 1000);
        
        setTimerInterval(interval);
        setIsPracticing(true);
      } catch (e) {
        console.error('Error starting recognition:', e);
        
        // Check if it's already running
        if (e.name === 'InvalidStateError') {
          setErrorMessage('Speech recognition is already running.');
        } else {
          setErrorMessage('Error starting speech recognition. Please try again.');
        }
      }
    } else {
      setErrorMessage('Speech recognition is not available. Please refresh the page and try again.');
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (recognition) {
      try {
        recognition.stop();
        
        // Stop timer
        if (timerInterval) {
          clearInterval(timerInterval);
          setTimerInterval(null);
        }
        
        // Save transcript to current story
        const updatedStory = {
          ...currentStory,
          transcript: transcript,
          lastPracticed: new Date().toISOString(),
          practiceCount: (currentStory.practiceCount || 0) + 1
        };
        
        setCurrentStory(updatedStory);
        
        // Update in stories array if it exists
        if (updatedStory.id) {
          const updatedStories = stories.map(story => 
            story.id === updatedStory.id ? updatedStory : story
          );
          
          setStories(updatedStories);
          localStorage.setItem('stories', JSON.stringify(updatedStories));
          
          // Dispatch storage event to notify other components
          window.dispatchEvent(new Event('storageUpdated'));
        }
        
        // Generate feedback
        generateFeedback();
      } catch (e) {
        console.error('Error stopping recognition:', e);
        setErrorMessage('Error stopping speech recognition. Your transcript has been saved.');
      }
    }
  };
  
  // Save transcript manually
  const saveTranscript = () => {
    try {
      // Update current story with transcript
      const updatedStory = {
        ...currentStory,
        transcript: transcript
      };
      
      setCurrentStory(updatedStory);
      
      // Update story in stories array
      if (currentStory.id) {
        const updatedStories = stories.map(story => 
          story.id === currentStory.id ? updatedStory : story
        );
        
        setStories(updatedStories);
        localStorage.setItem('stories', JSON.stringify(updatedStories));
        
        // Dispatch storage event to notify other components
        window.dispatchEvent(new Event('storageUpdated'));
        
        setErrorMessage('');
        alert('Transcript saved successfully!');
      } else {
        setErrorMessage('Please save the story first before saving the transcript.');
      }
    } catch (e) {
      console.error("Error saving transcript:", e);
      setErrorMessage("Error saving transcript. Please try again.");
    }
  };
  
  // Handle transcript text change (manual editing)
  const handleTranscriptChange = (e) => {
    setTranscript(e.target.value);
    
    // Auto-save to current story
    setCurrentStory(prev => ({
      ...prev,
      transcript: e.target.value
    }));
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Generate feedback based on transcript
  const generateFeedback = () => {
    try {
      // ABT (And, But, Therefore) structure analysis
      const lowerTranscript = transcript.toLowerCase();
      
      // More comprehensive detection of ABT components
      const andPatterns = [
        /\band\b/,
        /\binitially\b/,
        /\bat first\b/,
        /\bstarting\b/,
        /\bbeginning\b/,
        /\bsituation was\b/
      ];
      
      const butPatterns = [
        /\bbut\b/,
        /\bhowever\b/,
        /\byet\b/,
        /\balthough\b/,
        /\bdespite\b/,
        /\bunfortunately\b/,
        /\bchallenge\b/,
        /\bproblem\b/,
        /\bissue\b/,
        /\bdifficulty\b/
      ];
      
      const thereforePatterns = [
        /\btherefore\b/,
        /\bthus\b/,
        /\bso\b/,
        /\bconsequently\b/,
        /\bas a result\b/,
        /\bin the end\b/,
        /\bfinally\b/,
        /\bultimately\b/,
        /\beventually\b/,
        /\blearned\b/,
        /\brealized\b/,
        /\bsolution\b/,
        /\bresolved\b/
      ];
      
      const hasAnd = andPatterns.some(pattern => pattern.test(lowerTranscript));
      const hasBut = butPatterns.some(pattern => pattern.test(lowerTranscript));
      const hasTherefore = thereforePatterns.some(pattern => pattern.test(lowerTranscript));
      
      const abtScore = (hasAnd ? 1 : 0) + (hasBut ? 1 : 0) + (hasTherefore ? 1 : 0);
      const abtPercentage = Math.round((abtScore / 3) * 100);
      
      // Content analysis
      const wordCount = transcript.split(/\s+/).filter(word => word.length > 0).length;
      const sentenceCount = transcript.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
      const avgWordsPerSentence = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;
      
      // Time analysis
      const optimalTime = timer >= 60 && timer <= 120;
      const tooShort = timer < 60;
      const tooLong = timer > 120;
      
      const timeMessage = optimalTime ? 
        'Great job! Your story length is optimal (1-2 minutes).' : 
        tooShort ? 
          'Your story is a bit short. Aim for 1-2 minutes to fully develop your narrative.' : 
          'Your story is longer than optimal. Try to condense it to 1-2 minutes for maximum impact.';
      
      // Set feedback
      setFeedback({
        selfRating: '',
        abtAnalysis: {
          score: abtScore,
          percentage: abtPercentage,
          hasAnd,
          hasBut,
          hasTherefore,
          suggestions: []
        },
        contentAnalysis: {
          wordCount,
          sentenceCount,
          avgWordsPerSentence,
          suggestions: []
        },
        timeAnalysis: {
          duration: timer,
          message: timeMessage,
          optimal: optimalTime
        }
      });
      
      // Add suggestions based on analysis
      const abtSuggestions = [];
      if (!hasAnd) {
        abtSuggestions.push('Your story is missing the "And" component. Start by establishing the normal situation or context.');
      }
      if (!hasBut) {
        abtSuggestions.push('Your story is missing the "But" component. Include a complication, challenge, or twist that creates tension.');
      }
      if (!hasTherefore) {
        abtSuggestions.push('Your story is missing the "Therefore" component. Conclude with how the situation was resolved or what was learned.');
      }
      
      const contentSuggestions = [];
      if (wordCount < 100) {
        contentSuggestions.push('Your story is quite brief. Consider adding more details to engage your audience.');
      }
      if (avgWordsPerSentence > 25) {
        contentSuggestions.push('Your sentences are quite long. Consider breaking them up for better clarity.');
      }
      if (avgWordsPerSentence < 8 && sentenceCount > 3) {
        contentSuggestions.push('Your sentences are very short. Consider combining some for better flow.');
      }
      
      // Update feedback with suggestions
      setFeedback(prev => ({
        ...prev,
        abtAnalysis: {
          ...prev.abtAnalysis,
          suggestions: abtSuggestions
        },
        contentAnalysis: {
          ...prev.contentAnalysis,
          suggestions: contentSuggestions
        }
      }));
    } catch (e) {
      console.error("Error generating feedback:", e);
      setErrorMessage("Error analyzing your story. Please try again.");
    }
  };
  
  // Save feedback and story
  const saveFeedbackAndStory = (selfRating) => {
    try {
      // Update feedback with self-rating
      const updatedFeedback = {
        ...feedback,
        selfRating
      };
      
      // Format feedback as string for storage
      const feedbackString = JSON.stringify(updatedFeedback);
      
      // Update current story
      const updatedStory = {
        ...currentStory,
        feedback: feedbackString,
        lastPracticed: new Date().toISOString()
      };
      
      setCurrentStory(updatedStory);
      
      // Save to stories array
      if (updatedStory.id) {
        // Update existing story
        const updatedStories = stories.map(story => 
          story.id === updatedStory.id ? updatedStory : story
        );
        
        setStories(updatedStories);
        localStorage.setItem('stories', JSON.stringify(updatedStories));
        
        // Dispatch storage event to notify other components
        window.dispatchEvent(new Event('storageUpdated'));
      } else {
        // Create new story
        const newStory = {
          ...updatedStory,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        
        const updatedStories = [...stories, newStory];
        setStories(updatedStories);
        setCurrentStory(newStory);
        
        localStorage.setItem('stories', JSON.stringify(updatedStories));
        
        // Dispatch storage event to notify other components
        window.dispatchEvent(new Event('storageUpdated'));
      }
      
      setErrorMessage('');
      alert('Feedback and story saved successfully!');
    } catch (e) {
      console.error("Error saving feedback:", e);
      setErrorMessage("Error saving feedback. Please try again.");
    }
  };
  
  // Reset practice session
  const resetPractice = () => {
    setIsPracticing(false);
    setTranscript('');
    setInterimTranscript('');
    setTimer(0);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setFeedback({
      selfRating: '',
      abtAnalysis: {},
      contentAnalysis: {},
      timeAnalysis: {}
    });
    setErrorMessage('');
  };
  
  // Handle input changes for story form
  const handleInputChange = (field, value) => {
    setCurrentStory({
      ...currentStory,
      [field]: value
    });
  };
  
  // Save story
  const saveStory = () => {
    try {
      if (!currentStory.title) {
        alert('Please enter a title for your story.');
        return;
      }
      
      let updatedStories;
      
      if (currentStory.id) {
        // Update existing story
        updatedStories = stories.map(story => 
          story.id === currentStory.id ? currentStory : story
        );
      } else {
        // Create new story
        const newStory = {
          ...currentStory,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        
        updatedStories = [...stories, newStory];
        setCurrentStory(newStory);
      }
      
      setStories(updatedStories);
      localStorage.setItem('stories', JSON.stringify(updatedStories));
      
      // Dispatch storage event to notify other components
      window.dispatchEvent(new Event('storageUpdated'));
      
      setErrorMessage('');
      alert('Story saved successfully!');
    } catch (e) {
      console.error("Error saving story:", e);
      setErrorMessage("Error saving story. Please try again.");
    }
  };
  
  // Go to Story Vault
  const goToStoryVault = () => {
    navigate('/story-vault');
  };
  
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ 
        background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: 'bold',
        marginBottom: '1rem'
      }}>
        Storytelling Practice
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <p>Practice telling your stories using the ABT (And, But, Therefore) framework for maximum impact.</p>
        <button 
          onClick={goToStoryVault}
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '0.5rem'
          }}
        >
          Go to Story Vault
        </button>
      </div>
      
      {/* Error Message */}
      {errorMessage && (
        <div style={{ 
          backgroundColor: 'rgba(220,53,69,0.2)',
          color: '#dc3545',
          padding: '1rem',
          borderRadius: '5px',
          marginBottom: '1.5rem'
        }}>
          {errorMessage}
          <button 
            onClick={() => setErrorMessage('')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#dc3545',
              cursor: 'pointer',
              float: 'right',
              fontSize: '1.2rem',
              lineHeight: '1',
              padding: '0'
            }}
          >
            ×
          </button>
        </div>
      )}
      
      {/* Browser/Microphone Support Warning */}
      {browserSupported === false && (
        <div style={{ 
          backgroundColor: 'rgba(255,193,7,0.2)',
          color: '#ffc107',
          padding: '1rem',
          borderRadius: '5px',
          marginBottom: '1.5rem'
        }}>
          <strong>Warning:</strong> Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari for the best experience.
        </div>
      )}
      
      {microphoneAvailable === false && (
        <div style={{ 
          backgroundColor: 'rgba(255,193,7,0.2)',
          color: '#ffc107',
          padding: '1rem',
          borderRadius: '5px',
          marginBottom: '1.5rem'
        }}>
          <strong>Warning:</strong> Microphone access is required for speech-to-text functionality. Please check your browser permissions.
        </div>
      )}
      
      {!isPracticing ? (
        <div>
          {/* Story Form */}
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: '1.5rem', 
            borderRadius: '10px',
            marginBottom: '2rem'
          }}>
            <h2>Story Details</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title:</label>
              <input 
                type="text" 
                value={currentStory.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '5px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category:</label>
              <select 
                value={currentStory.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '5px'
                }}
              >
                <option value="achievement">Achievement</option>
                <option value="challenge">Challenge</option>
                <option value="leadership">Leadership</option>
                <option value="failure">Failure & Learning</option>
                <option value="teamwork">Teamwork</option>
                <option value="innovation">Innovation</option>
                <option value="conflict">Conflict Resolution</option>
                <option value="personal">Personal Growth</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Story Content (ABT Framework):</label>
              <textarea 
                value={currentStory.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="And (setup/context)... But (complication/challenge)... Therefore (resolution/outcome)..."
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '5px',
                  minHeight: '150px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={saveStory}
                disabled={!currentStory.title}
                style={{
                  backgroundColor: currentStory.title ? 'rgba(10,177,150,0.3)' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: currentStory.title ? 'pointer' : 'not-allowed'
                }}
              >
                Save Story
              </button>
              
              <button 
                onClick={() => setIsPracticing(true)}
                style={{
                  background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Start Practice
              </button>
            </div>
          </div>
          
          {/* Previous Transcript */}
          {currentStory.transcript && (
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: '1.5rem', 
              borderRadius: '10px',
              marginBottom: '2rem'
            }}>
              <h2>Previous Transcript</h2>
              <div style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '1rem',
                borderRadius: '5px',
                whiteSpace: 'pre-wrap'
              }}>
                {currentStory.transcript}
              </div>
              
              {currentStory.lastPracticed && (
                <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                  Last practiced: {new Date(currentStory.lastPracticed).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>
          )}
          
          {/* Previous Feedback */}
          {currentStory.feedback && (
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: '1.5rem', 
              borderRadius: '10px'
            }}>
              <h2>Previous Feedback</h2>
              {(() => {
                try {
                  const parsedFeedback = JSON.parse(currentStory.feedback);
                  return (
                    <div>
                      {parsedFeedback.selfRating && (
                        <div style={{ marginBottom: '1rem' }}>
                          <strong>Self Rating:</strong> {parsedFeedback.selfRating}/5
                        </div>
                      )}
                      
                      {parsedFeedback.abtAnalysis && (
                        <div style={{ marginBottom: '1rem' }}>
                          <strong>ABT Framework:</strong> {parsedFeedback.abtAnalysis.percentage || 0}% complete
                          <div style={{ 
                            width: '100%', 
                            height: '6px', 
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            marginTop: '0.5rem'
                          }}>
                            <div style={{ 
                              width: `${parsedFeedback.abtAnalysis.percentage || 0}%`, 
                              height: '100%', 
                              backgroundColor: '#0AB196',
                              borderRadius: '3px'
                            }} />
                          </div>
                          
                          {parsedFeedback.abtAnalysis.suggestions && parsedFeedback.abtAnalysis.suggestions.length > 0 && (
                            <div style={{ marginTop: '0.5rem' }}>
                              {parsedFeedback.abtAnalysis.suggestions.map((suggestion, index) => (
                                <div key={index} style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                                  • {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {parsedFeedback.timeAnalysis && (
                        <div style={{ marginBottom: '1rem' }}>
                          <strong>Time:</strong> {Math.floor((parsedFeedback.timeAnalysis.duration || 0) / 60)}:{((parsedFeedback.timeAnalysis.duration || 0) % 60).toString().padStart(2, '0')}
                          {parsedFeedback.timeAnalysis.message && (
                            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>
                              {parsedFeedback.timeAnalysis.message}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {parsedFeedback.contentAnalysis && (
                        <div>
                          <strong>Content:</strong> {parsedFeedback.contentAnalysis.wordCount || 0} words, {parsedFeedback.contentAnalysis.sentenceCount || 0} sentences
                          
                          {parsedFeedback.contentAnalysis.suggestions && parsedFeedback.contentAnalysis.suggestions.length > 0 && (
                            <div style={{ marginTop: '0.5rem' }}>
                              {parsedFeedback.contentAnalysis.suggestions.map((suggestion, index) => (
                                <div key={index} style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                                  • {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                } catch (e) {
                  return <div>Error displaying feedback. Please try practicing again.</div>;
                }
              })()}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Practice Mode */}
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: '1.5rem', 
            borderRadius: '10px',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Practice: {currentStory.title}</h2>
              <div style={{ 
                backgroundColor: isRecording ? 'rgba(220,53,69,0.3)' : 'rgba(10,177,150,0.3)',
                color: isRecording ? '#dc3545' : '#0AB196',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{ 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  backgroundColor: isRecording ? '#dc3545' : '#0AB196',
                  animation: isRecording ? 'pulse 1.5s infinite' : 'none'
                }} />
                {isRecording ? 'Recording...' : 'Ready'}
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Timer:</span>
                <span>{formatTime(timer)}</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '6px', 
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${Math.min(timer / 120 * 100, 100)}%`, 
                  height: '100%', 
                  backgroundColor: timer <= 60 ? '#0AB196' : timer <= 120 ? '#ffc107' : '#dc3545',
                  borderRadius: '3px'
                }} />
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.7)',
                marginTop: '0.25rem'
              }}>
                <span>0:00</span>
                <span>1:00</span>
                <span>2:00</span>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Transcript:</label>
              <div style={{ position: 'relative' }}>
                <textarea 
                  ref={transcriptTextareaRef}
                  value={transcript}
                  onChange={handleTranscriptChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px',
                    minHeight: '200px',
                    resize: 'vertical'
                  }}
                />
                {interimTranscript && (
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '0.5rem', 
                    left: '0.5rem', 
                    right: '0.5rem',
                    color: 'rgba(255,255,255,0.5)',
                    fontStyle: 'italic'
                  }}>
                    {interimTranscript}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {!isRecording ? (
                <button 
                  onClick={startRecording}
                  disabled={!browserSupported || !microphoneAvailable}
                  style={{
                    backgroundColor: (!browserSupported || !microphoneAvailable) ? 'rgba(255,255,255,0.1)' : 'rgba(10,177,150,0.3)',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    cursor: (!browserSupported || !microphoneAvailable) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    backgroundColor: '#0AB196'
                  }} />
                  Start Recording
                </button>
              ) : (
                <button 
                  onClick={stopRecording}
                  style={{
                    backgroundColor: 'rgba(220,53,69,0.3)',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ 
                    width: '10px', 
                    height: '10px', 
                    backgroundColor: '#dc3545',
                    borderRadius: '0'
                  }} />
                  Stop Recording
                </button>
              )}
              
              <button 
                onClick={saveTranscript}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Save Transcript
              </button>
              
              <button 
                onClick={resetPractice}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>
              
              <button 
                onClick={() => setIsPracticing(false)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Back to Story
              </button>
            </div>
          </div>
          
          {/* ABT Framework Guide */}
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: '1.5rem', 
            borderRadius: '10px',
            marginBottom: '2rem'
          }}>
            <h2>ABT Framework Guide</h2>
            <div style={{ marginBottom: '1rem' }}>
              <strong>And:</strong> Set up the context and normal situation
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>
                Example: "I was working on a critical project with a tight deadline, and everything seemed to be going according to plan..."
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>But:</strong> Introduce the complication or challenge
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>
                Example: "But suddenly we discovered a major flaw in our approach that threatened the entire project..."
              </div>
            </div>
            
            <div>
              <strong>Therefore:</strong> Explain the resolution and what was learned
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>
                Example: "Therefore, I quickly reorganized the team, prioritized the critical components, and we not only met the deadline but delivered a better solution than originally planned..."
              </div>
            </div>
          </div>
          
          {/* Feedback Section */}
          {Object.keys(feedback.abtAnalysis).length > 0 && (
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: '1.5rem', 
              borderRadius: '10px',
              marginBottom: '2rem'
            }}>
              <h2>Feedback</h2>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h3>ABT Framework Analysis</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Completeness:</span>
                  <span>{feedback.abtAnalysis.percentage}%</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '6px', 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: `${feedback.abtAnalysis.percentage}%`, 
                    height: '100%', 
                    backgroundColor: '#0AB196',
                    borderRadius: '3px'
                  }} />
                </div>
                
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ 
                    backgroundColor: feedback.abtAnalysis.hasAnd ? 'rgba(10,177,150,0.2)' : 'rgba(220,53,69,0.2)',
                    color: feedback.abtAnalysis.hasAnd ? '#0AB196' : '#dc3545',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {feedback.abtAnalysis.hasAnd ? '✓' : '✗'} And
                  </div>
                  
                  <div style={{ 
                    backgroundColor: feedback.abtAnalysis.hasBut ? 'rgba(10,177,150,0.2)' : 'rgba(220,53,69,0.2)',
                    color: feedback.abtAnalysis.hasBut ? '#0AB196' : '#dc3545',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {feedback.abtAnalysis.hasBut ? '✓' : '✗'} But
                  </div>
                  
                  <div style={{ 
                    backgroundColor: feedback.abtAnalysis.hasTherefore ? 'rgba(10,177,150,0.2)' : 'rgba(220,53,69,0.2)',
                    color: feedback.abtAnalysis.hasTherefore ? '#0AB196' : '#dc3545',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {feedback.abtAnalysis.hasTherefore ? '✓' : '✗'} Therefore
                  </div>
                </div>
                
                {feedback.abtAnalysis.suggestions && feedback.abtAnalysis.suggestions.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4>Suggestions:</h4>
                    {feedback.abtAnalysis.suggestions.map((suggestion, index) => (
                      <div key={index} style={{ marginBottom: '0.5rem' }}>
                        • {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h3>Content Analysis</h3>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Word Count:</strong> {feedback.contentAnalysis.wordCount}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Sentence Count:</strong> {feedback.contentAnalysis.sentenceCount}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Average Words per Sentence:</strong> {feedback.contentAnalysis.avgWordsPerSentence}
                </div>
                
                {feedback.contentAnalysis.suggestions && feedback.contentAnalysis.suggestions.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4>Suggestions:</h4>
                    {feedback.contentAnalysis.suggestions.map((suggestion, index) => (
                      <div key={index} style={{ marginBottom: '0.5rem' }}>
                        • {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h3>Time Analysis</h3>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Duration:</strong> {formatTime(feedback.timeAnalysis.duration)}
                </div>
                <div style={{ 
                  backgroundColor: feedback.timeAnalysis.optimal ? 'rgba(10,177,150,0.2)' : 'rgba(255,193,7,0.2)',
                  color: feedback.timeAnalysis.optimal ? '#0AB196' : '#ffc107',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  marginTop: '0.5rem'
                }}>
                  {feedback.timeAnalysis.message}
                </div>
              </div>
              
              <div>
                <h3>Self Rating</h3>
                <div style={{ marginBottom: '1rem' }}>
                  How would you rate your own performance?
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button 
                      key={rating}
                      onClick={() => saveFeedbackAndStory(rating)}
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem'
                      }}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default StorytellingPractice;
