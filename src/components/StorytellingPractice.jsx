import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const StorytellingPractice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs to prevent infinite loops
  const isInitialMount = useRef(true);
  const storageEventRef = useRef(false);
  const timerRef = useRef(null);
  const timerValueRef = useRef(0);
  
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
  const [timer, setTimer] = useState(0);
  const [feedback, setFeedback] = useState({
    selfRating: '',
    abtAnalysis: {},
    contentAnalysis: {},
    timeAnalysis: {}
  });
  
  // Refs
  const transcriptTextareaRef = useRef(null);
  
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
    }
  }, [stories]);
  
  // Timer implementation using a reliable time-based approach
  const startTimer = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Reset timer value
    timerValueRef.current = 0;
    setTimer(0);
    
    // Create a new timer with a reliable approach
    const startTime = Date.now();
    
    const timerInterval = setInterval(() => {
      // Calculate elapsed time based on real time difference
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      timerValueRef.current = elapsedSeconds;
      setTimer(elapsedSeconds);
      
      console.log("Timer tick:", elapsedSeconds);
    }, 1000);
    
    timerRef.current = timerInterval;
    
    // Safety cleanup after 30 minutes to prevent memory leaks
    setTimeout(() => {
      if (timerRef.current === timerInterval) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 30 * 60 * 1000);
  };
  
  // Start practice session
  const startPractice = () => {
    // Start the timer
    startTimer();
    setIsPracticing(true);
  };
  
  // Stop practice session
  const stopPractice = () => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Save practice data
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
    setIsPracticing(false);
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
        
        alert('Transcript saved successfully!');
      } else {
        alert('Please save the story first before saving the transcript.');
      }
    } catch (e) {
      console.error("Error saving transcript:", e);
      alert("Error saving transcript. Please try again.");
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
      const optimalTimeRange = {
        min: 60, // 1 minute
        max: 180 // 3 minutes
      };
      
      const timeScore = timer >= optimalTimeRange.min && timer <= optimalTimeRange.max ? 100 :
                        timer < optimalTimeRange.min ? Math.round((timer / optimalTimeRange.min) * 100) :
                        Math.max(0, Math.round(100 - ((timer - optimalTimeRange.max) / 60) * 25));
      
      // Set feedback
      const newFeedback = {
        selfRating: '',
        abtAnalysis: {
          score: abtScore,
          percentage: abtPercentage,
          hasAnd,
          hasBut,
          hasTherefore,
          feedback: abtScore === 3 ? 'Excellent! Your story has a complete ABT structure.' :
                    abtScore === 2 ? 'Good! Your story has most of the ABT structure, but could be improved.' :
                    abtScore === 1 ? 'Your story has one element of the ABT structure. Try to include all three.' :
                    'Your story is missing the ABT structure. Try to include And, But, Therefore elements.'
        },
        contentAnalysis: {
          wordCount,
          sentenceCount,
          avgWordsPerSentence,
          feedback: wordCount < 50 ? 'Your story is quite short. Consider adding more details.' :
                    wordCount > 500 ? 'Your story is quite long. Consider making it more concise.' :
                    'Your story has a good length.'
        },
        timeAnalysis: {
          time: timer,
          formattedTime: formatTime(timer),
          score: timeScore,
          feedback: timer < optimalTimeRange.min ? 'Your story was a bit short. Aim for 1-3 minutes.' :
                    timer > optimalTimeRange.max ? 'Your story was a bit long. Aim for 1-3 minutes.' :
                    'Your story had an excellent length!'
        }
      };
      
      setFeedback(newFeedback);
      
      // Save feedback to current story
      const updatedStory = {
        ...currentStory,
        feedback: JSON.stringify(newFeedback)
      };
      
      setCurrentStory(updatedStory);
      
      // Update in stories array
      if (updatedStory.id) {
        const updatedStories = stories.map(story => 
          story.id === updatedStory.id ? updatedStory : story
        );
        
        setStories(updatedStories);
      }
    } catch (e) {
      console.error("Error generating feedback:", e);
    }
  };
  
  // Create a new story
  const createNewStory = () => {
    const newStory = {
      id: `story_${Date.now()}`,
      title: 'New Story',
      content: '',
      category: 'achievement',
      transcript: '',
      feedback: '',
      lastPracticed: null,
      practiceCount: 0,
      createdAt: new Date().toISOString()
    };
    
    setCurrentStory(newStory);
    setTranscript('');
    setFeedback({
      selfRating: '',
      abtAnalysis: {},
      contentAnalysis: {},
      timeAnalysis: {}
    });
    
    // Add to stories array
    setStories([...stories, newStory]);
  };
  
  // Handle story title change
  const handleTitleChange = (e) => {
    const updatedStory = {
      ...currentStory,
      title: e.target.value
    };
    
    setCurrentStory(updatedStory);
    
    // Update in stories array
    if (updatedStory.id) {
      const updatedStories = stories.map(story => 
        story.id === updatedStory.id ? updatedStory : story
      );
      
      setStories(updatedStories);
    }
  };
  
  // Handle story category change
  const handleCategoryChange = (e) => {
    const updatedStory = {
      ...currentStory,
      category: e.target.value
    };
    
    setCurrentStory(updatedStory);
    
    // Update in stories array
    if (updatedStory.id) {
      const updatedStories = stories.map(story => 
        story.id === updatedStory.id ? updatedStory : story
      );
      
      setStories(updatedStories);
    }
  };
  
  // Handle story selection
  const handleStorySelect = (e) => {
    const selectedStoryId = e.target.value;
    
    if (selectedStoryId === 'new') {
      createNewStory();
      return;
    }
    
    const selectedStory = stories.find(story => story.id === selectedStoryId);
    
    if (selectedStory) {
      setCurrentStory(selectedStory);
      setTranscript(selectedStory.transcript || '');
      
      // Parse feedback if available
      if (selectedStory.feedback) {
        try {
          setFeedback(JSON.parse(selectedStory.feedback));
        } catch (e) {
          console.error("Error parsing feedback:", e);
          setFeedback({
            selfRating: '',
            abtAnalysis: {},
            contentAnalysis: {},
            timeAnalysis: {}
          });
        }
      } else {
        setFeedback({
          selfRating: '',
          abtAnalysis: {},
          contentAnalysis: {},
          timeAnalysis: {}
        });
      }
    }
  };
  
  // Delete current story
  const deleteCurrentStory = () => {
    if (!currentStory.id) return;
    
    if (window.confirm('Are you sure you want to delete this story?')) {
      // Remove from stories array
      const updatedStories = stories.filter(story => story.id !== currentStory.id);
      setStories(updatedStories);
      
      // Reset current story
      if (updatedStories.length > 0) {
        setCurrentStory(updatedStories[0]);
        setTranscript(updatedStories[0].transcript || '');
        
        // Parse feedback if available
        if (updatedStories[0].feedback) {
          try {
            setFeedback(JSON.parse(updatedStories[0].feedback));
          } catch (e) {
            console.error("Error parsing feedback:", e);
            setFeedback({
              selfRating: '',
              abtAnalysis: {},
              contentAnalysis: {},
              timeAnalysis: {}
            });
          }
        } else {
          setFeedback({
            selfRating: '',
            abtAnalysis: {},
            contentAnalysis: {},
            timeAnalysis: {}
          });
        }
      } else {
        createNewStory();
      }
    }
  };
  
  // Go back to Story Vault
  const goToStoryVault = () => {
    navigate('/story-vault');
  };
  
  return (
    <div className="storytelling-practice" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ 
        background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: 'bold',
        marginBottom: '1.5rem'
      }}>
        Storytelling Practice
      </h2>
      
      {/* External Speech-to-Text Instructions */}
      <div style={{ 
        backgroundColor: 'rgba(22, 179, 247, 0.1)', 
        border: '1px solid rgba(22, 179, 247, 0.3)',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ marginBottom: '0.5rem', color: '#16B3F7' }}>How to Use External Speech-to-Text</h3>
        <p style={{ marginBottom: '0.5rem' }}>
          For the best experience, use an external speech-to-text tool before starting your practice:
        </p>
        <ol style={{ paddingLeft: '1.5rem', marginBottom: '0.5rem' }}>
          <li>Open a speech-to-text tool like Google Docs voice typing, Microsoft Word dictation, or a dedicated app</li>
          <li>Record your story using the external tool</li>
          <li>Copy the transcribed text</li>
          <li>Paste it into the transcript area below</li>
          <li>Click "Start Practice" to begin timing your delivery</li>
        </ol>
        <p>
          <strong>Recommended tools:</strong> Google Docs (Tools → Voice typing), Microsoft Word (Dictate button), 
          or dedicated apps like Otter.ai, Speechnotes, or Just Press Record.
        </p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button 
          onClick={goToStoryVault}
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ← Back to Story Vault
        </button>
        
        <div>
          <select 
            value={currentStory.id || ''}
            onChange={handleStorySelect}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              marginRight: '0.5rem'
            }}
          >
            {stories.map(story => (
              <option key={story.id} value={story.id}>
                {story.title}
              </option>
            ))}
            <option value="new">+ Create New Story</option>
          </select>
          
          <button 
            onClick={deleteCurrentStory}
            disabled={!currentStory.id}
            style={{
              backgroundColor: 'rgba(220,53,69,0.2)',
              border: '1px solid rgba(220,53,69,0.5)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: currentStory.id ? 'pointer' : 'not-allowed',
              opacity: currentStory.id ? 1 : 0.5
            }}
          >
            Delete Story
          </button>
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        padding: '1.5rem', 
        borderRadius: '10px',
        marginBottom: '1.5rem'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Story Title:</label>
          <input 
            type="text"
            value={currentStory.title}
            onChange={handleTitleChange}
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
            onChange={handleCategoryChange}
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
            <option value="teamwork">Teamwork</option>
            <option value="failure">Failure & Learning</option>
            <option value="innovation">Innovation</option>
            <option value="conflict">Conflict Resolution</option>
            <option value="personal">Personal Growth</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        padding: '1.5rem', 
        borderRadius: '10px',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>Practice Your Story</h3>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {formatTime(timer)}
          </div>
          
          <div>
            {!isPracticing ? (
              <button 
                onClick={startPractice}
                style={{
                  backgroundColor: 'rgba(10,177,150,0.2)',
                  border: '1px solid rgba(10,177,150,0.5)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                Start Practice
              </button>
            ) : (
              <button 
                onClick={stopPractice}
                style={{
                  backgroundColor: 'rgba(220,53,69,0.2)',
                  border: '1px solid rgba(220,53,69,0.5)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                Stop Practice
              </button>
            )}
          </div>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Transcript:</label>
          <textarea 
            ref={transcriptTextareaRef}
            value={transcript}
            onChange={handleTranscriptChange}
            placeholder="Enter or paste your story transcript here..."
            style={{
              width: '100%',
              height: '200px',
              padding: '0.75rem',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '5px',
              resize: 'vertical'
            }}
          />
        </div>
        
        <button 
          onClick={saveTranscript}
          style={{
            backgroundColor: 'rgba(153,102,255,0.2)',
            border: '1px solid rgba(153,102,255,0.5)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Save Transcript
        </button>
      </div>
      
      {/* Feedback Section */}
      {feedback.abtAnalysis.score !== undefined && (
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>Feedback</h3>
          
          {/* ABT Structure Analysis */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>ABT Structure Analysis</h4>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginRight: '1rem'
              }}>
                <div style={{ 
                  width: `${feedback.abtAnalysis.percentage}%`, 
                  height: '100%', 
                  backgroundColor: feedback.abtAnalysis.score === 3 ? '#0AB196' : 
                                  feedback.abtAnalysis.score === 2 ? '#00C2C7' : 
                                  feedback.abtAnalysis.score === 1 ? '#16B3F7' : 
                                  '#6c757d',
                  borderRadius: '4px'
                }} />
              </div>
              <span>{feedback.abtAnalysis.percentage}%</span>
            </div>
            
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ 
                display: 'inline-block',
                padding: '0.25rem 0.5rem',
                backgroundColor: feedback.abtAnalysis.hasAnd ? 'rgba(10,177,150,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${feedback.abtAnalysis.hasAnd ? 'rgba(10,177,150,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: feedback.abtAnalysis.hasAnd ? '#0AB196' : 'rgba(255,255,255,0.5)',
                borderRadius: '4px',
                marginRight: '0.5rem',
                fontSize: '0.9rem'
              }}>
                And
              </span>
              
              <span style={{ 
                display: 'inline-block',
                padding: '0.25rem 0.5rem',
                backgroundColor: feedback.abtAnalysis.hasBut ? 'rgba(0,194,199,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${feedback.abtAnalysis.hasBut ? 'rgba(0,194,199,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: feedback.abtAnalysis.hasBut ? '#00C2C7' : 'rgba(255,255,255,0.5)',
                borderRadius: '4px',
                marginRight: '0.5rem',
                fontSize: '0.9rem'
              }}>
                But
              </span>
              
              <span style={{ 
                display: 'inline-block',
                padding: '0.25rem 0.5rem',
                backgroundColor: feedback.abtAnalysis.hasTherefore ? 'rgba(22,179,247,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${feedback.abtAnalysis.hasTherefore ? 'rgba(22,179,247,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: feedback.abtAnalysis.hasTherefore ? '#16B3F7' : 'rgba(255,255,255,0.5)',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}>
                Therefore
              </span>
            </div>
            
            <p>{feedback.abtAnalysis.feedback}</p>
          </div>
          
          {/* Content Analysis */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Content Analysis</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Word Count</div>
                <div style={{ fontSize: '1.2rem' }}>{feedback.contentAnalysis.wordCount}</div>
              </div>
              
              <div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Sentence Count</div>
                <div style={{ fontSize: '1.2rem' }}>{feedback.contentAnalysis.sentenceCount}</div>
              </div>
              
              <div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Avg. Words per Sentence</div>
                <div style={{ fontSize: '1.2rem' }}>{feedback.contentAnalysis.avgWordsPerSentence}</div>
              </div>
            </div>
            
            <p style={{ marginTop: '0.5rem' }}>{feedback.contentAnalysis.feedback}</p>
          </div>
          
          {/* Time Analysis */}
          <div>
            <h4 style={{ marginBottom: '0.5rem' }}>Time Analysis</h4>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginRight: '1rem'
              }}>
                <div style={{ 
                  width: `${feedback.timeAnalysis.score}%`, 
                  height: '100%', 
                  backgroundColor: feedback.timeAnalysis.score > 80 ? '#0AB196' : 
                                  feedback.timeAnalysis.score > 60 ? '#00C2C7' : 
                                  feedback.timeAnalysis.score > 40 ? '#16B3F7' : 
                                  '#6c757d',
                  borderRadius: '4px'
                }} />
              </div>
              <span>{feedback.timeAnalysis.score}%</span>
            </div>
            
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Time:</span>{' '}
              <span style={{ fontSize: '1.2rem' }}>{feedback.timeAnalysis.formattedTime}</span>
            </div>
            
            <p>{feedback.timeAnalysis.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorytellingPractice;
