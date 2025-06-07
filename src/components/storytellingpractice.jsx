import React, { useState, useEffect } from 'react';
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
  
  // Speech recognition setup
  const [recognition, setRecognition] = useState(null);
  
  // Refs
  const recognitionRef = React.useRef(null);
  const transcriptTextareaRef = React.useRef(null);
  
  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
      };
      
      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        
        // Show error message to user
        alert(`Microphone error: ${event.error}. Please check your microphone permissions and try again.`);
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
      };
      
      setRecognition(recognitionInstance);
      recognitionRef.current = recognitionInstance;
    } else {
      alert('Speech recognition is not supported in this browser. Please try using Chrome, Edge, or Safari.');
    }
    
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
  }, [transcript, timerInterval]);
  
  // Save stories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('stories', JSON.stringify(stories));
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
        alert('Error starting speech recognition. Please try again.');
      }
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
        setCurrentStory(prev => ({
          ...prev,
          transcript: transcript,
          lastPracticed: new Date().toISOString(),
          practiceCount: (prev.practiceCount || 0) + 1
        }));
        
        // Generate feedback
        generateFeedback();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }
  };
  
  // Save transcript manually
  const saveTranscript = () => {
    // Update current story with transcript
    setCurrentStory(prev => ({
      ...prev,
      transcript: transcript
    }));
    
    // Update story in stories array
    if (currentStory.id) {
      setStories(prevStories => 
        prevStories.map(story => 
          story.id === currentStory.id ? 
            { ...story, transcript: transcript } : 
            story
        )
      );
    }
    
    alert('Transcript saved successfully!');
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
    // ABT (And, But, Therefore) structure analysis
    const words = transcript.toLowerCase().split(/\s+/);
    const andCount = words.filter(word => word === 'and').length;
    const butCount = words.filter(word => word === 'but' || word === 'however' || word === 'yet').length;
    const thereforeCount = words.filter(word => 
      word === 'therefore' || word === 'thus' || word === 'so' || word === 'consequently'
    ).length;
    
    const hasAnd = andCount > 0;
    const hasBut = butCount > 0;
    const hasTherefore = thereforeCount > 0;
    
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
  };
  
  // Save feedback and story
  const saveFeedbackAndStory = (selfRating) => {
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
    
    // Save to stories array
    if (updatedStory.id) {
      // Update existing story
      setStories(prevStories => 
        prevStories.map(story => 
          story.id === updatedStory.id ? updatedStory : story
        )
      );
    } else {
      // Create new story
      const newStory = {
        ...updatedStory,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      setStories(prevStories => [...prevStories, newStory]);
      setCurrentStory(newStory);
    }
    
    alert('Feedback and story saved successfully!');
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
    if (!currentStory.title) {
      alert('Please enter a title for your story.');
      return;
    }
    
    if (currentStory.id) {
      // Update existing story
      setStories(prevStories => 
        prevStories.map(story => 
          story.id === currentStory.id ? currentStory : story
        )
      );
    } else {
      // Create new story
      const newStory = {
        ...currentStory,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      setStories(prevStories => [...prevStories, newStory]);
      setCurrentStory(newStory);
    }
    
    alert('Story saved successfully!');
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
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button 
                onClick={saveStory}
                disabled={!currentStory.title}
                style={{
                  background: currentStory.title ? 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: currentStory.title ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold'
                }}
              >
                Save Story
              </button>
              <button 
                onClick={startRecording}
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
                Start Practice
              </button>
            </div>
          </div>
          
          {/* ABT Framework Guide */}
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: '1.5rem', 
            borderRadius: '10px'
          }}>
            <h2>ABT Framework Guide</h2>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ color: '#0AB196' }}>And (Setup/Context)</h3>
              <p>Establish the normal situation or context. Introduce the main characters and setting.</p>
              <p><em>Example: "I was leading a team of five developers, and we were working on a critical project with a tight deadline..."</em></p>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ color: '#00C2C7' }}>But (Complication/Challenge)</h3>
              <p>Introduce the complication, challenge, or twist that creates tension.</p>
              <p><em>Example: "But three days before the deadline, we discovered a major security vulnerability that required a complete redesign of our authentication system..."</em></p>
            </div>
            
            <div>
              <h3 style={{ color: '#16B3F7' }}>Therefore (Resolution/Outcome)</h3>
              <p>Explain how the situation was resolved and what was learned or achieved.</p>
              <p><em>Example: "Therefore, I reorganized the team into specialized task forces, implemented a 24-hour work rotation, and personally led the security redesign. We not only met the deadline but delivered a more secure product than originally planned..."</em></p>
            </div>
          </div>
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
                backgroundColor: 'rgba(255,255,255,0.1)',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                fontFamily: 'monospace',
                fontSize: '1.2rem'
              }}>
                {formatTime(timer)}
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Category:</strong> {currentStory.category}</p>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                <strong>Live Transcript:</strong>
                {isRecording && <span style={{ color: '#0AB196', marginLeft: '0.5rem' }}>● Recording</span>}
              </label>
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
                    bottom: '10px',
                    left: '10px',
                    right: '10px',
                    color: 'rgba(255,255,255,0.6)',
                    fontStyle: 'italic'
                  }}>
                    {interimTranscript}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              {isRecording ? (
                <button 
                  onClick={stopRecording}
                  style={{
                    backgroundColor: 'rgba(255,100,100,0.3)',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Stop Recording
                </button>
              ) : (
                <button 
                  onClick={startRecording}
                  style={{
                    backgroundColor: 'rgba(10,177,150,0.3)',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Start Recording
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
                  cursor: 'pointer',
                  flex: 1
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
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                End Practice
              </button>
            </div>
          </div>
          
          {/* Feedback Section */}
          {(timer > 0 || transcript) && (
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: '1.5rem', 
              borderRadius: '10px'
            }}>
              <h2>Feedback</h2>
              
              {/* Self-Rating */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3>How would you rate your delivery?</h3>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button 
                    onClick={() => saveFeedbackAndStory('excellent')}
                    style={{
                      backgroundColor: feedback.selfRating === 'excellent' ? 'rgba(10,177,150,0.5)' : 'rgba(10,177,150,0.2)',
                      border: 'none',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Excellent
                  </button>
                  <button 
                    onClick={() => saveFeedbackAndStory('good')}
                    style={{
                      backgroundColor: feedback.selfRating === 'good' ? 'rgba(22,179,247,0.5)' : 'rgba(22,179,247,0.2)',
                      border: 'none',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Good
                  </button>
                  <button 
                    onClick={() => saveFeedbackAndStory('needs_work')}
                    style={{
                      backgroundColor: feedback.selfRating === 'needs_work' ? 'rgba(255,100,100,0.5)' : 'rgba(255,100,100,0.2)',
                      border: 'none',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Needs Work
                  </button>
                </div>
              </div>
              
              {/* Automated Analysis */}
              <div>
                <h3>Automated Story Analysis</h3>
                
                {/* ABT Structure Analysis */}
                {feedback.abtAnalysis.percentage !== undefined && (
                  <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)', 
                    padding: '1rem', 
                    borderRadius: '5px',
                    marginBottom: '1rem'
                  }}>
                    <h4>ABT Structure</h4>
                    <div style={{ 
                      width: '100%', 
                      height: '10px', 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '5px',
                      overflow: 'hidden',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{ 
                        width: `${feedback.abtAnalysis.percentage}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                        borderRadius: '5px'
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span>Score: {feedback.abtAnalysis.score}/3</span>
                      <span>{feedback.abtAnalysis.percentage}%</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ 
                        flex: 1, 
                        padding: '0.5rem', 
                        backgroundColor: feedback.abtAnalysis.hasAnd ? 'rgba(10,177,150,0.2)' : 'rgba(255,100,100,0.2)',
                        borderRadius: '5px',
                        textAlign: 'center'
                      }}>
                        <strong>And</strong>
                        <div>{feedback.abtAnalysis.hasAnd ? '✓' : '✗'}</div>
                      </div>
                      <div style={{ 
                        flex: 1, 
                        padding: '0.5rem', 
                        backgroundColor: feedback.abtAnalysis.hasBut ? 'rgba(10,177,150,0.2)' : 'rgba(255,100,100,0.2)',
                        borderRadius: '5px',
                        textAlign: 'center'
                      }}>
                        <strong>But</strong>
                        <div>{feedback.abtAnalysis.hasBut ? '✓' : '✗'}</div>
                      </div>
                      <div style={{ 
                        flex: 1, 
                        padding: '0.5rem', 
                        backgroundColor: feedback.abtAnalysis.hasTherefore ? 'rgba(10,177,150,0.2)' : 'rgba(255,100,100,0.2)',
                        borderRadius: '5px',
                        textAlign: 'center'
                      }}>
                        <strong>Therefore</strong>
                        <div>{feedback.abtAnalysis.hasTherefore ? '✓' : '✗'}</div>
                      </div>
                    </div>
                    
                    {feedback.abtAnalysis.suggestions.length > 0 && (
                      <div>
                        <h5>Suggestions:</h5>
                        <ul style={{ paddingLeft: '1.5rem' }}>
                          {feedback.abtAnalysis.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Content Analysis */}
                {feedback.contentAnalysis.wordCount !== undefined && (
                  <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)', 
                    padding: '1rem', 
                    borderRadius: '5px',
                    marginBottom: '1rem'
                  }}>
                    <h4>Content Analysis</h4>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Word Count:</strong> {feedback.contentAnalysis.wordCount}
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Sentences:</strong> {feedback.contentAnalysis.sentenceCount}
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <strong>Avg. Words per Sentence:</strong> {feedback.contentAnalysis.avgWordsPerSentence}
                    </div>
                    
                    {feedback.contentAnalysis.suggestions.length > 0 && (
                      <div>
                        <h5>Suggestions:</h5>
                        <ul style={{ paddingLeft: '1.5rem' }}>
                          {feedback.contentAnalysis.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Time Analysis */}
                {feedback.timeAnalysis.duration !== undefined && (
                  <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)', 
                    padding: '1rem', 
                    borderRadius: '5px'
                  }}>
                    <h4>Time Analysis</h4>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Duration:</strong> {formatTime(feedback.timeAnalysis.duration)}
                    </div>
                    <div style={{ 
                      padding: '0.5rem', 
                      backgroundColor: feedback.timeAnalysis.optimal ? 'rgba(10,177,150,0.2)' : 'rgba(255,100,100,0.2)',
                      borderRadius: '5px'
                    }}>
                      {feedback.timeAnalysis.message}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StorytellingPractice;
