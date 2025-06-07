import React, { useState, useEffect } from 'react';

const StorytellingPractice = () => {
  // State for stories
  const [stories, setStories] = useState(() => {
    const savedStories = localStorage.getItem('storytellingPracticeStories');
    return savedStories ? JSON.parse(savedStories) : [];
  });
  
  // State for new story
  const [newStory, setNewStory] = useState({
    title: '',
    tags: [],
    transcript: '',
    practiceHistory: []
  });
  
  // State for practice mode
  const [isPracticing, setIsPracticing] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(null);
  const [practiceTranscript, setPracticeTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [practiceTimer, setPracticeTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [selfRating, setSelfRating] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  
  // Refs for speech recognition
  const recognitionRef = React.useRef(null);
  const isRecognitionSupportedRef = React.useRef(
    typeof window !== 'undefined' && 
    (window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  
  // Save stories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('storytellingPracticeStories', JSON.stringify(stories));
  }, [stories]);
  
  // Initialize speech recognition
  useEffect(() => {
    if (isRecognitionSupportedRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = practiceTranscript;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        setPracticeTranscript(finalTranscript);
        setInterimTranscript(interimTranscript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone access is required for speech-to-text functionality. Please allow microphone access and try again.');
        }
        stopRecording();
      };
      
      recognitionRef.current.onend = () => {
        if (isRecording) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Error restarting speech recognition', e);
            setIsRecording(false);
          }
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping speech recognition', e);
        }
      }
      
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [practiceTranscript, isRecording, timerInterval]);
  
  // Handle input changes for new story
  const handleInputChange = (field, value) => {
    setNewStory({
      ...newStory,
      [field]: value
    });
  };
  
  // Handle tag input
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      const newTag = e.target.value.trim();
      if (!newStory.tags.includes(newTag)) {
        setNewStory({
          ...newStory,
          tags: [...newStory.tags, newTag]
        });
      }
      e.target.value = '';
    }
  };
  
  // Remove tag
  const removeTag = (tagToRemove) => {
    setNewStory({
      ...newStory,
      tags: newStory.tags.filter(tag => tag !== tagToRemove)
    });
  };
  
  // Save new story
  const saveStory = () => {
    if (newStory.title.trim() === '' || newStory.transcript.trim() === '') {
      alert('Please enter a title and transcript for your story.');
      return;
    }
    
    const storyToSave = {
      ...newStory,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setStories([...stories, storyToSave]);
    
    // Reset form
    setNewStory({
      title: '',
      tags: [],
      transcript: '',
      practiceHistory: []
    });
  };
  
  // Delete story
  const deleteStory = (id) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      setStories(stories.filter(story => story.id !== id));
    }
  };
  
  // Start practice mode
  const startPractice = (index) => {
    setCurrentStoryIndex(index);
    setPracticeTranscript('');
    setInterimTranscript('');
    setIsRecording(false);
    setPracticeTimer(0);
    setSelfRating(null);
    setShowFeedback(false);
    setFeedbackData(null);
    setIsPracticing(true);
    
    // Start timer
    const interval = setInterval(() => {
      setPracticeTimer(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };
  
  // Exit practice mode
  const exitPractice = () => {
    // Save transcript if there's content
    if (practiceTranscript.trim() !== '') {
      saveTranscript();
    }
    
    // Clean up
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    if (isRecording) {
      stopRecording();
    }
    
    setIsPracticing(false);
    setCurrentStoryIndex(null);
  };
  
  // Start recording
  const startRecording = () => {
    if (!isRecognitionSupportedRef.current) {
      alert('Speech recognition is not supported in your browser. Please try using Chrome, Edge, or Safari.');
      return;
    }
    
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (e) {
      console.error('Error starting speech recognition', e);
      alert('Error starting speech recognition. Please try again.');
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping speech recognition', e);
      }
    }
    setIsRecording(false);
  };
  
  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Save practice transcript
  const saveTranscript = () => {
    if (currentStoryIndex === null || practiceTranscript.trim() === '') return;
    
    const updatedStories = [...stories];
    const currentStory = updatedStories[currentStoryIndex];
    
    // Create practice record
    const practiceRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration: practiceTimer,
      transcript: practiceTranscript,
      selfRating: selfRating,
      feedback: feedbackData
    };
    
    // Add to practice history
    if (!currentStory.practiceHistory) {
      currentStory.practiceHistory = [];
    }
    
    currentStory.practiceHistory.push(practiceRecord);
    updatedStories[currentStoryIndex] = currentStory;
    
    setStories(updatedStories);
    localStorage.setItem('storytellingPracticeStories', JSON.stringify(updatedStories));
    
    alert('Practice session saved successfully!');
  };
  
  // Submit self-rating and generate feedback
  const submitRating = (rating) => {
    setSelfRating(rating);
    
    // Generate automated feedback
    const feedback = generateFeedback(practiceTranscript, stories[currentStoryIndex].transcript);
    setFeedbackData(feedback);
    setShowFeedback(true);
    
    // Stop timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };
  
  // Generate automated feedback
  const generateFeedback = (practiceText, originalText) => {
    const feedback = {
      abtStructure: {
        hasAnd: false,
        hasBut: false,
        hasTherefore: false,
        score: 0,
        suggestions: []
      },
      content: {
        similarity: 0,
        missingKeyElements: [],
        additionalElements: [],
        suggestions: []
      },
      delivery: {
        duration: practiceTimer,
        optimalDuration: {
          min: 60,
          max: 120
        },
        pacing: '',
        suggestions: []
      }
    };
    
    // Check ABT structure
    const practiceTextLower = practiceText.toLowerCase();
    
    // Look for "and" section (setup)
    const andPatterns = [
      'and',
      'initially',
      'at first',
      'to begin with',
      'starting out',
      'in the beginning'
    ];
    
    feedback.abtStructure.hasAnd = andPatterns.some(pattern => 
      practiceTextLower.includes(pattern)
    );
    
    // Look for "but" section (conflict/complication)
    const butPatterns = [
      'but',
      'however',
      'unfortunately',
      'suddenly',
      'unexpectedly',
      'the problem was',
      'the challenge was',
      'the issue was'
    ];
    
    feedback.abtStructure.hasBut = butPatterns.some(pattern => 
      practiceTextLower.includes(pattern)
    );
    
    // Look for "therefore" section (resolution)
    const thereforePatterns = [
      'therefore',
      'as a result',
      'consequently',
      'so',
      'thus',
      'this led to',
      'this resulted in',
      'in the end',
      'finally',
      'ultimately'
    ];
    
    feedback.abtStructure.hasTherefore = thereforePatterns.some(pattern => 
      practiceTextLower.includes(pattern)
    );
    
    // Calculate ABT score
    feedback.abtStructure.score = 
      (feedback.abtStructure.hasAnd ? 1 : 0) + 
      (feedback.abtStructure.hasBut ? 1 : 0) + 
      (feedback.abtStructure.hasTherefore ? 1 : 0);
    
    // Generate ABT suggestions
    if (!feedback.abtStructure.hasAnd) {
      feedback.abtStructure.suggestions.push(
        "Your story is missing a clear setup ('And' section). Start by establishing the normal situation or context."
      );
    }
    
    if (!feedback.abtStructure.hasBut) {
      feedback.abtStructure.suggestions.push(
        "Your story lacks a clear complication or conflict ('But' section). Include a challenge, problem, or turning point."
      );
    }
    
    if (!feedback.abtStructure.hasTherefore) {
      feedback.abtStructure.suggestions.push(
        "Your story doesn't have a clear resolution ('Therefore' section). Conclude with the outcome or what you learned."
      );
    }
    
    // Content analysis
    // Simple similarity check (word overlap)
    const originalWords = new Set(originalText.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const practiceWords = new Set(practiceText.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    
    const commonWords = [...originalWords].filter(word => practiceWords.has(word));
    
    if (originalWords.size > 0) {
      feedback.content.similarity = Math.round((commonWords.length / originalWords.size) * 100);
    }
    
    // Check for missing key elements
    const missingWords = [...originalWords].filter(word => !practiceWords.has(word));
    if (missingWords.length > 0) {
      // Take up to 5 significant missing words
      feedback.content.missingKeyElements = missingWords
        .slice(0, 5)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1));
    }
    
    // Check for additional elements
    const additionalWords = [...practiceWords].filter(word => !originalWords.has(word));
    if (additionalWords.length > 0) {
      // Take up to 5 significant additional words
      feedback.content.additionalElements = additionalWords
        .slice(0, 5)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1));
    }
    
    // Generate content suggestions
    if (feedback.content.similarity < 50) {
      feedback.content.suggestions.push(
        "Your practice version differs significantly from the original story. Try to include more key elements from your prepared story."
      );
    } else if (feedback.content.similarity < 80) {
      feedback.content.suggestions.push(
        "Your practice version captures some elements of the original story, but could be more consistent. Focus on including key details."
      );
    } else {
      feedback.content.suggestions.push(
        "Great job maintaining consistency with your original story!"
      );
    }
    
    if (feedback.content.missingKeyElements.length > 0) {
      feedback.content.suggestions.push(
        `Consider including these key elements that were missing: ${feedback.content.missingKeyElements.join(', ')}.`
      );
    }
    
    // Delivery analysis
    if (feedback.delivery.duration < feedback.delivery.optimalDuration.min) {
      feedback.delivery.pacing = 'Too brief';
      feedback.delivery.suggestions.push(
        `Your delivery was quite brief (${formatTime(feedback.delivery.duration)}). Aim for at least ${formatTime(feedback.delivery.optimalDuration.min)} to fully develop your story.`
      );
    } else if (feedback.delivery.duration > feedback.delivery.optimalDuration.max) {
      feedback.delivery.pacing = 'Too long';
      feedback.delivery.suggestions.push(
        `Your delivery was quite long (${formatTime(feedback.delivery.duration)}). Try to be more concise, aiming for under ${formatTime(feedback.delivery.optimalDuration.max)}.`
      );
    } else {
      feedback.delivery.pacing = 'Good';
      feedback.delivery.suggestions.push(
        `Great job with timing! Your delivery (${formatTime(feedback.delivery.duration)}) was within the optimal range.`
      );
    }
    
    return feedback;
  };
  
  // Handle transcript edit
  const handleTranscriptEdit = (e) => {
    setPracticeTranscript(e.target.value);
  };
  
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {!isPracticing ? (
        // Story List View
        <>
          <h1 style={{ 
            background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 'bold',
            marginBottom: '2rem'
          }}>
            Storytelling Practice
          </h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            {/* New Story Form */}
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: '1.5rem', 
              borderRadius: '10px',
              height: 'fit-content'
            }}>
              <h2>Add New Story</h2>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title:</label>
                <input 
                  type="text" 
                  value={newStory.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Give your story a title"
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
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tags:</label>
                <input 
                  type="text" 
                  onKeyDown={handleTagInput}
                  placeholder="Type tag and press Enter"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px'
                  }}
                />
                
                {newStory.tags.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                  }}>
                    {newStory.tags.map((tag, index) => (
                      <span 
                        key={index}
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.1)', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        {tag}
                        <button 
                          onClick={() => removeTag(tag)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.7)',
                            cursor: 'pointer',
                            padding: '0',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%'
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Story Transcript:</label>
                <textarea 
                  value={newStory.transcript}
                  onChange={(e) => handleInputChange('transcript', e.target.value)}
                  placeholder="Write your story here using the ABT (And, But, Therefore) framework..."
                  rows={10}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px',
                    resize: 'vertical'
                  }}
                />
                
                <div style={{ 
                  backgroundColor: 'rgba(10,177,150,0.1)', 
                  padding: '1rem', 
                  borderRadius: '5px',
                  marginTop: '1rem',
                  fontSize: '0.9rem'
                }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>ABT Framework Tips:</p>
                  <ul style={{ margin: '0', paddingLeft: '1.5rem' }}>
                    <li><strong>And:</strong> Set up the normal situation or context</li>
                    <li><strong>But:</strong> Introduce a complication, challenge, or conflict</li>
                    <li><strong>Therefore:</strong> Resolve the situation and share the outcome or lesson</li>
                  </ul>
                </div>
              </div>
              
              <button 
                onClick={saveStory}
                style={{
                  width: '100%',
                  background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                  border: 'none',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Save Story
              </button>
            </div>
            
            {/* Stories List */}
            <div>
              <h2>Your Stories</h2>
              
              {stories.length > 0 ? (
                stories.map((story, index) => (
                  <div 
                    key={story.id}
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)', 
                      padding: '1.5rem', 
                      borderRadius: '10px',
                      marginBottom: '1rem'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
                    }}>
                      <h3 style={{ margin: '0' }}>{story.title}</h3>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => startPractice(index)}
                          style={{
                            backgroundColor: 'rgba(10,177,150,0.2)',
                            border: 'none',
                            color: '#0AB196',
                            padding: '0.5rem 1rem',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          Practice
                        </button>
                        <button 
                          onClick={() => deleteStory(story.id)}
                          style={{
                            backgroundColor: 'rgba(220,53,69,0.2)',
                            border: 'none',
                            color: '#dc3545',
                            padding: '0.5rem',
                            borderRadius: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    {story.tags && story.tags.length > 0 && (
                      <div style={{ 
                        display: 'flex', 
                        gap: '0.5rem', 
                        flexWrap: 'wrap',
                        marginBottom: '1rem'
                      }}>
                        {story.tags.map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
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
                    )}
                    
                    <div style={{ 
                      whiteSpace: 'pre-line',
                      marginBottom: '1rem',
                      maxHeight: '100px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      {story.transcript}
                      <div style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        right: 0, 
                        height: '50px', 
                        background: 'linear-gradient(transparent, rgba(30,30,30,1))'
                      }} />
                    </div>
                    
                    {story.practiceHistory && story.practiceHistory.length > 0 && (
                      <div>
                        <p style={{ 
                          margin: '0 0 0.5rem 0',
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}>
                          Practice History:
                        </p>
                        <div style={{ 
                          display: 'flex', 
                          gap: '0.5rem',
                          flexWrap: 'wrap'
                        }}>
                          {story.practiceHistory.map((practice, practiceIndex) => (
                            <div 
                              key={practice.id || practiceIndex}
                              style={{ 
                                backgroundColor: 'rgba(255,255,255,0.05)', 
                                padding: '0.5rem', 
                                borderRadius: '5px',
                                fontSize: '0.8rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem'
                              }}
                            >
                              <span>
                                {new Date(practice.date).toLocaleDateString()}
                              </span>
                              <span>
                                Duration: {formatTime(practice.duration)}
                              </span>
                              {practice.selfRating && (
                                <span>
                                  Rating: {
                                    practice.selfRating === 'excellent' ? '⭐⭐⭐' :
                                    practice.selfRating === 'good' ? '⭐⭐' : '⭐'
                                  }
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  padding: '1.5rem', 
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <p>No stories yet. Add your first story to get started!</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        // Practice Mode View
        <>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h1 style={{ 
              background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 'bold',
              margin: 0
            }}>
              Practice: {stories[currentStoryIndex].title}
            </h1>
            
            <button 
              onClick={exitPractice}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Exit Practice
            </button>
          </div>
          
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
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{ 
                  backgroundColor: isRecording ? 'rgba(220,53,69,0.2)' : 'rgba(10,177,150,0.2)',
                  color: isRecording ? '#dc3545' : '#0AB196',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ 
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: isRecording ? '#dc3545' : '#0AB196',
                    animation: isRecording ? 'pulse 1.5s infinite' : 'none'
                  }} />
                  {isRecording ? 'Recording...' : 'Not Recording'}
                </div>
                
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  fontWeight: 'bold'
                }}>
                  Time: {formatTime(practiceTimer)}
                </div>
              </div>
              
              <button 
                onClick={toggleRecording}
                style={{
                  backgroundColor: isRecording ? 'rgba(220,53,69,0.2)' : 'rgba(10,177,150,0.2)',
                  border: 'none',
                  color: isRecording ? '#dc3545' : '#0AB196',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Speech-to-Text Result:</label>
              <textarea 
                value={practiceTranscript}
                onChange={handleTranscriptEdit}
                placeholder="Your speech will appear here as you speak..."
                rows={8}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '5px',
                  resize: 'vertical'
                }}
              />
              
              {interimTranscript && (
                <div style={{ 
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '5px',
                  color: 'rgba(255,255,255,0.7)',
                  fontStyle: 'italic'
                }}>
                  {interimTranscript}
                </div>
              )}
            </div>
            
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button 
                onClick={() => saveTranscript()}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Save Transcript
              </button>
              
              {!showFeedback && (
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>Rate your performance:</span>
                  <button 
                    onClick={() => submitRating('excellent')}
                    style={{
                      backgroundColor: 'rgba(10,177,150,0.2)',
                      border: 'none',
                      color: '#0AB196',
                      padding: '0.5rem',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Excellent
                  </button>
                  <button 
                    onClick={() => submitRating('good')}
                    style={{
                      backgroundColor: 'rgba(255,193,7,0.2)',
                      border: 'none',
                      color: '#ffc107',
                      padding: '0.5rem',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Good
                  </button>
                  <button 
                    onClick={() => submitRating('needs_work')}
                    style={{
                      backgroundColor: 'rgba(220,53,69,0.2)',
                      border: 'none',
                      color: '#dc3545',
                      padding: '0.5rem',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Needs Work
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Original Story Reference */}
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            padding: '1.5rem', 
            borderRadius: '10px',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Original Story</h3>
            <div style={{ whiteSpace: 'pre-line' }}>
              {stories[currentStoryIndex].transcript}
            </div>
          </div>
          
          {/* Feedback Section */}
          {showFeedback && feedbackData && (
            <div style={{ 
              backgroundColor: 'rgba(10,177,150,0.1)', 
              padding: '1.5rem', 
              borderRadius: '10px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>Feedback</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>ABT Structure</h4>
                <div style={{ 
                  display: 'flex',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ 
                    backgroundColor: feedbackData.abtStructure.hasAnd ? 'rgba(10,177,150,0.2)' : 'rgba(220,53,69,0.2)',
                    color: feedbackData.abtStructure.hasAnd ? '#0AB196' : '#dc3545',
                    padding: '0.5rem',
                    borderRadius: '5px',
                    fontWeight: 'bold',
                    flex: 1,
                    textAlign: 'center'
                  }}>
                    And {feedbackData.abtStructure.hasAnd ? '✓' : '✗'}
                  </div>
                  <div style={{ 
                    backgroundColor: feedbackData.abtStructure.hasBut ? 'rgba(10,177,150,0.2)' : 'rgba(220,53,69,0.2)',
                    color: feedbackData.abtStructure.hasBut ? '#0AB196' : '#dc3545',
                    padding: '0.5rem',
                    borderRadius: '5px',
                    fontWeight: 'bold',
                    flex: 1,
                    textAlign: 'center'
                  }}>
                    But {feedbackData.abtStructure.hasBut ? '✓' : '✗'}
                  </div>
                  <div style={{ 
                    backgroundColor: feedbackData.abtStructure.hasTherefore ? 'rgba(10,177,150,0.2)' : 'rgba(220,53,69,0.2)',
                    color: feedbackData.abtStructure.hasTherefore ? '#0AB196' : '#dc3545',
                    padding: '0.5rem',
                    borderRadius: '5px',
                    fontWeight: 'bold',
                    flex: 1,
                    textAlign: 'center'
                  }}>
                    Therefore {feedbackData.abtStructure.hasTherefore ? '✓' : '✗'}
                  </div>
                </div>
                
                {feedbackData.abtStructure.suggestions.map((suggestion, index) => (
                  <p key={index} style={{ margin: '0.5rem 0' }}>• {suggestion}</p>
                ))}
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Content</h4>
                <p>Similarity to original: <strong>{feedbackData.content.similarity}%</strong></p>
                
                {feedbackData.content.missingKeyElements.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p style={{ margin: '0 0 0.25rem 0' }}>Missing key elements:</p>
                    <div style={{ 
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      {feedbackData.content.missingKeyElements.map((element, index) => (
                        <span 
                          key={index}
                          style={{ 
                            backgroundColor: 'rgba(220,53,69,0.2)',
                            color: '#dc3545',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '5px',
                            fontSize: '0.8rem'
                          }}
                        >
                          {element}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {feedbackData.content.suggestions.map((suggestion, index) => (
                  <p key={index} style={{ margin: '0.5rem 0' }}>• {suggestion}</p>
                ))}
              </div>
              
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Delivery</h4>
                <p>Duration: <strong>{formatTime(feedbackData.delivery.duration)}</strong> (Optimal: {formatTime(feedbackData.delivery.optimalDuration.min)} - {formatTime(feedbackData.delivery.optimalDuration.max)})</p>
                <p>Pacing: <strong>{feedbackData.delivery.pacing}</strong></p>
                
                {feedbackData.delivery.suggestions.map((suggestion, index) => (
                  <p key={index} style={{ margin: '0.5rem 0' }}>• {suggestion}</p>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      <style jsx global>{`
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
