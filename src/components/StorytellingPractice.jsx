import React, { useState, useEffect, useRef } from 'react';

const StorytellingPractice = () => {
  // State for recording
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState('');
  
  // State for stories
  const [stories, setStories] = useState([
    {
      id: 1,
      title: 'Leadership Challenge',
      transcript: 'I was leading a cross-functional team on a critical project with a tight deadline. And we were making good progress until we hit a major technical roadblock that threatened to derail the entire project. But instead of panicking, I organized an emergency problem-solving session with key team members. Therefore, we were able to identify an alternative approach that not only solved the issue but actually improved our final deliverable. This experience taught me the importance of staying calm under pressure and leveraging diverse perspectives when facing challenges.',
      date: '2025-05-28',
      duration: 65,
      tags: ['leadership', 'problem-solving', 'teamwork'],
      audioURL: null
    },
    {
      id: 2,
      title: 'Innovation Initiative',
      transcript: 'I noticed our team was using an inefficient process for client onboarding. And this was causing delays and frustration for both our team and new clients. But I knew there had to be a better way, so I researched alternatives and developed a streamlined digital solution. Therefore, we reduced onboarding time by 40% and significantly improved client satisfaction scores. This initiative demonstrated my ability to identify problems, take initiative, and implement effective solutions.',
      date: '2025-06-01',
      duration: 58,
      tags: ['innovation', 'initiative', 'process-improvement'],
      audioURL: null
    }
  ]);
  
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [currentStory, setCurrentStory] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    transcript: '',
    tags: []
  });
  
  // State for speech recognition
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  
  // State for audio recording
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // Speech recognition reference
  const recognitionRef = useRef(null);
  
  // Timer reference
  const timerRef = useRef(null);
  
  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = transcript;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += ' ' + transcriptText;
          } else {
            interimTranscript += transcriptText;
          }
        }
        
        setTranscript(finalTranscript);
        setInterimTranscript(interimTranscript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setRecognitionSupported(false);
        }
      };
    } else {
      setRecognitionSupported(false);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [transcript]);
  
  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      };
      
      mediaRecorderRef.current.start();
      
      if (recognitionRef.current && recognitionSupported) {
        recognitionRef.current.start();
      }
      
      setIsRecording(true);
      setRecordingTime(0);
      setTranscript('');
      setInterimTranscript('');
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone', error);
      alert('Unable to access microphone. Please check your browser permissions.');
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    if (recognitionRef.current && recognitionSupported) {
      recognitionRef.current.stop();
    }
    
    clearInterval(timerRef.current);
    setIsRecording(false);
  };
  
  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Save story
  const saveStory = () => {
    if (formData.title.trim() === '') {
      alert('Please enter a title for your story.');
      return;
    }
    
    const now = new Date();
    
    if (currentStory) {
      // Update existing story
      const updatedStories = stories.map(story => 
        story.id === currentStory.id ? 
          { 
            ...story, 
            title: formData.title,
            transcript: formData.transcript,
            tags: formData.tags,
            audioURL: audioURL || story.audioURL
          } : 
          story
      );
      
      setStories(updatedStories);
    } else {
      // Create new story
      const newStory = {
        id: stories.length > 0 ? Math.max(...stories.map(s => s.id)) + 1 : 1,
        title: formData.title,
        transcript: formData.transcript || transcript,
        date: now.toISOString().split('T')[0],
        duration: recordingTime,
        tags: formData.tags,
        audioURL: audioURL
      };
      
      setStories([...stories, newStory]);
    }
    
    resetForm();
  };
  
  // Edit story
  const editStory = (story) => {
    setCurrentStory(story);
    setFormData({
      title: story.title,
      transcript: story.transcript,
      tags: story.tags || []
    });
    setAudioURL(story.audioURL);
    setIsEditing(true);
  };
  
  // Delete story
  const deleteStory = (id) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      setStories(stories.filter(story => story.id !== id));
      resetForm();
    }
  };
  
  // Reset form
  const resetForm = () => {
    setCurrentStory(null);
    setFormData({
      title: '',
      transcript: '',
      tags: []
    });
    setAudioURL('');
    setIsEditing(false);
  };
  
  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Handle tag input
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      if (!formData.tags.includes(e.target.value.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, e.target.value.trim()]
        });
      }
      e.target.value = '';
    }
  };
  
  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Check if story has ABT structure
  const hasABTStructure = (text) => {
    // Simple check for "And", "But", "Therefore" keywords
    const andPattern = /\band\b/i;
    const butPattern = /\bbut\b/i;
    const thereforePattern = /\btherefore\b/i;
    
    return andPattern.test(text) && butPattern.test(text) && thereforePattern.test(text);
  };
  
  // Generate report for a story
  const generateStoryReport = (story) => {
    // In a real implementation, this would generate a downloadable report
    // For now, we'll just show an alert
    alert(`Report generated for story: ${story.title}`);
  };
  
  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
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
      
      <div style={{ marginBottom: '2rem' }}>
        <p>Practice and refine your professional stories using the ABT (And, But, Therefore) framework.</p>
      </div>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Story List */}
        <div style={{ 
          width: '300px', 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          height: 'fit-content',
          flexShrink: 0
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2 style={{ margin: 0 }}>Your Stories</h2>
            <button 
              onClick={() => setIsEditing(true)}
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
              New Story
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stories.map(story => (
              <div 
                key={story.id}
                style={{ 
                  backgroundColor: currentStory?.id === story.id ? 'rgba(10,177,150,0.2)' : 'rgba(255,255,255,0.05)', 
                  padding: '1rem', 
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => editStory(story)}
              >
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{story.title}</h3>
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                  {formatDate(story.date)} • {formatTime(story.duration)}
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {hasABTStructure(story.transcript) ? (
                    <span style={{ 
                      backgroundColor: 'rgba(10,177,150,0.2)', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '20px',
                      fontSize: '0.8rem'
                    }}>
                      ABT Structure ✓
                    </span>
                  ) : (
                    <span style={{ 
                      backgroundColor: 'rgba(220,53,69,0.2)', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '20px',
                      fontSize: '0.8rem'
                    }}>
                      Missing ABT
                    </span>
                  )}
                  
                  {story.tags && story.tags.slice(0, 1).map(tag => (
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
                  
                  {story.tags && story.tags.length > 1 && (
                    <span style={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '20px',
                      fontSize: '0.8rem'
                    }}>
                      +{story.tags.length - 1}
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {stories.length === 0 && (
              <p>No stories yet. Click "New Story" to get started.</p>
            )}
          </div>
        </div>
        
        {/* Recording/Editing Area */}
        <div style={{ 
          flex: 1, 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          minWidth: '300px'
        }}>
          {isEditing ? (
            /* Story Form */
            <div>
              <h2>{currentStory ? 'Edit Story' : 'New Story'}</h2>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title:</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter a title for your story"
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
              
              {!currentStory && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Record Your Story:</label>
                  
                  {recognitionSupported ? (
                    <div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem'
                      }}>
                        <button 
                          onClick={isRecording ? stopRecording : startRecording}
                          style={{
                            backgroundColor: isRecording ? '#dc3545' : '#0AB196',
                            border: 'none',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          {isRecording ? 'Stop Recording' : 'Start Recording'}
                        </button>
                        
                        {isRecording && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <div style={{ 
                              width: '12px',
                              height: '12px',
                              backgroundColor: '#dc3545',
                              borderRadius: '50%',
                              animation: 'pulse 1.5s infinite'
                            }} />
                            <span>{formatTime(recordingTime)}</span>
                          </div>
                        )}
                      </div>
                      
                      {isRecording && (
                        <div style={{ 
                          backgroundColor: 'rgba(255,255,255,0.05)', 
                          padding: '1rem', 
                          borderRadius: '5px',
                          marginBottom: '1rem'
                        }}>
                          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            Remember the ABT Framework:
                          </p>
                          <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                            <li><strong>And:</strong> Set the scene and provide context</li>
                            <li><strong>But:</strong> Introduce the challenge or conflict</li>
                            <li><strong>Therefore:</strong> Explain the resolution and outcome</li>
                          </ul>
                        </div>
                      )}
                      
                      {audioURL && (
                        <div style={{ marginBottom: '1rem' }}>
                          <audio src={audioURL} controls style={{ width: '100%' }} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ 
                      backgroundColor: 'rgba(220,53,69,0.1)', 
                      border: '1px solid #dc3545',
                      color: '#dc3545',
                      padding: '1rem',
                      borderRadius: '5px'
                    }}>
                      <p>
                        Speech recognition is not supported in your browser or microphone access was denied. 
                        Please try using Chrome or Edge, or check your microphone permissions.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Transcript {isRecording && <span style={{ opacity: 0.7 }}>(Live transcription)</span>}:
                </label>
                <textarea 
                  value={currentStory ? formData.transcript : (formData.transcript || transcript)}
                  onChange={(e) => handleInputChange('transcript', e.target.value)}
                  placeholder="Enter or edit your story transcript here..."
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    fontSize: '1rem'
                  }}
                />
                
                {interimTranscript && (
                  <div style={{ 
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '5px',
                    fontStyle: 'italic',
                    opacity: 0.8
                  }}>
                    {interimTranscript}
                  </div>
                )}
                
                {(formData.transcript || transcript) && (
                  <div style={{ marginTop: '0.5rem' }}>
                    {hasABTStructure(formData.transcript || transcript) ? (
                      <div style={{ 
                        backgroundColor: 'rgba(10,177,150,0.1)', 
                        border: '1px solid #0AB196',
                        color: '#0AB196',
                        padding: '0.5rem',
                        borderRadius: '5px'
                      }}>
                        ✓ Your story follows the ABT framework!
                      </div>
                    ) : (
                      <div style={{ 
                        backgroundColor: 'rgba(255,193,7,0.1)', 
                        border: '1px solid #ffc107',
                        color: '#ffc107',
                        padding: '0.5rem',
                        borderRadius: '5px'
                      }}>
                        Your story is missing elements of the ABT framework. Try to include:
                        <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0 0 0' }}>
                          <li>And: Set the scene and provide context</li>
                          <li>But: Introduce the challenge or conflict</li>
                          <li>Therefore: Explain the resolution and outcome</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tags:</label>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  {formData.tags.map(tag => (
                    <span 
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
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          padding: '0',
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                
                <input 
                  type="text" 
                  placeholder="Type a tag and press Enter"
                  onKeyDown={handleTagInput}
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
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  {currentStory && (
                    <button 
                      onClick={() => deleteStory(currentStory.id)}
                      style={{
                        backgroundColor: 'rgba(220,53,69,0.2)',
                        border: '1px solid #dc3545',
                        color: '#dc3545',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={resetForm}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
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
            </div>
          ) : currentStory ? (
            /* Story Details */
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{ margin: 0 }}>{currentStory.title}</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => generateStoryReport(currentStory)}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Generate Report
                  </button>
                  
                  <button 
                    onClick={() => editStory(currentStory)}
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
                    Edit
                  </button>
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                  {formatDate(currentStory.date)} • {formatTime(currentStory.duration)}
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {hasABTStructure(currentStory.transcript) ? (
                    <span style={{ 
                      backgroundColor: 'rgba(10,177,150,0.2)', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '20px',
                      fontSize: '0.8rem'
                    }}>
                      ABT Structure ✓
                    </span>
                  ) : (
                    <span style={{ 
                      backgroundColor: 'rgba(220,53,69,0.2)', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '20px',
                      fontSize: '0.8rem'
                    }}>
                      Missing ABT
                    </span>
                  )}
                  
                  {currentStory.tags && currentStory.tags.map(tag => (
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
              
              {currentStory.audioURL && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3>Audio Recording</h3>
                  <audio src={currentStory.audioURL} controls style={{ width: '100%' }} />
                </div>
              )}
              
              <div>
                <h3>Transcript</h3>
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)', 
                  padding: '1rem', 
                  borderRadius: '5px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {currentStory.transcript}
                </div>
              </div>
              
              {hasABTStructure(currentStory.transcript) && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h3>ABT Structure Analysis</h3>
                  <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)', 
                    padding: '1rem', 
                    borderRadius: '5px'
                  }}>
                    <p>
                      Your story follows the ABT (And, But, Therefore) framework, which is an effective 
                      storytelling structure that engages listeners and makes your story memorable.
                    </p>
                    
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>And (Context)</h4>
                        <div style={{ 
                          backgroundColor: 'rgba(255,255,255,0.05)', 
                          padding: '0.5rem', 
                          borderRadius: '5px'
                        }}>
                          {currentStory.transcript.split(/\bbut\b/i)[0]}
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>But (Conflict)</h4>
                        <div style={{ 
                          backgroundColor: 'rgba(255,255,255,0.05)', 
                          padding: '0.5rem', 
                          borderRadius: '5px'
                        }}>
                          But {currentStory.transcript.split(/\bbut\b/i)[1]?.split(/\btherefore\b/i)[0]}
                        </div>
                      </div>
                      
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>Therefore (Resolution)</h4>
                        <div style={{ 
                          backgroundColor: 'rgba(255,255,255,0.05)', 
                          padding: '0.5rem', 
                          borderRadius: '5px'
                        }}>
                          Therefore {currentStory.transcript.split(/\btherefore\b/i)[1]}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* No Story Selected */
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <h2>Select a story or create a new one</h2>
              <p>Practice and refine your professional stories using the ABT framework.</p>
              <button 
                onClick={() => setIsEditing(true)}
                style={{
                  background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                  border: 'none',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginTop: '1rem'
                }}
              >
                Create Your First Story
              </button>
            </div>
          )}
        </div>
      </div>
      
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
