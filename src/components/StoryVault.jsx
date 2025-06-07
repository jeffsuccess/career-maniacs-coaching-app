import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const StoryVault = () => {
  const navigate = useNavigate();
  const isInitialMount = useRef(true);
  const storageEventRef = useRef(false);
  
  // State for stories with localStorage persistence
  const [stories, setStories] = useState(() => {
    const savedStories = localStorage.getItem('stories');
    return savedStories ? JSON.parse(savedStories) : [];
  });
  
  // State for filters
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: 'all'
  });
  
  // State for new story form
  const [showNewStoryForm, setShowNewStoryForm] = useState(false);
  const [newStory, setNewStory] = useState({
    title: '',
    content: '',
    category: 'achievement'
  });
  
  // State for error messages
  const [errorMessage, setErrorMessage] = useState('');
  
  // Load stories from localStorage whenever they might have changed elsewhere
  useEffect(() => {
    const handleStorageChange = () => {
      // Prevent infinite loop by checking if we're the ones who triggered the event
      if (storageEventRef.current) {
        storageEventRef.current = false;
        return;
      }
      
      const savedStories = localStorage.getItem('stories');
      if (savedStories) {
        try {
          setStories(JSON.parse(savedStories));
        } catch (e) {
          console.error("Error parsing stories from localStorage:", e);
          setErrorMessage("Error loading stories. Please refresh the page.");
        }
      }
    };
    
    // Listen for storage changes from other components
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdated', handleStorageChange);
    };
  }, []);
  
  // Save stories to localStorage whenever they change
  useEffect(() => {
    // Skip on initial mount to prevent unnecessary event dispatch
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Save to localStorage
    localStorage.setItem('stories', JSON.stringify(stories));
    
    // Set flag to indicate we're triggering the event
    storageEventRef.current = true;
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storageUpdated'));
    
    // Reset flag after a short delay to allow event to process
    setTimeout(() => {
      storageEventRef.current = false;
    }, 50);
  }, [stories]);
  
  // Handle input changes for new story
  const handleInputChange = (field, value) => {
    setNewStory({
      ...newStory,
      [field]: value
    });
  };
  
  // Add new story
  const handleAddStory = () => {
    if (!newStory.title) {
      alert('Please enter a title for your story.');
      return;
    }
    
    const storyToAdd = {
      ...newStory,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      practiceCount: 0,
      transcript: '',
      feedback: ''
    };
    
    // Update stories state - this will trigger the useEffect to save to localStorage
    setStories(prevStories => [...prevStories, storyToAdd]);
    
    // Reset form
    setNewStory({
      title: '',
      content: '',
      category: 'achievement'
    });
    setShowNewStoryForm(false);
  };
  
  // Delete story
  const handleDeleteStory = (storyId) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      // Update stories state - this will trigger the useEffect to save to localStorage
      setStories(prevStories => prevStories.filter(story => story.id !== storyId));
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };
  
  // Validate story before practice
  const validateStory = (story) => {
    if (!story) {
      return { valid: false, message: "Story data is missing" };
    }
    
    if (!story.id) {
      return { valid: false, message: "Story ID is missing" };
    }
    
    if (!story.title) {
      return { valid: false, message: "Story title is missing" };
    }
    
    return { valid: true };
  };
  
  // Practice story - FIXED to use a direct window.location approach instead of React Router
  const handlePracticeStory = (story) => {
    // Clear any previous error messages
    setErrorMessage('');
    
    // Validate story data
    const validation = validateStory(story);
    if (!validation.valid) {
      setErrorMessage(`Cannot practice this story: ${validation.message}`);
      return;
    }
    
    // Ensure story has all required fields for practice
    const storyForPractice = {
      ...story,
      content: story.content || '',
      category: story.category || 'achievement',
      transcript: story.transcript || '',
      feedback: story.feedback || '',
      practiceCount: story.practiceCount || 0,
      lastPracticed: story.lastPracticed || null
    };
    
    // Log navigation attempt for debugging
    console.log("Attempting to navigate to storytelling practice with story:", storyForPractice);
    
    try {
      // Save the selected story to localStorage for direct access
      localStorage.setItem('currentPracticeStory', JSON.stringify({
        selectedStory: storyForPractice,
        source: 'story-vault',
        timestamp: Date.now() // Add timestamp to ensure it's treated as new data
      }));
      
      // Use direct window location change to force a complete page reload
      window.location.href = '/storytelling-practice';
    } catch (e) {
      console.error("Navigation error:", e);
      setErrorMessage("Error navigating to practice. Please try again.");
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };
  
  // Filter stories based on current filters
  const filteredStories = stories.filter(story => {
    // Filter by search term
    const matchesSearch = 
      (story.title && story.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (story.content && story.content.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (story.transcript && story.transcript.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    
    // Filter by category
    const matchesCategory = filters.category === 'all' || story.category === filters.category;
    
    return matchesSearch && matchesCategory;
  });
  
  // Sort stories by creation date (newest first)
  const sortedStories = [...filteredStories].sort((a, b) => {
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
  
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
        Story Vault
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <p>Store and organize your stories for easy access during interviews and networking.</p>
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
      
      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <button 
          onClick={() => setShowNewStoryForm(!showNewStoryForm)}
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
          {showNewStoryForm ? 'Cancel' : 'Add New Story'}
        </button>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Search stories..." 
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '5px'
            }}
          />
          
          <select 
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '5px'
            }}
          >
            <option value="all">All Categories</option>
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
      </div>
      
      {/* New Story Form */}
      {showNewStoryForm && (
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          marginBottom: '2rem'
        }}>
          <h2>Add New Story</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title:</label>
            <input 
              type="text" 
              value={newStory.title}
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
              value={newStory.category}
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
              value={newStory.content}
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
          
          <button 
            onClick={handleAddStory}
            disabled={!newStory.title}
            style={{
              background: newStory.title ? 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)' : 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: newStory.title ? 'pointer' : 'not-allowed',
              fontWeight: 'bold'
            }}
          >
            Save Story
          </button>
        </div>
      )}
      
      {/* Stories List */}
      {sortedStories.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {sortedStories.map(story => (
            <div 
              key={story.id}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{story.title}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handlePracticeStory(story)}
                    style={{
                      backgroundColor: 'rgba(10,177,150,0.3)',
                      border: '1px solid #0AB196', /* Added border for better visibility */
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <span style={{ 
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#0AB196',
                      borderRadius: '50%'
                    }}></span>
                    Practice
                  </button>
                  <button 
                    onClick={() => handleDeleteStory(story.id)}
                    style={{
                      backgroundColor: 'rgba(255,100,100,0.2)',
                      border: 'none',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
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
                marginBottom: '1rem',
                flexGrow: 1
              }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{story.content}</p>
              </div>
              
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.6)'
              }}>
                <span>Category: {story.category}</span>
                <span>Created: {formatDate(story.createdAt)}</span>
              </div>
              
              {story.practiceCount > 0 && (
                <div style={{ 
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.6)'
                }}>
                  <span>Practiced: {story.practiceCount} {story.practiceCount === 1 ? 'time' : 'times'}</span>
                  {story.lastPracticed && (
                    <span> (Last: {formatDate(story.lastPracticed)})</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '2rem',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <p>No stories found. Add your first story to get started!</p>
        </div>
      )}
    </div>
  );
};

export default StoryVault;
