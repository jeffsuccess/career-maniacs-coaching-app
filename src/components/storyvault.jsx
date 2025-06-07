import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StoryVault = () => {
  const navigate = useNavigate();
  
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
  
  // Save stories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('stories', JSON.stringify(stories));
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
      practiceCount: 0
    };
    
    setStories([...stories, storyToAdd]);
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
      setStories(stories.filter(story => story.id !== storyId));
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };
  
  // Practice story
  const handlePracticeStory = (story) => {
    navigate('/storytelling-practice', { state: { selectedStory: story } });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  // Filter stories based on current filters
  const filteredStories = stories.filter(story => {
    // Filter by search term
    const matchesSearch = story.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                          story.content.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    // Filter by category
    const matchesCategory = filters.category === 'all' || story.category === filters.category;
    
    return matchesSearch && matchesCategory;
  });
  
  // Sort stories by creation date (newest first)
  const sortedStories = [...filteredStories].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
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
                      border: 'none',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
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
                padding: '0.25rem 0.5rem', 
                borderRadius: '5px',
                display: 'inline-block',
                alignSelf: 'flex-start',
                marginBottom: '0.5rem',
                fontSize: '0.8rem'
              }}>
                {story.category}
              </div>
              
              <div style={{ 
                marginBottom: '1rem', 
                fontSize: '0.9rem',
                maxHeight: '100px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {story.content}
                <div style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  height: '30px', 
                  background: 'linear-gradient(transparent, rgba(30, 30, 30, 1))' 
                }} />
              </div>
              
              <div style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Created: {formatDate(story.createdAt)}</span>
                  <span>Practiced: {story.practiceCount || 0} times</span>
                </div>
                {story.lastPracticed && (
                  <div style={{ marginTop: '0.25rem' }}>
                    Last practiced: {formatDate(story.lastPracticed)}
                  </div>
                )}
              </div>
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
