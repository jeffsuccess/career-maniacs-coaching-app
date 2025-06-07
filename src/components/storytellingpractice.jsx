import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const StorytellingPractice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs to prevent infinite loops
  const isInitialMount = useRef(true);
  const storageEventRef = useRef(false);
  const timerRef = useRef(null);
  
  // Get selected story from location state if available
  const [selectedStory, setSelectedStory] = useState(() => {
    // First check location state
    if (location.state?.selectedStory) {
      return location.state.selectedStory;
    }
    
    // Then check localStorage for story from Story Vault
    try {
      const savedStoryData = localStorage.getItem('currentPracticeStory');
      if (savedStoryData) {
        const parsedData = JSON.parse(savedStoryData);
        // Clear the localStorage item to prevent reuse on refresh
        localStorage.removeItem('currentPracticeStory');
        return parsedData.selectedStory;
      }
    } catch (e) {
      console.error("Error parsing story from localStorage:", e);
    }
    
    return null;
  });
  
  // State for stories with localStorage persistence
  const [stories, setStories] = useState(() => {
    const savedStories = localStorage.getItem('stories');
    return savedStories ? JSON.parse(savedStories) : [];
  });
  
  // State for current story
  const [currentStory, setCurrentStory] = useState(() => {
    if (selectedStory) {
      return selectedStory;
    }
    
    return {
      id: '',
      title: '',
      content: '',
      category: 'achievement',
      transcript: '',
      feedback: '',
      lastPracticed: null,
      practiceCount: 0
    };
  });
  
  // State for practice mode
  const [isPracticing, setIsPracticing] = useState(false);
  const [transcript, setTranscript] = useState(selectedStory?.transcript || '');
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
    console.log("StorytellingPractice component mounted");
    console.log("Selected story:", selectedStory);
    
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
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
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
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
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
      // Prevent infinite loop by checking if we're the ones who triggered the event
      if (storageEventRef.current) {
        storageEventRef.current = false;
        return;
      }
      
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
    // Skip on initial mount to prevent unnecessary event dispatch
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    try {
      // Set flag to indicate we're triggering the event
      storageEventRef.current = true;
      
      localStorage.setItem('stories', JSON.stringify(stories));
      
      // Dispatch storage event to notify other components
      window.dispatchEvent(new Event('storageUpdated'));
      
      // Reset flag after a short delay to allow event to process
      setTimeout(() => {
        storageEventRef.current = false;
      }, 50);
    } catch (e) {
      console.error("Error saving stories to localStorage:", e);
      setErrorMessage("Error saving stories. Please try again.");
    }
  }, [stories]);
  
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
          setTimer(prevTimer => {
            // Log timer updates to debug the 2-second issue
            console.log("Timer updated:", prevTimer + 1);
            return prevTimer + 1;
          });
        }, 1000);
        
        timerRef.current = interval;
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
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
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
        contentSuggestions.push('Your story is quite brief. Consider adding more details to make it more engaging.');
      } else if (wordCount > 300) {
        contentSuggestions.push('Your story is quite long. Consider focusing on the most important elements to make it more concise.');
      }
      
      if (avgWordsPerSentence > 25) {
        contentSuggestions.push('Your sentences are quite long. Consider breaking them up for better clarity.');
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
      setErrorMessage("Error generating feedback. Please try again.");
    }
  };
  
  // Handle self-rating change
  const handleSelfRatingChange = (rating) => {
    setFeedback(prev => ({
      ...prev,
      selfRating: rating
    }));
  };
  
  // Go back to story vault
  const goBackToStoryVault = () => {
    navigate('/story-vault');
  };
  
  // Reset practice
  const resetPractice = () => {
    setTranscript('');
    setInterimTranscript('');
    setTimer(0);
    setIsPracticing(false);
    setFeedback({
      selfRating: '',
      abtAnalysis: {},
      contentAnalysis: {},
      timeAnalysis: {}
    });
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
        <p>Practice and refine your interview stories using the ABT (And, But, Therefore) framework.</p>
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
      
      {/* Browser Support Warning */}
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
      
      {/* Microphone Access Warning */}
      {microphoneAvailable === false && (
        <div style={{ 
          backgroundColor: 'rgba(255,193,7,0.2)',
          color: '#ffc107',
          padding: '1rem',
          borderRadius: '5px',
          marginBottom: '1.5rem'
        }}>
          <strong>Warning:</strong> Microphone access is required for speech-to-text functionality. Please check your browser permissions and try again.
        </div>
      )}
      
      {/* Story Selection */}
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        padding: '1.5rem', 
        borderRadius: '10px',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Current Story</h2>
        
        {currentStory.id ? (
          <div>
            <h3>{currentStory.title}</h3>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '1rem'
            }}>
              <span>Category: {currentStory.category}</span>
              <span>Practice Count: {currentStory.practiceCount || 0}</span>
            </div>
            
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.05)',
              padding: '1rem',
              borderRadius: '5px',
              marginBottom: '1rem'
            }}>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{currentStory.content}</p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p>No story selected. Go to Story Vault to select a story to practice.</p>
            <button 
              onClick={goBackToStoryVault}
              style={{
                background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '1rem'
              }}
            >
              Go to Story Vault
            </button>
          </div>
        )}
      </div>
      
      {/* Practice Area */}
      {currentStory.id && (
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          marginBottom: '1.5rem'
        }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2 style={{ margin: 0 }}>Practice</h2>
            
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.05)',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              fontFamily: 'monospace'
            }}>
              {formatTime(timer)}
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <p>Use the microphone to record your story. Aim for 1-2 minutes and follow the ABT framework.</p>
          </div>
          
          <div style={{ 
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            {!isRecording ? (
              <button 
                onClick={startRecording}
                disabled={!microphoneAvailable || !browserSupported}
                style={{
                  backgroundColor: microphoneAvailable && browserSupported ? 'rgba(40,167,69,0.3)' : 'rgba(255,255,255,0.1)',
                  border: microphoneAvailable && browserSupported ? '1px solid #28a745' : '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: microphoneAvailable && browserSupported ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ 
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#28a745',
                  borderRadius: '50%'
                }}></span>
                Start Recording
              </button>
            ) : (
              <button 
                onClick={stopRecording}
                style={{
                  backgroundColor: 'rgba(220,53,69,0.3)',
                  border: '1px solid #dc3545',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ 
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#dc3545',
                  borderRadius: '50%'
                }}></span>
                Stop Recording
              </button>
            )}
            
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
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Transcript:</label>
            <div style={{ position: 'relative' }}>
              <textarea 
                ref={transcriptTextareaRef}
                value={transcript}
                onChange={handleTranscriptChange}
                placeholder="Your story transcript will appear here as you speak..."
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
              
              {isRecording && interimTranscript && (
                <div style={{ 
                  position: 'absolute',
                  bottom: '0.5rem',
                  left: '0.5rem',
                  right: '0.5rem',
                  color: 'rgba(255,255,255,0.6)',
                  fontStyle: 'italic'
                }}>
                  {interimTranscript}
                </div>
              )}
            </div>
            
            <div style={{ 
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '0.5rem'
            }}>
              <button 
                onClick={saveTranscript}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Save Transcript
              </button>
            </div>
          </div>
          
          {/* Feedback Section */}
          {(timer > 0 || transcript) && (
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.05)',
              padding: '1rem',
              borderRadius: '5px'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>Feedback</h3>
              
              {/* Self Rating */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>How would you rate your delivery?</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'].map(rating => (
                    <button 
                      key={rating}
                      onClick={() => handleSelfRatingChange(rating)}
                      style={{
                        backgroundColor: feedback.selfRating === rating ? 'rgba(10,177,150,0.3)' : 'rgba(255,255,255,0.1)',
                        border: feedback.selfRating === rating ? '1px solid #0AB196' : '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* ABT Framework Analysis */}
              {feedback.abtAnalysis && feedback.abtAnalysis.percentage !== undefined && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>ABT Framework Analysis</h4>
                  
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ 
                      width: '60px',
                      height: '60px',
                      position: 'relative',
                      borderRadius: '50%',
                      background: `conic-gradient(#0AB196 ${feedback.abtAnalysis.percentage}%, #f0f0f0 0)`,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <div style={{ 
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(22, 22, 26, 1)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontWeight: 'bold' }}>{feedback.abtAnalysis.percentage}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ 
                        display: 'flex',
                        gap: '0.5rem',
                        marginBottom: '0.25rem'
                      }}>
                        <span style={{ 
                          display: 'inline-block',
                          width: '20px',
                          height: '20px',
                          backgroundColor: feedback.abtAnalysis.hasAnd ? '#28a745' : '#dc3545',
                          borderRadius: '50%',
                          textAlign: 'center',
                          lineHeight: '20px',
                          color: 'white',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          {feedback.abtAnalysis.hasAnd ? '✓' : '✗'}
                        </span>
                        <span>And (Setup/Context)</span>
                      </div>
                      
                      <div style={{ 
                        display: 'flex',
                        gap: '0.5rem',
                        marginBottom: '0.25rem'
                      }}>
                        <span style={{ 
                          display: 'inline-block',
                          width: '20px',
                          height: '20px',
                          backgroundColor: feedback.abtAnalysis.hasBut ? '#28a745' : '#dc3545',
                          borderRadius: '50%',
                          textAlign: 'center',
                          lineHeight: '20px',
                          color: 'white',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          {feedback.abtAnalysis.hasBut ? '✓' : '✗'}
                        </span>
                        <span>But (Complication/Challenge)</span>
                      </div>
                      
                      <div style={{ 
                        display: 'flex',
                        gap: '0.5rem'
                      }}>
                        <span style={{ 
                          display: 'inline-block',
                          width: '20px',
                          height: '20px',
                          backgroundColor: feedback.abtAnalysis.hasTherefore ? '#28a745' : '#dc3545',
                          borderRadius: '50%',
                          textAlign: 'center',
                          lineHeight: '20px',
                          color: 'white',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          {feedback.abtAnalysis.hasTherefore ? '✓' : '✗'}
                        </span>
                        <span>Therefore (Resolution/Outcome)</span>
                      </div>
                    </div>
                  </div>
                  
                  {feedback.abtAnalysis.suggestions && feedback.abtAnalysis.suggestions.length > 0 && (
                    <div style={{ 
                      backgroundColor: 'rgba(255,193,7,0.1)',
                      padding: '0.5rem',
                      borderRadius: '5px',
                      marginTop: '0.5rem'
                    }}>
                      <strong>Suggestions:</strong>
                      <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
                        {feedback.abtAnalysis.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {/* Content Analysis */}
              {feedback.contentAnalysis && feedback.contentAnalysis.wordCount !== undefined && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Content Analysis</h4>
                  
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: '0.5rem',
                      borderRadius: '5px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{feedback.contentAnalysis.wordCount}</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Words</div>
                    </div>
                    
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: '0.5rem',
                      borderRadius: '5px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{feedback.contentAnalysis.sentenceCount}</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Sentences</div>
                    </div>
                    
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: '0.5rem',
                      borderRadius: '5px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{feedback.contentAnalysis.avgWordsPerSentence}</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Avg Words/Sentence</div>
                    </div>
                  </div>
                  
                  {feedback.contentAnalysis.suggestions && feedback.contentAnalysis.suggestions.length > 0 && (
                    <div style={{ 
                      backgroundColor: 'rgba(255,193,7,0.1)',
                      padding: '0.5rem',
                      borderRadius: '5px',
                      marginTop: '0.5rem'
                    }}>
                      <strong>Suggestions:</strong>
                      <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
                        {feedback.contentAnalysis.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {/* Time Analysis */}
              {feedback.timeAnalysis && feedback.timeAnalysis.duration !== undefined && (
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>Time Analysis</h4>
                  
                  <div style={{ 
                    backgroundColor: feedback.timeAnalysis.optimal ? 'rgba(40,167,69,0.1)' : 'rgba(255,193,7,0.1)',
                    padding: '0.5rem',
                    borderRadius: '5px'
                  }}>
                    <strong>Duration:</strong> {formatTime(feedback.timeAnalysis.duration)}
                    <p style={{ margin: '0.5rem 0 0 0' }}>{feedback.timeAnalysis.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StorytellingPractice;
