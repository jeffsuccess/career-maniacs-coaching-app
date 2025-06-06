import React, { useState, useEffect, useRef } from 'react';

const StorytellingPractice = () => {
  // State for stories
  const [stories, setStories] = useState(() => {
    const savedStories = localStorage.getItem('storytellingPracticeStories');
    return savedStories ? JSON.parse(savedStories) : [
      {
        id: 1,
        title: 'Leadership Challenge',
        tags: ['Leadership', 'Problem Solving'],
        transcript: 'And I was leading a team of five developers on a critical project with a tight deadline. But halfway through, we discovered that the requirements were changing significantly, and two team members had to be reassigned to another urgent project. Therefore, I reorganized our approach, breaking down the work into smaller modules, implemented daily stand-ups to improve communication, and personally took on some of the coding tasks. We delivered the project on time with all critical features intact.',
        practiceHistory: [
          { date: '2025-05-15', duration: 120, feedback: 'good' },
          { date: '2025-05-20', duration: 90, feedback: 'excellent' }
        ]
      },
      {
        id: 2,
        title: 'Innovation Initiative',
        tags: ['Innovation', 'Collaboration'],
        transcript: 'And I noticed our team was using an inefficient process for tracking customer feedback that was causing delays in our product improvement cycle. But management was hesitant to change established procedures, and there was no budget for new tools. Therefore, I researched open-source alternatives, created a prototype implementation, and presented data showing how it could reduce processing time by 40%. The new system was adopted and has now become the standard across three departments.',
        practiceHistory: [
          { date: '2025-05-18', duration: 105, feedback: 'needs-work' }
        ]
      }
    ];
  });

  // State for form
  const [formData, setFormData] = useState({
    title: '',
    tags: [],
    transcript: ''
  });
  const [newTag, setNewTag] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentStoryId, setCurrentStoryId] = useState(null);

  // State for practice mode
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceStory, setPracticeStory] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [practiceTimer, setPracticeTimer] = useState(0);
  const [timerDuration, setTimerDuration] = useState(120); // 2 minutes default
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);
  const recordingTimerRef = useRef(null);

  // State for speech recognition
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const recognitionRef = useRef(null);
  const [feedback, setFeedback] = useState(null);

  // Save stories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('storytellingPracticeStories', JSON.stringify(stories));
  }, [stories]);

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionSupported(false);
    }
  }, []);

  // Timer effect for practice
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setPracticeTimer(prev => {
          if (prev >= timerDuration) {
            clearInterval(timerRef.current);
            setTimerRunning(false);
            return timerDuration;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRunning, timerDuration]);

  // Timer effect for recording
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Add tag
  const addTag = () => {
    if (newTag.trim() === '') return;
    if (formData.tags.includes(newTag.trim())) {
      setNewTag('');
      return;
    }

    setFormData({
      ...formData,
      tags: [...formData.tags, newTag.trim()]
    });
    setNewTag('');
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Save story
  const saveStory = () => {
    if (formData.title.trim() === '' || formData.transcript.trim() === '') {
      alert('Please enter a title and transcript for your story.');
      return;
    }

    if (isEditing && currentStoryId) {
      // Update existing story
      const updatedStories = stories.map(story => 
        story.id === currentStoryId ? { ...story, ...formData } : story
      );
      setStories(updatedStories);
    } else {
      // Create new story
      const newStory = {
        ...formData,
        id: stories.length > 0 ? Math.max(...stories.map(s => s.id)) + 1 : 1,
        practiceHistory: []
      };
      setStories([...stories, newStory]);
    }

    resetForm();
  };

  // Edit story
  const editStory = (story) => {
    setFormData({
      title: story.title,
      tags: [...story.tags],
      transcript: story.transcript
    });
    setCurrentStoryId(story.id);
    setIsEditing(true);
  };

  // Delete story
  const deleteStory = (id) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      setStories(stories.filter(story => story.id !== id));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      tags: [],
      transcript: ''
    });
    setNewTag('');
    setIsEditing(false);
    setCurrentStoryId(null);
  };

  // Enter practice mode
  const enterPracticeMode = (story) => {
    setPracticeStory(story);
    setPracticeTimer(0);
    setTimerRunning(false);
    setIsPracticing(true);
    setTranscript('');
    setInterimTranscript('');
    setIsRecording(false);
    setRecordingTime(0);
    setFeedback(null);
  };

  // Exit practice mode
  const exitPracticeMode = () => {
    // Save the transcript before exiting if there's content
    if (transcript.trim() !== '') {
      savePracticeSession();
    }
    
    if (timerRunning) {
      stopPracticeTimer();
    }
    if (isRecording) {
      stopRecording();
    }
    setIsPracticing(false);
    setPracticeStory(null);
  };

  // Start practice timer
  const startPracticeTimer = () => {
    setTimerRunning(true);
  };

  // Stop practice timer
  const stopPracticeTimer = () => {
    setTimerRunning(false);
  };

  // Reset practice timer
  const resetPracticeTimer = () => {
    setPracticeTimer(0);
    setTimerRunning(false);
  };

  // Format time (seconds) to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording
  const startRecording = () => {
    if (!recognitionSupported) return;

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
        setRecordingTime(0);
        // Don't clear transcript here to allow for multiple recording sessions
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(prevTranscript => prevTranscript + finalTranscript);
        setInterimTranscript(interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setRecognitionSupported(false);
        }
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setRecognitionSupported(false);
      setIsRecording(false);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    setIsRecording(false);
  };

  // Check if transcript follows ABT structure
  const hasABTStructure = (text) => {
    if (!text) return false;
    
    const lowerText = text.toLowerCase();
    const hasAnd = /\band\b/i.test(lowerText);
    const hasBut = /\bbut\b/i.test(lowerText);
    const hasTherefore = /\btherefore\b/i.test(lowerText);
    
    return hasAnd && hasBut && hasTherefore;
  };

  // Save practice session
  const savePracticeSession = () => {
    if (!practiceStory) return;
    
    const practiceRecord = {
      date: getTodayDateString(),
      duration: practiceTimer,
      transcript: transcript,
      feedback: feedback ? feedback.type : null
    };
    
    const updatedStories = stories.map(story => {
      if (story.id === practiceStory.id) {
        const updatedHistory = [...(story.practiceHistory || []), practiceRecord];
        return {
          ...story,
          practiceHistory: updatedHistory
        };
      }
      return story;
    });
    
    setStories(updatedStories);
    
    // Update the current practice story
    const updatedPracticeStory = updatedStories.find(s => s.id === practiceStory.id);
    setPracticeStory(updatedPracticeStory);
    
    // Save to localStorage immediately to prevent data loss
    localStorage.setItem('storytellingPracticeStories', JSON.stringify(updatedStories));
  };

  // Move to next story
  const nextPracticeStory = () => {
    savePracticeSession();
    
    const currentIndex = stories.findIndex(s => s.id === practiceStory.id);
    if (currentIndex < stories.length - 1) {
      enterPracticeMode(stories[currentIndex + 1]);
    } else {
      exitPracticeMode();
    }
  };

  // Submit feedback
  const submitFeedback = (type) => {
    let feedbackText = '';
    let feedbackColor = '';
    
    switch (type) {
      case 'excellent':
        feedbackText = 'Excellent! Your story had a clear And-But-Therefore structure with compelling details and good delivery.';
        feedbackColor = '#28a745';
        break;
      case 'good':
        feedbackText = 'Good job! Your story had a clear structure, though there might be room for improvement in delivery or timing.';
        feedbackColor = '#17a2b8';
        break;
      case 'needs-work':
        feedbackText = 'Keep practicing! Focus on clearly highlighting the And, But, Therefore structure and maintaining a concise delivery.';
        feedbackColor = '#ffc107';
        break;
      default:
        feedbackText = 'Feedback submitted.';
        feedbackColor = '#6c757d';
    }
    
    setFeedback({
      text: feedbackText,
      color: feedbackColor,
      type: type,
      timestamp: new Date().toISOString()
    });
    
    // Auto-save the practice session when feedback is submitted
    setTimeout(() => {
      savePracticeSession();
    }, 500);
  };
  
  // Calculate timer progress percentage
  const getTimerProgressPercentage = () => {
    return (practiceTimer / timerDuration) * 100;
  };
  
  // Get timer color based on remaining time
  const getTimerColor = () => {
    const percentage = getTimerProgressPercentage();
    if (percentage < 50) return '#28a745'; // Green
    if (percentage < 80) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };
  
  // Get practice history for a story
  const getPracticeStats = (story) => {
    if (!story.practiceHistory || story.practiceHistory.length === 0) {
      return { count: 0 };
    }
    
    const count = story.practiceHistory.length;
    const lastPracticed = story.practiceHistory[count - 1].date;
    const totalDuration = story.practiceHistory.reduce((sum, record) => sum + record.duration, 0);
    const averageDuration = Math.round(totalDuration / count);
    
    return { count, lastPracticed, averageDuration };
  };
  
  // Helper function to get today's date in YYYY-MM-DD format with timezone handling
  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
        <p>Create and practice interview stories using the ABT (And, But, Therefore) framework.</p>
      </div>
      
      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Practice Mode */}
        {isPracticing ? (
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            borderRadius: '10px',
            padding: '2rem'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h2 style={{ margin: '0 0 0.5rem 0' }}>Practicing: {practiceStory.title}</h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {practiceStory.tags.map(tag => (
                    <span 
                      key={tag}
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.1)', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '20px',
                        fontSize: '0.8rem'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={exitPracticeMode}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Exit Practice
              </button>
            </div>
            
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              padding: '1.5rem',
              borderRadius: '10px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Story Structure</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ 
                    display: 'inline-block',
                    backgroundColor: 'rgba(10,177,150,0.2)',
                    color: '#0AB196',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '5px',
                    marginBottom: '0.5rem'
                  }}>
                    And
                  </div>
                  <p style={{ margin: '0' }}>
                    {practiceStory.transcript.match(/.*?And(.*?)But/is)?.[1] || 'Setup of the situation...'}
                  </p>
                </div>
                
                <div>
                  <div style={{ 
                    display: 'inline-block',
                    backgroundColor: 'rgba(220,53,69,0.2)',
                    color: '#dc3545',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '5px',
                    marginBottom: '0.5rem'
                  }}>
                    But
                  </div>
                  <p style={{ margin: '0' }}>
                    {practiceStory.transcript.match(/But(.*?)Therefore/is)?.[1] || 'The challenge or conflict...'}
                  </p>
                </div>
                
                <div>
                  <div style={{ 
                    display: 'inline-block',
                    backgroundColor: 'rgba(40,167,69,0.2)',
                    color: '#28a745',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '5px',
                    marginBottom: '0.5rem'
                  }}>
                    Therefore
                  </div>
                  <p style={{ margin: '0' }}>
                    {practiceStory.transcript.match(/Therefore(.*)/is)?.[1] || 'The resolution and outcome...'}
                  </p>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Practice Timer</h3>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span>Duration: {formatTime(practiceTimer)} / {formatTime(timerDuration)}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setTimerDuration(Math.max(30, timerDuration - 30))}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    -30s
                  </button>
                  <button 
                    onClick={() => setTimerDuration(timerDuration + 30)}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    +30s
                  </button>
                </div>
              </div>
              
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '1rem'
              }}>
                <div style={{ 
                  width: `${getTimerProgressPercentage()}%`, 
                  height: '100%', 
                  backgroundColor: getTimerColor(),
                  transition: 'width 0.3s ease'
                }} />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                {!timerRunning ? (
                  <button 
                    onClick={startPracticeTimer}
                    style={{
                      backgroundColor: 'rgba(40,167,69,0.2)',
                      border: 'none',
                      color: '#28a745',
                      padding: '8px 16px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Start Timer
                  </button>
                ) : (
                  <button 
                    onClick={stopPracticeTimer}
                    style={{
                      backgroundColor: 'rgba(220,53,69,0.2)',
                      border: 'none',
                      color: '#dc3545',
                      padding: '8px 16px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Stop Timer
                  </button>
                )}
                
                <button 
                  onClick={resetPracticeTimer}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Speech-to-Text Practice</h3>
              {recognitionSupported ? (
                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    marginBottom: '1rem'
                  }}>
                    {!isRecording ? (
                      <button 
                        onClick={startRecording}
                        style={{
                          backgroundColor: 'rgba(40,167,69,0.2)',
                          border: 'none',
                          color: '#28a745',
                          padding: '8px 16px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Start Recording
                      </button>
                    ) : (
                      <button 
                        onClick={stopRecording}
                        style={{
                          backgroundColor: 'rgba(220,53,69,0.2)',
                          border: 'none',
                          color: '#dc3545',
                          padding: '8px 16px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Stop Recording ({formatTime(recordingTime)})
                      </button>
                    )}
                  </div>
                  
                  {/* Live speech-to-text display */}
                  <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)', 
                    padding: '1rem',
                    borderRadius: '5px',
                    marginBottom: '1rem',
                    minHeight: '100px'
                  }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Live Speech-to-Text:</p>
                    
                    {/* Interim transcript (what's being processed) */}
                    {isRecording && interimTranscript && (
                      <div style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)', 
                        padding: '0.5rem',
                        borderRadius: '5px',
                        marginBottom: '0.5rem'
                      }}>
                        <p style={{ margin: 0, fontStyle: 'italic', opacity: 0.7 }}>{interimTranscript}</p>
                      </div>
                    )}
                    
                    {/* Final transcript (what's been recognized) */}
                    <textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder="Your speech will appear here as you speak. You can also edit this text directly."
                      style={{
                        width: '100%',
                        minHeight: '150px',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '5px',
                        resize: 'vertical'
                      }}
                    />
                    
                    {/* ABT Structure Analysis */}
                    {transcript && (
                      <div style={{ 
                        marginTop: '1rem',
                        padding: '0.5rem',
                        borderRadius: '5px',
                        backgroundColor: hasABTStructure(transcript) ? 'rgba(40,167,69,0.1)' : 'rgba(255,193,7,0.1)',
                        color: hasABTStructure(transcript) ? '#28a745' : '#ffc107',
                      }}>
                        {hasABTStructure(transcript) ? (
                          <p style={{ margin: 0 }}>✓ Great job! Your story follows the ABT structure.</p>
                        ) : (
                          <p style={{ margin: 0 }}>
                            ⚠️ Remember to include clear "And", "But", "Therefore" transitions in your story.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Save transcript button */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <button 
                      onClick={savePracticeSession}
                      style={{
                        backgroundColor: 'rgba(10,177,150,0.2)',
                        border: 'none',
                        color: '#0AB196',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Save Transcript
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  backgroundColor: 'rgba(220,53,69,0.1)', 
                  color: '#dc3545',
                  padding: '1rem',
                  borderRadius: '5px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0 }}>
                    Speech recognition is not supported in your browser or microphone access was denied.
                    Please use Chrome or Edge and ensure microphone permissions are granted.
                  </p>
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Feedback</h3>
              
              {feedback ? (
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)', 
                  padding: '1rem',
                  borderRadius: '5px',
                  marginBottom: '1rem'
                }}>
                  <div style={{ 
                    backgroundColor: `${feedback.color}20`, 
                    color: feedback.color,
                    padding: '1rem',
                    borderRadius: '5px',
                    marginBottom: '1rem'
                  }}>
                    <p style={{ margin: 0 }}>{feedback.text}</p>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button 
                      onClick={nextPracticeStory}
                      style={{
                        background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                        border: 'none',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Save & Continue
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ marginBottom: '1rem' }}>How did your practice go? Rate your performance:</p>
                  
                  <div style={{ 
                    display: 'flex', 
                    gap: '1rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                  }}>
                    <button 
                      onClick={() => submitFeedback('excellent')}
                      style={{
                        backgroundColor: 'rgba(40,167,69,0.2)',
                        border: 'none',
                        color: '#28a745',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Excellent
                    </button>
                    
                    <button 
                      onClick={() => submitFeedback('good')}
                      style={{
                        backgroundColor: 'rgba(23,162,184,0.2)',
                        border: 'none',
                        color: '#17a2b8',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Good
                    </button>
                    
                    <button 
                      onClick={() => submitFeedback('needs-work')}
                      style={{
                        backgroundColor: 'rgba(255,193,7,0.2)',
                        border: 'none',
                        color: '#ffc107',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Needs Work
                    </button>
                  </div>
                  
                  {/* Comprehensive Feedback Analysis */}
                  <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)', 
                    padding: '1rem',
                    borderRadius: '5px',
                    marginTop: '1.5rem'
                  }}>
                    <h4 style={{ margin: '0 0 1rem 0' }}>Automated Story Analysis</h4>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>ABT Structure:</p>
                      <div style={{ 
                        display: 'flex', 
                        gap: '0.5rem',
                        alignItems: 'center'
                      }}>
                        <div style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          backgroundColor: hasABTStructure(transcript) ? '#28a745' : '#ffc107',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.8rem'
                        }}>
                          {hasABTStructure(transcript) ? '✓' : '!'}
                        </div>
                        <span>
                          {hasABTStructure(transcript) 
                            ? 'Your story contains all three ABT elements' 
                            : 'Missing one or more ABT elements'}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Duration:</p>
                      <div style={{ 
                        display: 'flex', 
                        gap: '0.5rem',
                        alignItems: 'center'
                      }}>
                        <div style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          backgroundColor: (practiceTimer >= 60 && practiceTimer <= 180) ? '#28a745' : '#ffc107',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.8rem'
                        }}>
                          {(practiceTimer >= 60 && practiceTimer <= 180) ? '✓' : '!'}
                        </div>
                        <span>
                          {formatTime(practiceTimer)} - {(practiceTimer >= 60 && practiceTimer <= 180) 
                            ? 'Optimal duration (1-3 minutes)' 
                            : practiceTimer < 60 ? 'Consider adding more detail' : 'Consider being more concise'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Content Analysis:</p>
                      <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                        {transcript && transcript.split(' ').length < 50 && (
                          <li>Your story is quite brief. Consider adding more details.</li>
                        )}
                        {transcript && transcript.split(' ').length > 300 && (
                          <li>Your story is quite long. Consider making it more concise.</li>
                        )}
                        {transcript && !/\b(I|me|my)\b/i.test(transcript) && (
                          <li>Consider using first-person perspective to make your story more personal.</li>
                        )}
                        {transcript && !/\b(specific|specifically|particular|exact|precise)\b/i.test(transcript) && (
                          <li>Adding specific details and metrics can make your story more impactful.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Story Form */}
            {isEditing ? (
              <div style={{ 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: '10px',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <h2 style={{ margin: '0 0 1.5rem 0' }}>
                  {currentStoryId ? 'Edit Story' : 'Create New Story'}
                </h2>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title:</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter story title"
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
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tags:</label>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    {formData.tags.map(tag => (
                      <div 
                        key={tag}
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.1)', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        {tag}
                        <button 
                          onClick={() => removeTag(tag)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: 'rgba(255,255,255,0.7)',
                            cursor: 'pointer',
                            padding: '0',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newTag.trim() !== '') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="Enter tag"
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '5px'
                      }}
                    />
                    <button 
                      onClick={addTag}
                      style={{
                        backgroundColor: 'rgba(10,177,150,0.2)',
                        border: 'none',
                        color: '#0AB196',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Add Tag
                    </button>
                  </div>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Story Transcript (ABT Format):</label>
                  <textarea 
                    value={formData.transcript}
                    onChange={(e) => handleInputChange('transcript', e.target.value)}
                    placeholder="Start with 'And' to set up the situation, use 'But' to introduce the challenge, and 'Therefore' to describe your solution and outcome."
                    style={{
                      width: '100%',
                      minHeight: '200px',
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '5px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button 
                    onClick={resetForm}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveStory}
                    style={{
                      background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                      border: 'none',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Save Story
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                marginBottom: '1.5rem'
              }}>
                <button 
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                    border: 'none',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Create New Story
                </button>
              </div>
            )}
            
            {/* Stories List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {stories.length > 0 ? (
                stories.map(story => {
                  const stats = getPracticeStats(story);
                  
                  return (
                    <div 
                      key={story.id}
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.1)', 
                        borderRadius: '10px',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{ padding: '1.5rem' }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          marginBottom: '1rem',
                          flexWrap: 'wrap',
                          gap: '1rem'
                        }}>
                          <div>
                            <h3 style={{ margin: '0 0 0.5rem 0' }}>{story.title}</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                              {story.tags.map(tag => (
                                <span 
                                  key={tag}
                                  style={{ 
                                    backgroundColor: 'rgba(255,255,255,0.1)', 
                                    padding: '0.25rem 0.5rem', 
                                    borderRadius: '20px',
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => enterPracticeMode(story)}
                              style={{
                                backgroundColor: 'rgba(10,177,150,0.2)',
                                border: 'none',
                                color: '#0AB196',
                                padding: '8px 16px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                              }}
                            >
                              Practice
                            </button>
                            <button 
                              onClick={() => editStory(story)}
                              style={{
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '5px',
                                cursor: 'pointer'
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => deleteStory(story.id)}
                              style={{
                                backgroundColor: 'rgba(220,53,69,0.2)',
                                border: 'none',
                                color: '#dc3545',
                                padding: '8px 16px',
                                borderRadius: '5px',
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        
                        <div style={{ 
                          backgroundColor: 'rgba(255,255,255,0.05)', 
                          padding: '1rem',
                          borderRadius: '5px',
                          marginBottom: '1rem'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div>
                              <span style={{ 
                                display: 'inline-block',
                                backgroundColor: 'rgba(10,177,150,0.2)',
                                color: '#0AB196',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '5px',
                                marginRight: '0.5rem'
                              }}>
                                And
                              </span>
                              <span>
                                {story.transcript.match(/.*?And(.*?)But/is)?.[1] || 'Setup of the situation...'}
                              </span>
                            </div>
                            
                            <div>
                              <span style={{ 
                                display: 'inline-block',
                                backgroundColor: 'rgba(220,53,69,0.2)',
                                color: '#dc3545',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '5px',
                                marginRight: '0.5rem'
                              }}>
                                But
                              </span>
                              <span>
                                {story.transcript.match(/But(.*?)Therefore/is)?.[1] || 'The challenge or conflict...'}
                              </span>
                            </div>
                            
                            <div>
                              <span style={{ 
                                display: 'inline-block',
                                backgroundColor: 'rgba(40,167,69,0.2)',
                                color: '#28a745',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '5px',
                                marginRight: '0.5rem'
                              }}>
                                Therefore
                              </span>
                              <span>
                                {story.transcript.match(/Therefore(.*)/is)?.[1] || 'The resolution and outcome...'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '1rem'
                        }}>
                          <div>
                            <strong>Practice Stats:</strong> {stats.count > 0 ? (
                              <span>
                                {stats.count} {stats.count === 1 ? 'session' : 'sessions'}, 
                                avg. {stats.averageDuration}s, 
                                last: {formatDate(stats.lastPracticed)}
                              </span>
                            ) : (
                              <span>No practice sessions yet</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '10px',
                  padding: '2rem',
                  textAlign: 'center'
                }}>
                  <p style={{ marginBottom: '1rem' }}>You haven't created any stories yet.</p>
                  <button 
                    onClick={() => setIsEditing(true)}
                    style={{
                      background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                      border: 'none',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Create Your First Story
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorytellingPractice;
