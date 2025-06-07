import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    insights: ''
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
  
  // Generate system insights based on journal content
  const generateSystemInsights = (content) => {
    if (!content || content.trim().length < 20) {
      return '';
    }
    
    // Analyze content for patterns and themes
    const lowerContent = content.toLowerCase();
    let insights = [];
    
    // Check for emotional patterns
    const emotionalWords = {
      positive: ['happy', 'excited', 'grateful', 'proud', 'confident', 'inspired', 'motivated', 'accomplished', 'joy', 'love'],
      negative: ['stressed', 'anxious', 'worried', 'frustrated', 'disappointed', 'sad', 'angry', 'overwhelmed', 'fear', 'doubt']
    };
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    emotionalWords.positive.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerContent.match(regex);
      if (matches) positiveCount += matches.length;
    });
    
    emotionalWords.negative.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerContent.match(regex);
      if (matches) negativeCount += matches.length;
    });
    
    // Determine emotional tone
    if (positiveCount > negativeCount && positiveCount > 0) {
      insights.push("Your entry has a generally positive emotional tone. Consider what factors contributed to this positive state and how you might maintain or build upon them.");
    } else if (negativeCount > positiveCount && negativeCount > 0) {
      insights.push("Your entry contains some challenging emotions. Consider what specific actions might help address these feelings or what support you might need.");
    }
    
    // Check for career-related themes
    const careerWords = ['job', 'career', 'work', 'interview', 'resume', 'application', 'company', 'position', 'role', 'promotion', 'manager', 'colleague', 'project'];
    let careerMentions = 0;
    
    careerWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerContent.match(regex);
      if (matches) careerMentions += matches.length;
    });
    
    if (careerMentions >= 3) {
      insights.push("Career themes appear significant in this entry. Consider connecting these reflections to your broader career goals and action plans.");
    }
    
    // Check for learning/growth themes
    const learningWords = ['learn', 'skill', 'growth', 'develop', 'improve', 'progress', 'knowledge', 'study', 'practice', 'training'];
    let learningMentions = 0;
    
    learningWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerContent.match(regex);
      if (matches) learningMentions += matches.length;
    });
    
    if (learningMentions >= 2) {
      insights.push("You're focusing on learning and growth. Consider setting specific, measurable goals related to these development areas.");
    }
    
    // Check for relationship themes
    const relationshipWords = ['friend', 'family', 'partner', 'relationship', 'connection', 'network', 'mentor', 'team', 'collaboration'];
    let relationshipMentions = 0;
    
    relationshipWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerContent.match(regex);
      if (matches) relationshipMentions += matches.length;
    });
    
    if (relationshipMentions >= 2) {
      insights.push("Relationships appear important in this entry. Consider how these connections support your personal and professional growth.");
    }
    
    // Check for challenge/obstacle themes
    const challengeWords = ['challenge', 'difficult', 'obstacle', 'problem', 'struggle', 'barrier', 'issue', 'conflict', 'hurdle'];
    let challengeMentions = 0;
    
    challengeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerContent.match(regex);
      if (matches) challengeMentions += matches.length;
    });
    
    if (challengeMentions >= 2) {
      insights.push("You're facing some challenges. Consider breaking these down into smaller, more manageable steps and identifying specific resources or support that could help.");
    }
    
    // Check for achievement/success themes
    const achievementWords = ['achieve', 'success', 'accomplish', 'complete', 'finish', 'win', 'milestone', 'goal', 'progress'];
    let achievementMentions = 0;
    
    achievementWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerContent.match(regex);
      if (matches) achievementMentions += matches.length;
    });
    
    if (achievementMentions >= 2) {
      insights.push("You're noting achievements and successes. Take time to celebrate these wins and consider what factors contributed to these positive outcomes.");
    }
    
    // Check for future planning
    const futureWords = ['plan', 'future', 'goal', 'aim', 'target', 'objective', 'aspire', 'hope', 'intend', 'tomorrow', 'next'];
    let futureMentions = 0;
    
    futureWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerContent.match(regex);
      if (matches) futureMentions += matches.length;
    });
    
    if (futureMentions >= 3) {
      insights.push("You're focused on future planning. Consider creating specific action steps with deadlines to move these plans forward.");
    }
    
    // Check for reflection on past
    const pastWords = ['yesterday', 'last week', 'previously', 'before', 'used to', 'in the past', 'reflection', 'remember', 'recall'];
    let pastMentions = 0;
    
    pastWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      const matches = lowerContent.match(regex);
      if (matches) pastMentions += matches.length;
    });
    
    if (pastMentions >= 2) {
      insights.push("You're reflecting on past experiences. Consider what specific lessons or patterns you can identify that might inform your current decisions and actions.");
    }
    
    // If no specific insights were generated, provide a general one
    if (insights.length === 0) {
      insights.push("Regular journaling helps build self-awareness. Consider reviewing your entries periodically to identify patterns in your thoughts, feelings, and behaviors.");
    }
    
    // Return formatted insights
    return insights.join("\n\n");
  };
  
  // Save new entry
  const saveEntry = () => {
    if (newEntry.content.trim() === '') {
      alert('Please enter some content for your journal entry.');
      return;
    }
    
    // Generate system insights
    const systemInsights = generateSystemInsights(newEntry.content);
    
    const entryToSave = {
      ...newEntry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      systemInsights: systemInsights
    };
    
    if (currentEntryIndex !== null) {
      // Update existing entry
      const updatedEntries = [...journalEntries];
      updatedEntries[currentEntryIndex] = {
        ...entryToSave,
        id: journalEntries[currentEntryIndex].id,
        createdAt: journalEntries[currentEntryIndex].createdAt,
        updatedAt: new Date().toISOString()
      };
      setJournalEntries(updatedEntries);
    } else {
      // Add new entry
      setJournalEntries([entryToSave, ...journalEntries]);
    }
    
    // Reset form
    setNewEntry({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: 'morning',
      content: '',
      insights: ''
    });
    setIsEditing(false);
    setCurrentEntryIndex(null);
  };
  
  // Edit entry
  const editEntry = (index) => {
    const entry = journalEntries[index];
    setNewEntry({
      title: entry.title || '',
      date: entry.date || new Date().toISOString().split('T')[0],
      time: entry.time || 'morning',
      content: entry.content || '',
      insights: entry.insights || ''
    });
    setCurrentEntryIndex(index);
    setIsEditing(true);
  };
  
  // Delete entry
  const deleteEntry = (index) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      const updatedEntries = [...journalEntries];
      updatedEntries.splice(index, 1);
      setJournalEntries(updatedEntries);
      
      if (currentEntryIndex === index) {
        setNewEntry({
          title: '',
          date: new Date().toISOString().split('T')[0],
          time: 'morning',
          content: '',
          insights: ''
        });
        setCurrentEntryIndex(null);
        setIsEditing(false);
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
      insights: ''
    });
    setCurrentEntryIndex(null);
    setIsEditing(false);
  };
  
  // Handle filter changes
  const handleFilterChange = (filter, value) => {
    setFilters({
      ...filters,
      [filter]: value
    });
  };
  
  // Filter entries
  const filteredEntries = journalEntries.filter(entry => {
    // Filter by search term
    if (filters.searchTerm && !(
      (entry.title && entry.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (entry.content && entry.content.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (entry.insights && entry.insights.toLowerCase().includes(filters.searchTerm.toLowerCase()))
    )) {
      return false;
    }
    
    // Filter by date range
    if (filters.dateRange !== 'all') {
      const entryDate = new Date(entry.date);
      const today = new Date();
      
      if (filters.dateRange === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        if (entryDate < oneWeekAgo) return false;
      } else if (filters.dateRange === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        if (entryDate < oneMonthAgo) return false;
      } else if (filters.dateRange === 'year') {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        if (entryDate < oneYearAgo) return false;
      }
    }
    
    // Filter by time of day
    if (filters.timeOfDay !== 'all' && entry.time !== filters.timeOfDay) {
      return false;
    }
    
    return true;
  });
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#0AB196', marginBottom: '2rem' }}>Journal</h1>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Journal Entry Form */}
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <h2>{isEditing ? 'Edit Journal Entry' : 'New Journal Entry'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); saveEntry(); }}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Title (optional):</label>
                <input 
                  type="text" 
                  value={newEntry.title} 
                  onChange={(e) => handleInputChange('title', e.target.value)} 
                  placeholder="Give your entry a title" 
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    backgroundColor: 'rgba(0,0,0,0.2)', 
                    color: 'white', 
                    border: '1px solid #555', 
                    borderRadius: '5px' 
                  }} 
                />
              </div>
              
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                <div style={{ flex: '1' }}>
                  <label>Date:</label>
                  <input 
                    type="date" 
                    value={newEntry.date} 
                    onChange={(e) => handleInputChange('date', e.target.value)} 
                    style={{ 
                      width: '100%', 
                      padding: '0.5rem', 
                      backgroundColor: 'rgba(0,0,0,0.2)', 
                      color: 'white', 
                      border: '1px solid #555', 
                      borderRadius: '5px' 
                    }} 
                  />
                </div>
                
                <div style={{ flex: '1' }}>
                  <label>Time of Day:</label>
                  <select 
                    value={newEntry.time} 
                    onChange={(e) => handleInputChange('time', e.target.value)} 
                    style={{ 
                      width: '100%', 
                      padding: '0.5rem', 
                      backgroundColor: 'rgba(0,0,0,0.2)', 
                      color: 'white', 
                      border: '1px solid #555', 
                      borderRadius: '5px' 
                    }}
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label>Content:</label>
                <textarea 
                  value={newEntry.content} 
                  onChange={(e) => handleInputChange('content', e.target.value)} 
                  placeholder="Write your thoughts, reflections, and experiences..." 
                  required 
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    backgroundColor: 'rgba(0,0,0,0.2)', 
                    color: 'white', 
                    border: '1px solid #555', 
                    borderRadius: '5px', 
                    minHeight: '200px' 
                  }} 
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label>Your Insights (optional):</label>
                <textarea 
                  value={newEntry.insights} 
                  onChange={(e) => handleInputChange('insights', e.target.value)} 
                  placeholder="What insights or lessons did you gain from this experience?" 
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    backgroundColor: 'rgba(0,0,0,0.2)', 
                    color: 'white', 
                    border: '1px solid #555', 
                    borderRadius: '5px', 
                    minHeight: '100px' 
                  }} 
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                {isEditing && (
                  <button 
                    type="button" 
                    onClick={cancelEditing} 
                    style={{ 
                      background: 'rgba(255,255,255,0.1)', 
                      border: '1px solid #555', 
                      color: 'white', 
                      padding: '10px 20px', 
                      borderRadius: '5px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button 
                  type="submit" 
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
                  {isEditing ? 'Update Entry' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Journal Entries List */}
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', marginBottom: '1.5rem' }}>
            <h2>Filter Entries</h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Search entries..." 
                value={filters.searchTerm} 
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)} 
                style={{ 
                  flex: '1 1 200px', 
                  padding: '0.5rem', 
                  backgroundColor: 'rgba(0,0,0,0.2)', 
                  color: 'white', 
                  border: '1px solid #555', 
                  borderRadius: '5px' 
                }} 
              />
              
              <select 
                value={filters.dateRange} 
                onChange={(e) => handleFilterChange('dateRange', e.target.value)} 
                style={{ 
                  flex: '1 1 100px', 
                  padding: '0.5rem', 
                  backgroundColor: 'rgba(0,0,0,0.2)', 
                  color: 'white', 
                  border: '1px solid #555', 
                  borderRadius: '5px' 
                }}
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
              
              <select 
                value={filters.timeOfDay} 
                onChange={(e) => handleFilterChange('timeOfDay', e.target.value)} 
                style={{ 
                  flex: '1 1 100px', 
                  padding: '0.5rem', 
                  backgroundColor: 'rgba(0,0,0,0.2)', 
                  color: 'white', 
                  border: '1px solid #555', 
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
          
          <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry, index) => (
                <div 
                  key={entry.id} 
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    padding: '1.5rem', 
                    borderRadius: '10px', 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)', 
                    marginBottom: '1.5rem' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: '#0AB196' }}>{entry.title || 'Untitled Entry'}</h3>
                    <div>
                      <button 
                        onClick={() => editEntry(index)} 
                        style={{ 
                          background: 'rgba(255,255,255,0.2)', 
                          border: 'none', 
                          color: 'white', 
                          padding: '5px 10px', 
                          borderRadius: '5px', 
                          cursor: 'pointer', 
                          marginRight: '0.5rem' 
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteEntry(index)} 
                        style={{ 
                          background: 'rgba(220,53,69,0.2)', 
                          border: 'none', 
                          color: '#dc3545', 
                          padding: '5px 10px', 
                          borderRadius: '5px', 
                          cursor: 'pointer' 
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                    opacity: 0.8
                  }}>
                    <span>{formatDate(entry.date)}</span>
                    <span style={{ 
                      backgroundColor: 'rgba(0,0,0,0.2)', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '15px', 
                      fontSize: '0.8rem' 
                    }}>
                      {entry.time.charAt(0).toUpperCase() + entry.time.slice(1)}
                    </span>
                  </div>
                  
                  <div style={{ 
                    whiteSpace: 'pre-line',
                    marginBottom: entry.insights || entry.systemInsights ? '1rem' : 0
                  }}>
                    {entry.content}
                  </div>
                  
                  {entry.systemInsights && (
                    <div style={{ 
                      backgroundColor: 'rgba(10,177,150,0.1)', 
                      padding: '1rem', 
                      borderRadius: '5px',
                      marginBottom: entry.insights ? '1rem' : 0
                    }}>
                      <strong>System Insights:</strong>
                      <div style={{ whiteSpace: 'pre-line' }}>
                        {entry.systemInsights}
                      </div>
                    </div>
                  )}
                  
                  {entry.insights && (
                    <div style={{ 
                      backgroundColor: 'rgba(10,177,150,0.1)', 
                      padding: '1rem', 
                      borderRadius: '5px'
                    }}>
                      <strong>Your Insights:</strong>
                      <div style={{ whiteSpace: 'pre-line' }}>
                        {entry.insights}
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
                <p>No journal entries found. Start writing your first entry!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;
