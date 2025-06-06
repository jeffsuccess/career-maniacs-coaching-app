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
      audioURL: null,
      practiceHistory: [
        { date: '2025-05-29', duration: 58, feedback: 'good' },
        { date: '2025-06-02', duration: 62, feedback: 'excellent' }
      ]
    },
    {
      id: 2,
      title: 'Innovation Initiative',
      transcript: 'I noticed our team was using an inefficient process for client onboarding. And this was causing delays and frustration for both our team and new clients. But I knew there had to be a better way, so I researched alternatives and developed a streamlined digital solution. Therefore, we reduced onboarding time by 40% and significantly improved client satisfaction scores. This initiative demonstrated my ability to identify problems, take initiative, and implement effective solutions.',
      date: '2025-06-01',
      duration: 58,
      tags: ['innovation', 'initiative', 'process-improvement'],
      audioURL: null,
      practiceHistory: [
        { date: '2025-06-03', duration: 55, feedback: 'good' }
      ]
    },
    {
      id: 3,
      title: 'Conflict Resolution',
      transcript: 'I was working on a project where two senior team members had conflicting visions for the product direction. And their disagreement was causing tension and slowing down our progress. But I recognized that both perspectives had merit, so I facilitated a structured discussion to identify common ground. Therefore, we were able to develop a hybrid approach that incorporated the strengths of both visions and created a better outcome than either original concept. This experience reinforced my belief in the value of diverse perspectives and my ability to mediate conflicts productively.',
      date: '2025-06-03',
      duration: 72,
      tags: ['conflict-resolution', 'communication', 'mediation'],
      audioURL: null,
      practiceHistory: []
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
  
  // State for practice mode
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceStory, setPracticeStory] = useState(null);
  const [practiceTimer, setPracticeTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(120); // Default 2 minutes
  const [feedback, setFeedback] = useState(null);
  const [selectedStories, setSelectedStories] = useState([]);
  
  // Practice timer reference
  const practiceTimerRef = useRef(null);
  
  // Load stories from localStorage on component mount
  useEffect(() => {
    const savedStories = localStorage.getItem('storytellingPracticeStories');
    if (savedStories) {
      try {
        setStories(JSON.parse(savedStories));
      } catch (error) {
        console.error('Error parsing saved stories:', error);
      }
    }
  }, []);
  
  // Save stories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('storytellingPracticeStories', JSON.stringify(stories));
  }, [stories]);
  
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
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
      }
    };
  }, [transcript]);
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(practiceTimerRef.current);
    };
  }, []);
  
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
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Error starting speech recognition:', error);
          setRecognitionSupported(false);
        }
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        
        // Stop all audio tracks
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
      } catch (error) {
        console.error('Error stopping media recorder:', error);
      }
    }
    
    if (recognitionRef.current && recognitionSupported) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
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
    const todayStr = getTodayDateString();
    
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
        date: todayStr,
        duration: recordingTime,
        tags: formData.tags,
        audioURL: audioURL,
        practiceHistory: []
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
    setIsPracticing(false);
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
  
  // Toggle story selection for practice
  const toggleStorySelection = (id) => {
    if (selectedStories.includes(id)) {
      setSelectedStories(selectedStories.filter(storyId => storyId !== id));
    } else {
      setSelectedStories([...selectedStories, id]);
    }
  };
  
  // Start practice mode
  const startPracticeMode = () => {
    if (selectedStories.length === 0) {
      alert('Please select at least one story to practice.');
      return;
    }
    
    // Get the first selected story
    const storyToStart = stories.find(story => story.id === selectedStories[0]);
    
    setPracticeStory(storyToStart);
    setPracticeTimer(0);
    setTimerRunning(false);
    setFeedback(null);
    setIsPracticing(true);
    setIsEditing(false);
  };
  
  // Start practice timer
  const startPracticeTimer = () => {
    setTimerRunning(true);
    setPracticeTimer(0);
    
    practiceTimerRef.current = setInterval(() => {
      setPracticeTimer(prevTime => {
        if (prevTime >= timerDuration - 1) {
          clearInterval(practiceTimerRef.current);
          setTimerRunning(false);
          return timerDuration;
        }
        return prevTime + 1;
      });
    }, 1000);
  };
  
  // Stop practice timer
  const stopPracticeTimer = () => {
    clearInterval(practiceTimerRef.current);
    setTimerRunning(false);
  };
  
  // Reset practice timer
  const resetPracticeTimer = () => {
    clearInterval(practiceTimerRef.current);
    setTimerRunning(false);
    setPracticeTimer(0);
  };
  
  // Move to next story in practice
  const nextPracticeStory = () => {
    // Save practice history for current story
    if (feedback) {
      const updatedStories = stories.map(story => {
        if (story.id === practiceStory.id) {
          const practiceRecord = {
            date: getTodayDateString(),
            duration: practiceTimer,
            feedback: feedback.type
          };
          
          return {
            ...story,
            practiceHistory: [...(story.practiceHistory || []), practiceRecord]
          };
        }
        return story;
      });
      
      setStories(updatedStories);
    }
    
    const currentIndex = selectedStories.indexOf(practiceStory.id);
    if (currentIndex < selectedStories.length - 1) {
      const nextStoryId = selectedStories[currentIndex + 1];
      const nextStory = stories.find(story => story.id === nextStoryId);
      
      setPracticeStory(nextStory);
      setPracticeTimer(0);
      setTimerRunning(false);
      setFeedback(null);
    } else {
      // End of practice session
      alert('You have completed practicing all selected stories!');
      exitPracticeMode();
    }
  };
  
  // Exit practice mode
  const exitPracticeMode = () => {
    // Save practice history for current story if feedback exists
    if (feedback && practiceStory) {
      const updatedStories = stories.map(story => {
        if (story.id === practiceStory.id) {
          const practiceRecord = {
            date: getTodayDateString(),
            duration: practiceTimer,
            feedback: feedback.type
          };
          
          return {
            ...story,
            practiceHistory: [...(story.practiceHistory || []), practiceRecord]
          };
        }
        return story;
      });
      
      setStories(updatedStories);
    }
    
    clearInterval(practiceTimerRef.current);
    setIsPracticing(false);
    setPracticeStory(null);
    setTimerRunning(false);
    setFeedback(null);
  };
  
  // Submit feedback for practice
  const submitFeedback = (type) => {
    let feedbackText = '';
    let feedbackColor = '';
    
    switch (type) {
      case 'excellent':
        feedbackText = 'Excellent! Your delivery was clear, concise, and followed the ABT structure perfectly.';
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
                  
                  {isRecording && (
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem',
                      borderRadius: '5px',
                      marginBottom: '1rem'
                    }}>
                      <p style={{ margin: '0 0 0.5rem 0', opacity: 0.7 }}>Interim transcript:</p>
                      <p style={{ margin: 0, fontStyle: 'italic' }}>{interimTranscript}</p>
                    </div>
                  )}
                  
                  {transcript && (
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem',
                      borderRadius: '5px'
                    }}>
                      <p style={{ margin: '0 0 0.5rem 0' }}>Your recorded story:</p>
                      <p style={{ margin: 0 }}>{transcript}</p>
                      
                      {hasABTStructure(transcript) ? (
                        <div style={{ 
                          backgroundColor: 'rgba(40,167,69,0.1)', 
                          color: '#28a745',
                          padding: '0.5rem',
                          borderRadius: '5px',
                          marginTop: '1rem'
                        }}>
                          Great job! Your story follows the ABT structure.
                        </div>
                      ) : (
                        <div style={{ 
                          backgroundColor: 'rgba(255,193,7,0.1)', 
                          color: '#ffc107',
                          padding: '0.5rem',
                          borderRadius: '5px',
                          marginTop: '1rem'
                        }}>
                          Try to include clear "And", "But", "Therefore" transitions in your story.
                        </div>
                      )}
                    </div>
                  )}
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
                      {selectedStories.indexOf(practiceStory.id) < selectedStories.length - 1 ? 
                        'Next Story' : 'Finish Practice'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ margin: 0 }}>How did your practice go?</p>
                  
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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
                </div>
              )}
            </div>
          </div>
        ) : isEditing ? (
          // Story Form
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            borderRadius: '10px',
            padding: '2rem'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0' }}>
              {currentStory ? 'Edit Story' : 'Create New Story'}
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
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Story (using ABT framework):
              </label>
              <textarea 
                value={formData.transcript || transcript}
                onChange={(e) => handleInputChange('transcript', e.target.value)}
                placeholder="Enter your story using the And, But, Therefore framework..."
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
              
              {formData.transcript && (
                <div style={{ 
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  borderRadius: '5px',
                  backgroundColor: hasABTStructure(formData.transcript) ? 
                    'rgba(40,167,69,0.1)' : 'rgba(255,193,7,0.1)',
                  color: hasABTStructure(formData.transcript) ? '#28a745' : '#ffc107'
                }}>
                  {hasABTStructure(formData.transcript) ? 
                    'Great! Your story follows the ABT structure.' : 
                    'Try to include clear "And", "But", "Therefore" transitions in your story.'}
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
                    <span>{tag}</span>
                    <button 
                      onClick={() => removeTag(tag)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'rgba(255,255,255,0.7)',
                        cursor: 'pointer',
                        padding: '0',
                        fontSize: '0.8rem'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              
              <input 
                type="text" 
                placeholder="Type tag and press Enter"
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
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', opacity: 0.7 }}>
                Suggested tags: leadership, problem-solving, teamwork, innovation, conflict-resolution
              </p>
            </div>
            
            {audioURL && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Audio Recording:</label>
                <audio controls src={audioURL} style={{ width: '100%' }} />
              </div>
            )}
            
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
          // Stories List and Practice Mode
          <>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ margin: 0 }}>Your Stories</h2>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={startPracticeMode}
                  disabled={selectedStories.length === 0}
                  style={{
                    backgroundColor: selectedStories.length === 0 ? 
                      'rgba(255,255,255,0.05)' : 'rgba(10,177,150,0.2)',
                    border: 'none',
                    color: selectedStories.length === 0 ? 
                      'rgba(255,255,255,0.3)' : '#0AB196',
                    padding: '8px 16px',
                    borderRadius: '5px',
                    cursor: selectedStories.length === 0 ? 'default' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Practice Selected ({selectedStories.length})
                </button>
                
                <button 
                  onClick={() => {
                    setIsEditing(true);
                    setCurrentStory(null);
                    setFormData({
                      title: '',
                      transcript: '',
                      tags: []
                    });
                    setAudioURL('');
                  }}
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
                  Create New Story
                </button>
              </div>
            </div>
            
            {stories.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {stories.map(story => {
                  const practiceStats = getPracticeStats(story);
                  
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedStories.includes(story.id)}
                              onChange={() => toggleStorySelection(story.id)}
                              style={{ 
                                width: '20px', 
                                height: '20px',
                                accentColor: '#0AB196'
                              }}
                            />
                            <div>
                              <h3 style={{ margin: '0 0 0.5rem 0' }}>{story.title}</h3>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ 
                                  backgroundColor: 'rgba(255,255,255,0.1)', 
                                  padding: '0.25rem 0.5rem', 
                                  borderRadius: '20px',
                                  fontSize: '0.8rem'
                                }}>
                                  Created: {formatDate(story.date)}
                                </span>
                                <span style={{ 
                                  backgroundColor: 'rgba(255,255,255,0.1)', 
                                  padding: '0.25rem 0.5rem', 
                                  borderRadius: '20px',
                                  fontSize: '0.8rem'
                                }}>
                                  Duration: {formatTime(story.duration)}
                                </span>
                                {practiceStats.count > 0 && (
                                  <span style={{ 
                                    backgroundColor: 'rgba(10,177,150,0.2)', 
                                    color: '#0AB196',
                                    padding: '0.25rem 0.5rem', 
                                    borderRadius: '20px',
                                    fontSize: '0.8rem'
                                  }}>
                                    Practiced: {practiceStats.count} times
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                          <p style={{ margin: 0 }}>{story.transcript}</p>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                          
                          {story.audioURL && (
                            <audio controls src={story.audioURL} style={{ maxWidth: '100%' }} />
                          )}
                        </div>
                        
                        {practiceStats.count > 0 && (
                          <div style={{ 
                            marginTop: '1rem',
                            backgroundColor: 'rgba(255,255,255,0.05)', 
                            padding: '1rem',
                            borderRadius: '5px'
                          }}>
                            <h4 style={{ margin: '0 0 0.5rem 0' }}>Practice History</h4>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span>Last practiced: {formatDate(practiceStats.lastPracticed)}</span>
                              <span>Average duration: {formatTime(practiceStats.averageDuration)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: '10px',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <p style={{ marginBottom: '1rem' }}>You haven't created any stories yet.</p>
                <button 
                  onClick={() => {
                    setIsEditing(true);
                    setCurrentStory(null);
                    setFormData({
                      title: '',
                      transcript: '',
                      tags: []
                    });
                    setAudioURL('');
                  }}
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
                  Create Your First Story
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StorytellingPractice;
