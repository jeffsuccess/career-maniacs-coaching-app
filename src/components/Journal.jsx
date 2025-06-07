import React, { useState, useEffect } from 'react';

const Journal = () => {
  // State for journal entries
  const [journalEntries, setJournalEntries] = useState(() => {
    const savedEntries = localStorage.getItem('journalEntries');
    return savedEntries ? JSON.parse(savedEntries) : [];
  });
  
  // State for new entry
  const [newEntry, setNewEntry] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: 'morning',
    content: '',
    insights: '',
    systemInsights: '' // Added for system-generated insights
  });
  
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntryIndex, setCurrentEntryIndex] = useState(null);
  
  // State for filters
  const [filters, setFilters] = useState({
    searchTerm: '',
    dateRange: 'all', // 'all', 'week', 'month', 'year'
    timeOfDay: 'all' // 'all', 'morning', 'afternoon', 'evening'
  });

  // State for generating insights
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  
  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('journalEntries', JSON.stringify(journalEntries));
  }, [journalEntries]);
  
  // Handle input changes for new entry
  const handleInputChange = (field, value) => {
    setNewEntry({
      ...newEntry,
      [field]: value
    });
  };
  
  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };

  // Generate system insights based on entry content
  const generateSystemInsights = (content) => {
    if (!content || content.trim() === '') return '';
    
    const contentLower = content.toLowerCase();
    let insights = [];
    
    // Pattern recognition for emotional states
    if (contentLower.includes('happy') || contentLower.includes('excited') || contentLower.includes('joy') || 
        contentLower.includes('thrilled') || contentLower.includes('pleased')) {
      insights.push("You seem to be in a positive emotional state. This is a good time to tackle challenging tasks or make important decisions.");
    }
    
    if (contentLower.includes('sad') || contentLower.includes('depressed') || contentLower.includes('down') || 
        contentLower.includes('upset') || contentLower.includes('unhappy')) {
      insights.push("You appear to be experiencing some negative emotions. Consider practicing mindfulness techniques or speaking with someone you trust.");
    }
    
    if (contentLower.includes('stress') || contentLower.includes('anxious') || contentLower.includes('worried') || 
        contentLower.includes('overwhelm') || contentLower.includes('pressure')) {
      insights.push("You're expressing signs of stress or anxiety. Try breaking down your concerns into smaller, manageable tasks and consider relaxation techniques.");
    }
    
    // Career-related patterns
    if (contentLower.includes('interview') || contentLower.includes('job') || contentLower.includes('career') || 
        contentLower.includes('work') || contentLower.includes('promotion')) {
      insights.push("Career themes are present in your entry. Consider connecting this to your career goals and action plans in other sections of the app.");
    }
    
    // Growth and learning patterns
    if (contentLower.includes('learn') || contentLower.includes('growth') || contentLower.includes('develop') || 
        contentLower.includes('improve') || contentLower.includes('skill')) {
      insights.push("You're focused on personal growth and skill development. This aligns well with a growth mindset approach to challenges.");
    }
    
    // Relationship patterns
    if (contentLower.includes('colleague') || contentLower.includes('boss') || contentLower.includes('coworker') || 
        contentLower.includes('team') || contentLower.includes('manager')) {
      insights.push("Workplace relationships appear significant in this entry. Consider how these relationships impact your career trajectory and job satisfaction.");
    }
    
    // Challenge and obstacle patterns
    if (contentLower.includes('challenge') || contentLower.includes('difficult') || contentLower.includes('obstacle') || 
        contentLower.includes('problem') || contentLower.includes('issue')) {
      insights.push("You're facing challenges. Remember that obstacles often present opportunities for growth and demonstrating your problem-solving abilities.");
    }
    
    // Success patterns
    if (contentLower.includes('success') || contentLower.includes('accomplish') || contentLower.includes('achieve') || 
        contentLower.includes('win') || contentLower.includes('complete')) {
      insights.push("You're experiencing success. Take time to acknowledge your achievements and consider what factors contributed to this positive outcome.");
    }
    
    // Time management patterns
    if (contentLower.includes('deadline') || contentLower.includes('time') || contentLower.includes('schedule') || 
        contentLower.includes('late') || contentLower.includes('procrastinate')) {
      insights.push("Time management appears to be a theme. Consider reviewing your prioritization strategies and how you allocate time to different tasks.");
    }
    
    // If no specific patterns were found
    if (insights.length === 0) {
      // Analyze content length for general insights
      if (content.length > 500) {
        insights.push("You've written a detailed entry which shows deep reflection. Consider identifying key themes that could inform your career development.");
      } else {
        insights.push("Regular journaling, even with brief entries, helps build self-awareness. Consider expanding on your thoughts in future entries.");
      }
    }
    
    // Add a connection to other app features if we have enough content
    if (content.length > 200 && insights.length > 0) {
      insights.push("Consider how these reflections connect to your goals and action plans in other sections of the app.");
    }
    
    return insights.join("\n\n");
  };
  
  // Generate insights when content changes
  useEffect(() => {
    if (newEntry.content && newEntry.content.trim() !== '' && !isEditing) {
      const systemInsights = generateSystemInsights(newEntry.content);
      setNewEntry(prev => ({
        ...prev,
        systemInsights
      }));
    }
  }, [newEntry.content]);
  
  // Save new entry
  const saveEntry = () => {
    if (newEntry.content.trim() === '') {
      alert('Please enter some content for your journal entry.');
      return;
    }
    
    // Generate system insights if not already present
    let entryToSave = { ...newEntry };
    if (!entryToSave.systemInsights || entryToSave.systemInsights.trim() === '') {
      entryToSave.systemInsights = generateSystemInsights(entryToSave.content);
    }
    
    if (isEditing && currentEntryIndex !== null) {
      // Update existing entry
      const updatedEntries = [...journalEntries];
      updatedEntries[currentEntryIndex] = entryToSave;
      setJournalEntries(updatedEntries);
    } else {
      // Add new entry
      setJournalEntries([...journalEntries, entryToSave]);
    }
    
    // Reset form
    setNewEntry({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: 'morning',
      content: '',
      insights: '',
      systemInsights: ''
    });
    setIsEditing(false);
    setCurrentEntryIndex(null);
  };
  
  // Edit entry
  const editEntry = (index) => {
    setNewEntry(journalEntries[index]);
    setIsEditing(true);
    setCurrentEntryIndex(index);
  };
  
  // Delete entry
  const deleteEntry = (index) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      const updatedEntries = [...journalEntries];
      updatedEntries.splice(index, 1);
      setJournalEntries(updatedEntries);
      
      if (isEditing && currentEntryIndex === index) {
        setNewEntry({
          title: '',
          date: new Date().toISOString().split('T')[0],
          time: 'morning',
          content: '',
          insights: '',
          systemInsights: ''
        });
        setIsEditing(false);
        setCurrentEntryIndex(null);
      }
    }
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setNewEntry({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: 'morning',
      content: '',
      insights: '',
      systemInsights: ''
    });
    setIsEditing(false);
    setCurrentEntryIndex(null);
  };
  
  // Manually trigger system insights generation
  const triggerSystemInsights = () => {
    setIsGeneratingInsights(true);
    setTimeout(() => {
      const systemInsights = generateSystemInsights(newEntry.content);
      setNewEntry(prev => ({
        ...prev,
        systemInsights
      }));
      setIsGeneratingInsights(false);
    }, 1000); // Simulate processing time
  };
  
  // Filter entries
  const filteredEntries = journalEntries.filter(entry => {
    // Search term filter
    if (filters.searchTerm && 
        !(entry.title?.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
          entry.content?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          entry.insights?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          entry.systemInsights?.toLowerCase().includes(filters.searchTerm.toLowerCase()))) {
      return false;
    }
    
    // Date range filter
    if (filters.dateRange !== 'all' && entry.date) {
      const entryDate = new Date(entry.date);
      const today = new Date();
      
      switch (filters.dateRange) {
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          if (entryDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(today.getMonth() - 1);
          if (entryDate < monthAgo) return false;
          break;
        case 'year':
          const yearAgo = new Date();
          yearAgo.setFullYear(today.getFullYear() - 1);
          if (entryDate < yearAgo) return false;
          break;
        default:
          break;
      }
    }
    
    // Time of day filter
    if (filters.timeOfDay !== 'all' && entry.time !== filters.timeOfDay) {
      return false;
    }
    
    return true;
  });
  
  // Sort entries by date (newest first)
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date) - new Date(a.date);
  });
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ 
        background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: 'bold',
        marginBottom: '2rem'
      }}>
        Journal
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Entry Form */}
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          height: 'fit-content'
        }}>
          <h2>{isEditing ? 'Edit Entry' : 'New Entry'}</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title (Optional):</label>
            <input 
              type="text" 
              value={newEntry.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Give your entry a title"
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
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date:</label>
            <input 
              type="date" 
              value={newEntry.date || new Date().toISOString().split('T')[0]}
              onChange={(e) => handleInputChange('date', e.target.value)}
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
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Time of Day:</label>
            <select
              value={newEntry.time || 'morning'}
              onChange={(e) => handleInputChange('time', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '5px'
              }}
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Content:</label>
            <textarea 
              value={newEntry.content || ''}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Write your journal entry here..."
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
          </div>
          
          {/* System-generated insights */}
          {newEntry.content && newEntry.content.trim() !== '' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label>System-Generated Insights:</label>
                <button 
                  onClick={triggerSystemInsights}
                  disabled={isGeneratingInsights}
                  style={{
                    backgroundColor: 'rgba(10,177,150,0.2)',
                    border: 'none',
                    color: '#0AB196',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '5px',
                    cursor: isGeneratingInsights ? 'default' : 'pointer',
                    fontSize: '0.8rem',
                    opacity: isGeneratingInsights ? 0.7 : 1
                  }}
                >
                  {isGeneratingInsights ? 'Generating...' : 'Regenerate'}
                </button>
              </div>
              <div
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: 'rgba(10,177,150,0.1)',
                  color: 'white',
                  border: '1px solid rgba(10,177,150,0.3)',
                  borderRadius: '5px',
                  minHeight: '80px',
                  whiteSpace: 'pre-line'
                }}
              >
                {isGeneratingInsights ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80px' }}>
                    <span>Analyzing your entry...</span>
                  </div>
                ) : (
                  newEntry.systemInsights || 'No insights generated yet. Click "Regenerate" to analyze your entry.'
                )}
              </div>
            </div>
          )}
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Your Insights (Optional):</label>
            <textarea 
              value={newEntry.insights || ''}
              onChange={(e) => handleInputChange('insights', e.target.value)}
              placeholder="What insights or lessons did you gain from this experience?"
              rows={4}
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
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={saveEntry}
              style={{
                flex: 1,
                background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                border: 'none',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {isEditing ? 'Update Entry' : 'Save Entry'}
            </button>
            
            {isEditing && (
              <button 
                onClick={cancelEditing}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        
        {/* Entries List */}
        <div>
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: '1.5rem', 
            borderRadius: '10px',
            marginBottom: '1.5rem'
          }}>
            <h2>Filters</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Search:</label>
                <input 
                  type="text" 
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  placeholder="Search entries..."
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
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date Range:</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px'
                  }}
                >
                  <option value="all">All Time</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last 365 Days</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Time of Day:</label>
                <select
                  value={filters.timeOfDay}
                  onChange={(e) => handleFilterChange('timeOfDay', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px'
                  }}
                >
                  <option value="all">All Times</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </div>
            </div>
          </div>
          
          <h2>Journal Entries ({sortedEntries.length})</h2>
          
          {sortedEntries.length > 0 ? (
            sortedEntries.map((entry, index) => (
              <div 
                key={index}
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
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>
                      {entry.title || formatDate(entry.date)}
                    </h3>
                    <div style={{ 
                      display: 'flex', 
                      gap: '1rem',
                      fontSize: '0.9rem',
                      opacity: 0.7
                    }}>
                      <span>{formatDate(entry.date)}</span>
                      <span>{entry.time ? entry.time.charAt(0).toUpperCase() + entry.time.slice(1) : 'Morning'}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => editEntry(journalEntries.indexOf(entry))}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteEntry(journalEntries.indexOf(entry))}
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
                
                <div style={{ 
                  whiteSpace: 'pre-line',
                  marginBottom: (entry.insights || entry.systemInsights) ? '1rem' : 0
                }}>
                  {entry.content}
                </div>
                
                {/* Display both system-generated and user insights */}
                {(entry.systemInsights || entry.insights) && (
                  <div style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {entry.systemInsights && (
                      <div style={{ 
                        backgroundColor: 'rgba(10,177,150,0.1)', 
                        padding: '1rem', 
                        borderRadius: '5px'
                      }}>
                        <strong style={{ display: 'block', marginBottom: '0.5rem' }}>System Insights:</strong>
                        <div style={{ whiteSpace: 'pre-line' }}>
                          {entry.systemInsights}
                        </div>
                      </div>
                    )}
                    
                    {entry.insights && (
                      <div style={{ 
                        backgroundColor: 'rgba(255,255,255,0.1)', 
                        padding: '1rem', 
                        borderRadius: '5px'
                      }}>
                        <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Your Insights:</strong>
                        <div style={{ whiteSpace: 'pre-line' }}>
                          {entry.insights}
                        </div>
                      </div>
                    )}
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
              <p style={{ marginBottom: '1rem' }}>No journal entries found. Start writing your first entry!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;
