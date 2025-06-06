import React, { useState } from 'react';

const StoryVault = () => {
  // Sample stories data with ABT framework
  const [stories, setStories] = useState([
    {
      id: 1,
      title: 'Leadership During System Migration',
      category: 'Leadership',
      framework: {
        and: 'Our team was tasked with migrating a legacy system to a new platform with minimal disruption AND we had a tight deadline with limited resources.',
        but: 'BUT halfway through the project, we discovered critical data inconsistencies that threatened to derail the entire migration.',
        therefore: 'THEREFORE, I organized daily stand-ups focused solely on data integrity, created a specialized task force to address the inconsistencies, and developed a validation tool that reduced error rates by 85%, allowing us to complete the migration on schedule.'
      },
      keyPoints: [
        'Cross-functional leadership',
        'Crisis management',
        'Technical problem-solving',
        'Team motivation during pressure'
      ],
      tags: ['leadership', 'technical', 'crisis-management']
    },
    {
      id: 2,
      title: 'Innovative Solution to Customer Problem',
      category: 'Problem Solving',
      framework: {
        and: 'A major client was struggling with data integration between legacy systems AND they had tried multiple standard approaches.',
        but: 'BUT none of the conventional solutions worked due to their unique infrastructure constraints.',
        therefore: 'THEREFORE, I developed a custom middleware solution after analyzing their workflow, which reduced processing time by 70% while maintaining data integrity.'
      },
      keyPoints: [
        'Client\'s unique challenge with legacy systems',
        'Technical constraints that prevented standard solutions',
        'Custom middleware development process',
        'Measurable results and broader application'
      ],
      tags: ['innovation', 'technical', 'client-success']
    },
    {
      id: 3,
      title: 'Building Team Cohesion Remotely',
      category: 'Team Building',
      framework: {
        and: 'I joined as a manager of a newly formed team that was fully remote AND team members were from different cultural backgrounds with varying work styles.',
        but: 'BUT there was low engagement, miscommunication, and siloed work happening that was affecting productivity.',
        therefore: 'THEREFORE, I implemented structured but flexible communication protocols, created virtual team-building activities tailored to different time zones, and established clear shared goals that improved team cohesion by 60% within three months as measured by our engagement surveys.'
      },
      keyPoints: [
        'Remote team management',
        'Cross-cultural communication',
        'Engagement strategies',
        'Measurable improvement metrics'
      ],
      tags: ['management', 'communication', 'remote-work']
    }
  ]);
  
  const [selectedStory, setSelectedStory] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Get unique categories for filter
  const categories = ['All', ...new Set(stories.map(story => story.category))];
  
  // Filter stories based on search and category
  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         story.framework.and.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.framework.but.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.framework.therefore.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'All' || story.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Handle story selection
  const handleSelectStory = (id) => {
    setSelectedStory(id);
    setEditMode(false);
  };
  
  // New story template
  const newStoryTemplate = {
    id: stories.length > 0 ? Math.max(...stories.map(s => s.id)) + 1 : 1,
    title: 'New Story',
    category: 'General',
    framework: {
      and: 'Context and setup of the situation...',
      but: 'The challenge or conflict that arose...',
      therefore: 'How you resolved it and the results...'
    },
    keyPoints: ['Key point 1', 'Key point 2', 'Key point 3'],
    tags: ['tag1', 'tag2']
  };
  
  // Add new story
  const addNewStory = () => {
    const newStory = {...newStoryTemplate};
    setStories([...stories, newStory]);
    setSelectedStory(newStory.id);
    setEditMode(true);
  };
  
  // Handle input changes for story editing
  const handleInputChange = (field, value) => {
    setStories(stories.map(story => {
      if (story.id === selectedStory) {
        if (field.includes('.')) {
          // Handle nested fields like framework.and
          const [parent, child] = field.split('.');
          return {
            ...story,
            [parent]: {
              ...story[parent],
              [child]: value
            }
          };
        } else {
          // Handle top-level fields
          return {
            ...story,
            [field]: value
          };
        }
      }
      return story;
    }));
  };
  
  // Handle key points changes
  const handleKeyPointChange = (index, value) => {
    setStories(stories.map(story => {
      if (story.id === selectedStory) {
        const updatedKeyPoints = [...story.keyPoints];
        updatedKeyPoints[index] = value;
        return {
          ...story,
          keyPoints: updatedKeyPoints
        };
      }
      return story;
    }));
  };
  
  // Add new key point
  const addKeyPoint = () => {
    setStories(stories.map(story => {
      if (story.id === selectedStory) {
        return {
          ...story,
          keyPoints: [...story.keyPoints, 'New key point']
        };
      }
      return story;
    }));
  };
  
  // Remove key point
  const removeKeyPoint = (index) => {
    setStories(stories.map(story => {
      if (story.id === selectedStory) {
        const updatedKeyPoints = [...story.keyPoints];
        updatedKeyPoints.splice(index, 1);
        return {
          ...story,
          keyPoints: updatedKeyPoints
        };
      }
      return story;
    }));
  };
  
  // Handle tag changes
  const handleTagChange = (index, value) => {
    setStories(stories.map(story => {
      if (story.id === selectedStory) {
        const updatedTags = [...story.tags];
        updatedTags[index] = value;
        return {
          ...story,
          tags: updatedTags
        };
      }
      return story;
    }));
  };
  
  // Add new tag
  const addTag = () => {
    setStories(stories.map(story => {
      if (story.id === selectedStory) {
        return {
          ...story,
          tags: [...story.tags, 'new-tag']
        };
      }
      return story;
    }));
  };
  
  // Remove tag
  const removeTag = (index) => {
    setStories(stories.map(story => {
      if (story.id === selectedStory) {
        const updatedTags = [...story.tags];
        updatedTags.splice(index, 1);
        return {
          ...story,
          tags: updatedTags
        };
      }
      return story;
    }));
  };
  
  // Delete story
  const deleteStory = (id) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      setStories(stories.filter(story => story.id !== id));
      if (selectedStory === id) {
        setSelectedStory(null);
        setEditMode(false);
      }
    }
  };
  
  // Save story changes
  const saveStoryChanges = () => {
    setEditMode(false);
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
        Story Vault
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <p>Store and organize your professional stories using the ABT (And, But, Therefore) framework for interviews and networking.</p>
      </div>
      
      {/* Search and Filter */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '5px',
              minWidth: '200px'
            }}
          />
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '5px'
            }}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={addNewStory}
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
          Add New Story
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '2rem', minHeight: '60vh', flexWrap: 'wrap' }}>
        {/* Story List */}
        <div style={{ 
          width: '300px', 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          overflowY: 'auto',
          height: 'fit-content',
          flexShrink: 0
        }}>
          <h2>Your Stories</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {filteredStories.length > 0 ? (
              filteredStories.map(story => (
                <div 
                  key={story.id}
                  style={{ 
                    backgroundColor: selectedStory === story.id ? 'rgba(10,177,150,0.2)' : 'rgba(255,255,255,0.05)', 
                    padding: '1rem', 
                    borderRadius: '5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleSelectStory(story.id)}
                >
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{story.title}</h3>
                  <span style={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '20px',
                    fontSize: '0.8rem'
                  }}>
                    {story.category}
                  </span>
                </div>
              ))
            ) : (
              <p>No stories match your search.</p>
            )}
          </div>
        </div>
        
        {/* Story Detail */}
        <div style={{ 
          flex: 1, 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          minWidth: '300px'
        }}>
          {selectedStory ? (
            <>
              {editMode ? (
                <div>
                  <h2>Edit Story</h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title:</label>
                    <input 
                      type="text" 
                      value={stories.find(s => s.id === selectedStory)?.title}
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
                    <input 
                      type="text" 
                      value={stories.find(s => s.id === selectedStory)?.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
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
                    <h3>ABT Framework</h3>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#0AB196' }}>AND (Context & Setup):</label>
                      <textarea 
                        value={stories.find(s => s.id === selectedStory)?.framework.and}
                        onChange={(e) => handleInputChange('framework.and', e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: '100px',
                          padding: '0.5rem',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '5px',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00C2C7' }}>BUT (Conflict & Challenge):</label>
                      <textarea 
                        value={stories.find(s => s.id === selectedStory)?.framework.but}
                        onChange={(e) => handleInputChange('framework.but', e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: '100px',
                          padding: '0.5rem',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '5px',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#16B3F7' }}>THEREFORE (Resolution & Results):</label>
                      <textarea 
                        value={stories.find(s => s.id === selectedStory)?.framework.therefore}
                        onChange={(e) => handleInputChange('framework.therefore', e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: '100px',
                          padding: '0.5rem',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '5px',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0 }}>Key Points</h3>
                      <button 
                        onClick={addKeyPoint}
                        style={{
                          background: 'none',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        Add Point
                      </button>
                    </div>
                    
                    {stories.find(s => s.id === selectedStory)?.keyPoints.map((point, index) => (
                      <div key={index} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <input 
                          type="text" 
                          value={point}
                          onChange={(e) => handleKeyPointChange(index, e.target.value)}
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
                          onClick={() => removeKeyPoint(index)}
                          style={{
                            background: 'none',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            padding: '0 8px',
                            borderRadius: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0 }}>Tags</h3>
                      <button 
                        onClick={addTag}
                        style={{
                          background: 'none',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        Add Tag
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {stories.find(s => s.id === selectedStory)?.tags.map((tag, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            value={tag}
                            onChange={(e) => handleTagChange(index, e.target.value)}
                            style={{
                              width: '100px',
                              padding: '0.25rem 0.5rem',
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              color: 'white',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '5px'
                            }}
                          />
                          <button 
                            onClick={() => removeTag(index)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'white',
                              padding: '0 4px',
                              cursor: 'pointer'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1rem' }}>
                    <button 
                      style={{ 
                        padding: '0.5rem 1rem', 
                        backgroundColor: 'rgba(220,53,69,0.2)', 
                        border: '1px solid #dc3545', 
                        borderRadius: '5px', 
                        color: 'white', 
                        cursor: 'pointer' 
                      }}
                      onClick={() => deleteStory(selectedStory)}
                    >
                      Delete Story
                    </button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        style={{ 
                          padding: '0.5rem 1rem', 
                          backgroundColor: 'rgba(255,255,255,0.1)', 
                          border: '1px solid rgba(255,255,255,0.2)', 
                          borderRadius: '5px', 
                          color: 'white', 
                          cursor: 'pointer' 
                        }}
                        onClick={() => setEditMode(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        style={{
                          background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                          border: 'none',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                        onClick={saveStoryChanges}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0 }}>{stories.find(s => s.id === selectedStory)?.title}</h2>
                    <div>
                      <button 
                        style={{ background: 'none', border: 'none', color: '#16B3F7', cursor: 'pointer', marginRight: '10px' }}
                        onClick={() => setEditMode(true)}
                      >
                        Edit
                      </button>
                      <button style={{ background: 'none', border: 'none', color: '#16B3F7', cursor: 'pointer' }}>
                        Practice
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)', 
                    padding: '1.5rem', 
                    borderRadius: '10px',
                    marginBottom: '1.5rem'
                  }}>
                    <h3 style={{ marginTop: 0 }}>ABT Framework</h3>
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ color: '#0AB196', margin: '0.5rem 0' }}>AND (Context & Setup)</h4>
                      <p>{stories.find(s => s.id === selectedStory)?.framework.and}</p>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ color: '#00C2C7', margin: '0.5rem 0' }}>BUT (Conflict & Challenge)</h4>
                      <p>{stories.find(s => s.id === selectedStory)?.framework.but}</p>
                    </div>
                    <div>
                      <h4 style={{ color: '#16B3F7', margin: '0.5rem 0' }}>THEREFORE (Resolution & Results)</h4>
                      <p>{stories.find(s => s.id === selectedStory)?.framework.therefore}</p>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3>Key Points</h3>
                    <ul style={{ paddingLeft: '1.5rem' }}>
                      {stories.find(s => s.id === selectedStory)?.keyPoints.map((point, index) => (
                        <li key={index} style={{ marginBottom: '0.5rem' }}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3>Tags</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {stories.find(s => s.id === selectedStory)?.tags.map((tag, index) => (
                        <span 
                          key={index}
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
                </>
              )}
            </>) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              minHeight: '300px'
            }}>
              <p style={{ marginBottom: '1rem', textAlign: 'center' }}>Select a story to view or create a new one.</p>
              <button 
                onClick={addNewStory}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryVault;
