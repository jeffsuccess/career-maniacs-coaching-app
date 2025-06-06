import React, { useState } from 'react';

const Journal = () => {
  // Sample journal entries data
  const [entries, setEntries] = useState([
    {
      id: 1,
      date: '2025-06-05',
      morning: {
        mood: 'Energized',
        text: 'Woke up feeling refreshed and ready to tackle the day. My top priority is preparing for tomorrow\'s presentation.',
        goals: ['Complete presentation slides', 'Practice delivery twice', 'Review talking points']
      },
      evening: {
        mood: 'Satisfied',
        text: 'Productive day overall. Finished the presentation slides and practiced once. Need to do one more practice run tomorrow morning.',
        accomplishments: ['Completed slides', 'Had a productive meeting with the team', 'Scheduled all interviews for next week'],
        improvements: ['Could have taken a proper lunch break', 'Got distracted by emails a few times']
      },
      gratitude: {
        items: [
          'Grateful for my supportive team who provided feedback on my presentation',
          'Thankful for the quiet morning that allowed me to focus',
          'Appreciative of the technology that makes remote collaboration possible'
        ]
      }
    },
    {
      id: 2,
      date: '2025-06-04',
      morning: {
        mood: 'Anxious',
        text: 'Feeling a bit overwhelmed with the number of tasks on my plate. Need to prioritize better today.',
        goals: ['Organize task list by priority', 'Block focus time for key projects', 'Limit meeting time to 2 hours']
      },
      evening: {
        mood: 'Relieved',
        text: 'Much better day than expected. Prioritizing tasks helped tremendously. Still have work to do, but feeling more in control.',
        accomplishments: ['Organized all tasks', 'Completed two high-priority items', 'Had a good conversation with my mentor'],
        improvements: ['Still spent too much time in meetings', 'Need to communicate boundaries better']
      },
      gratitude: {
        items: [
          'Grateful for my mentor\'s guidance and perspective',
          'Thankful for the productivity techniques I\'ve learned',
          'Appreciative of my health and ability to handle stress better than before'
        ]
      }
    },
    {
      id: 3,
      date: '2025-06-03',
      morning: {
        mood: 'Focused',
        text: 'Clear objectives for today. Planning to make significant progress on the project proposal.',
        goals: ['Draft project scope', 'Research competitors', 'Outline budget needs']
      },
      evening: {
        mood: 'Accomplished',
        text: 'Great progress on the proposal. Research took longer than expected but yielded valuable insights.',
        accomplishments: ['Completed project scope draft', 'Found key differentiators from competitors', 'Started budget outline'],
        improvements: ['Need to allocate more time for research in the future', 'Should have asked for help with the budget section']
      },
      gratitude: {
        items: [
          'Grateful for access to research resources that made my work easier',
          'Thankful for the quiet workspace that helped me focus',
          'Appreciative of my previous experience that informed this proposal'
        ]
      }
    }
  ]);
  
  // State for current entry being viewed or edited
  const [currentEntry, setCurrentEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('morning'); // 'morning', 'evening', or 'gratitude'
  
  // State for new entry form
  const [newEntryDate, setNewEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  
  // State for insights generation
  const [insightsPeriod, setInsightsPeriod] = useState('day');
  const [showInsights, setShowInsights] = useState(false);
  const [insightsDate, setInsightsDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Form data for editing
  const [formData, setFormData] = useState({
    morning: {
      mood: '',
      text: '',
      goals: []
    },
    evening: {
      mood: '',
      text: '',
      accomplishments: [],
      improvements: []
    },
    gratitude: {
      items: []
    }
  });
  
  // Handle selecting an entry to view
  const handleSelectEntry = (id) => {
    const entry = entries.find(e => e.id === id);
    setCurrentEntry(entry);
    setIsEditing(false);
    setActiveSection('morning');
  };
  
  // Start editing an entry
  const startEditing = () => {
    if (currentEntry) {
      setFormData({
        morning: { ...currentEntry.morning },
        evening: { ...currentEntry.evening },
        gratitude: { ...currentEntry.gratitude }
      });
      setIsEditing(true);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (section, field, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    });
  };
  
  // Handle list item changes (goals, accomplishments, improvements, gratitude)
  const handleListChange = (section, field, index, value) => {
    const updatedList = [...formData[section][field]];
    updatedList[index] = value;
    
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: updatedList
      }
    });
  };
  
  // Add new list item
  const addListItem = (section, field) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: [...formData[section][field], '']
      }
    });
  };
  
  // Remove list item
  const removeListItem = (section, field, index) => {
    const updatedList = [...formData[section][field]];
    updatedList.splice(index, 1);
    
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: updatedList
      }
    });
  };
  
  // Save entry
  const saveEntry = () => {
    if (currentEntry) {
      // Update existing entry
      setEntries(entries.map(entry => 
        entry.id === currentEntry.id ? 
          { ...entry, morning: formData.morning, evening: formData.evening, gratitude: formData.gratitude } : 
          entry
      ));
      setCurrentEntry({ ...currentEntry, morning: formData.morning, evening: formData.evening, gratitude: formData.gratitude });
    } else {
      // Add new entry
      const newEntry = {
        id: entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 1,
        date: newEntryDate,
        morning: formData.morning,
        evening: formData.evening,
        gratitude: formData.gratitude
      };
      setEntries([...entries, newEntry]);
      setCurrentEntry(newEntry);
      setShowNewEntryForm(false);
    }
    setIsEditing(false);
  };
  
  // Start adding new entry
  const startAddingEntry = () => {
    setCurrentEntry(null);
    setFormData({
      morning: {
        mood: '',
        text: '',
        goals: ['']
      },
      evening: {
        mood: '',
        text: '',
        accomplishments: [''],
        improvements: ['']
      },
      gratitude: {
        items: ['']
      }
    });
    setNewEntryDate(new Date().toISOString().split('T')[0]);
    setShowNewEntryForm(true);
    setIsEditing(true);
    setActiveSection('morning');
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setShowNewEntryForm(false);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Generate insights based on journal entries
  const generateInsights = () => {
    // This would be more sophisticated in a real implementation
    // For now, we'll generate some sample insights based on the period
    
    let insights = {
      moodTrends: [],
      accomplishmentHighlights: [],
      improvementAreas: [],
      gratitudeThemes: [],
      summary: ''
    };
    
    // Filter entries based on selected period
    const filteredEntries = filterEntriesByPeriod(entries, insightsPeriod, insightsDate);
    
    if (filteredEntries.length === 0) {
      return {
        ...insights,
        summary: 'No journal entries found for the selected period.'
      };
    }
    
    // Analyze moods
    const morningMoods = filteredEntries.map(entry => entry.morning?.mood).filter(Boolean);
    const eveningMoods = filteredEntries.map(entry => entry.evening?.mood).filter(Boolean);
    
    const allMoods = [...morningMoods, ...eveningMoods];
    const moodCounts = allMoods.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});
    
    insights.moodTrends = Object.entries(moodCounts)
      .map(([mood, count]) => ({ mood, count, percentage: Math.round((count / allMoods.length) * 100) }))
      .sort((a, b) => b.count - a.count);
    
    // Analyze accomplishments
    const allAccomplishments = filteredEntries
      .flatMap(entry => entry.evening?.accomplishments || [])
      .filter(Boolean);
    
    insights.accomplishmentHighlights = allAccomplishments.slice(0, 5);
    
    // Analyze improvement areas
    const allImprovements = filteredEntries
      .flatMap(entry => entry.evening?.improvements || [])
      .filter(Boolean);
    
    insights.improvementAreas = allImprovements.slice(0, 5);
    
    // Analyze gratitude
    const allGratitude = filteredEntries
      .flatMap(entry => entry.gratitude?.items || [])
      .filter(Boolean);
    
    insights.gratitudeThemes = allGratitude.slice(0, 5);
    
    // Generate summary
    insights.summary = `Over this ${insightsPeriod}, you were predominantly ${
      insights.moodTrends[0]?.mood || 'neutral'
    }. You accomplished ${allAccomplishments.length} tasks and identified ${
      allImprovements.length
    } areas for improvement. You expressed gratitude ${allGratitude.length} times.`;
    
    return insights;
  };
  
  // Filter entries based on selected period and date
  const filterEntriesByPeriod = (entries, period, dateString) => {
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      
      switch (period) {
        case 'day':
          return entryDate.getTime() === targetDate.getTime();
        
        case 'week': {
          // Get start of week (Sunday) and end of week (Saturday)
          const startOfWeek = new Date(targetDate);
          startOfWeek.setDate(targetDate.getDate() - targetDate.getDay());
          
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          
          return entryDate >= startOfWeek && entryDate <= endOfWeek;
        }
        
        case 'month': {
          return entryDate.getMonth() === targetDate.getMonth() && 
                 entryDate.getFullYear() === targetDate.getFullYear();
        }
        
        case 'quarter': {
          const entryQuarter = Math.floor(entryDate.getMonth() / 3);
          const targetQuarter = Math.floor(targetDate.getMonth() / 3);
          
          return entryQuarter === targetQuarter && 
                 entryDate.getFullYear() === targetDate.getFullYear();
        }
        
        case 'year': {
          return entryDate.getFullYear() === targetDate.getFullYear();
        }
        
        default:
          return false;
      }
    });
  };
  
  // Get period label for insights
  const getPeriodLabel = () => {
    const date = new Date(insightsDate);
    
    switch (insightsPeriod) {
      case 'day':
        return formatDate(insightsDate);
      
      case 'week': {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return `Week of ${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
      }
      
      case 'month': {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
      
      case 'quarter': {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      }
      
      case 'year': {
        return date.getFullYear().toString();
      }
      
      default:
        return '';
    }
  };
  
  // Toggle insights view
  const toggleInsights = () => {
    setShowInsights(!showInsights);
    if (!showInsights) {
      setInsightsDate(new Date().toISOString().split('T')[0]);
      setInsightsPeriod('day');
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
      
      <div style={{ marginBottom: '2rem' }}>
        <p>Record your daily reflections, track your progress, and practice gratitude.</p>
      </div>
      
      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <button 
            onClick={toggleInsights}
            style={{
              backgroundColor: showInsights ? 'rgba(10,177,150,0.2)' : 'rgba(255,255,255,0.1)',
              border: showInsights ? '1px solid #0AB196' : '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '1rem'
            }}
          >
            {showInsights ? 'Hide Insights' : 'Show Insights'}
          </button>
        </div>
        
        <button 
          onClick={startAddingEntry}
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
          Add New Entry
        </button>
      </div>
      
      {/* Insights Section */}
      {showInsights && (
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          marginBottom: '2rem'
        }}>
          <h2>Journal Insights</h2>
          
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Time Period:</label>
              <select
                value={insightsPeriod}
                onChange={(e) => setInsightsPeriod(e.target.value)}
                style={{
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '5px'
                }}
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="quarter">Quarter</option>
                <option value="year">Year</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date:</label>
              <input 
                type="date" 
                value={insightsDate}
                onChange={(e) => setInsightsDate(e.target.value)}
                style={{
                  padding: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '5px'
                }}
              />
            </div>
            
            <div style={{ alignSelf: 'flex-end' }}>
              <button 
                onClick={() => setInsightsDate(new Date().toISOString().split('T')[0])}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Today
              </button>
            </div>
          </div>
          
          {/* Insights Content */}
          <div>
            <h3>{getPeriodLabel()}</h3>
            
            {(() => {
              const insights = generateInsights();
              
              return (
                <div>
                  <p style={{ marginBottom: '1rem' }}>{insights.summary}</p>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginTop: '1.5rem'
                  }}>
                    {/* Mood Trends */}
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '8px'
                    }}>
                      <h4>Mood Trends</h4>
                      {insights.moodTrends.length > 0 ? (
                        <div>
                          {insights.moodTrends.map((mood, index) => (
                            <div key={index} style={{ marginBottom: '0.5rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{mood.mood}</span>
                                <span>{mood.percentage}%</span>
                              </div>
                              <div style={{ 
                                width: '100%', 
                                backgroundColor: 'rgba(255,255,255,0.1)', 
                                borderRadius: '4px',
                                height: '6px',
                                marginTop: '4px'
                              }}>
                                <div style={{ 
                                  width: `${mood.percentage}%`, 
                                  backgroundColor: '#0AB196',
                                  borderRadius: '4px',
                                  height: '100%'
                                }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No mood data available.</p>
                      )}
                    </div>
                    
                    {/* Accomplishments */}
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '8px'
                    }}>
                      <h4>Top Accomplishments</h4>
                      {insights.accomplishmentHighlights.length > 0 ? (
                        <ul style={{ paddingLeft: '1.5rem' }}>
                          {insights.accomplishmentHighlights.map((item, index) => (
                            <li key={index} style={{ marginBottom: '0.5rem' }}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No accomplishments recorded.</p>
                      )}
                    </div>
                    
                    {/* Improvement Areas */}
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '8px'
                    }}>
                      <h4>Areas for Improvement</h4>
                      {insights.improvementAreas.length > 0 ? (
                        <ul style={{ paddingLeft: '1.5rem' }}>
                          {insights.improvementAreas.map((item, index) => (
                            <li key={index} style={{ marginBottom: '0.5rem' }}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No improvement areas recorded.</p>
                      )}
                    </div>
                    
                    {/* Gratitude Themes */}
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '8px'
                    }}>
                      <h4>Gratitude Highlights</h4>
                      {insights.gratitudeThemes.length > 0 ? (
                        <ul style={{ paddingLeft: '1.5rem' }}>
                          {insights.gratitudeThemes.map((item, index) => (
                            <li key={index} style={{ marginBottom: '0.5rem' }}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No gratitude entries recorded.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Entries List */}
        <div style={{ 
          width: '300px', 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          height: 'fit-content',
          flexShrink: 0
        }}>
          <h2>Journal Entries</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {entries.sort((a, b) => new Date(b.date) - new Date(a.date)).map(entry => (
              <div 
                key={entry.id}
                style={{ 
                  backgroundColor: currentEntry?.id === entry.id ? 'rgba(10,177,150,0.2)' : 'rgba(255,255,255,0.05)', 
                  padding: '1rem', 
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleSelectEntry(entry.id)}
              >
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{formatDate(entry.date)}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {entry.morning && (
                    <span style={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '20px',
                      fontSize: '0.8rem'
                    }}>
                      AM
                    </span>
                  )}
                  
                  {entry.evening && (
                    <span style={{ 
                      backgroundColor: 'rgba(255,255,255,0.1)', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '20px',
                      fontSize: '0.8rem'
                    }}>
                      PM
                    </span>
                  )}
                  
                  {entry.gratitude && entry.gratitude.items && entry.gratitude.items.length > 0 && (
                    <span style={{ 
                      backgroundColor: 'rgba(10,177,150,0.2)', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '20px',
                      fontSize: '0.8rem'
                    }}>
                      Gratitude
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {entries.length === 0 && (
              <p>No journal entries yet. Click "Add New Entry" to get started.</p>
            )}
          </div>
        </div>
        
        {/* Entry Details or Form */}
        <div style={{ 
          flex: 1, 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          minWidth: '300px'
        }}>
          {isEditing ? (
            /* Edit Form */
            <div>
              <h2>{currentEntry ? 'Edit Entry' : 'New Entry'}</h2>
              
              {!currentEntry && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date:</label>
                  <input 
                    type="date" 
                    value={newEntryDate}
                    onChange={(e) => setNewEntryDate(e.target.value)}
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
              )}
              
              {/* Section Tabs */}
              <div style={{ 
                display: 'flex', 
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                marginBottom: '1.5rem'
              }}>
                <button 
                  onClick={() => setActiveSection('morning')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeSection === 'morning' ? '2px solid #0AB196' : 'none',
                    color: activeSection === 'morning' ? '#0AB196' : 'white',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontWeight: activeSection === 'morning' ? 'bold' : 'normal'
                  }}
                >
                  Morning
                </button>
                
                <button 
                  onClick={() => setActiveSection('evening')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeSection === 'evening' ? '2px solid #0AB196' : 'none',
                    color: activeSection === 'evening' ? '#0AB196' : 'white',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontWeight: activeSection === 'evening' ? 'bold' : 'normal'
                  }}
                >
                  Evening
                </button>
                
                <button 
                  onClick={() => setActiveSection('gratitude')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeSection === 'gratitude' ? '2px solid #0AB196' : 'none',
                    color: activeSection === 'gratitude' ? '#0AB196' : 'white',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontWeight: activeSection === 'gratitude' ? 'bold' : 'normal'
                  }}
                >
                  Gratitude
                </button>
              </div>
              
              {/* Morning Section */}
              {activeSection === 'morning' && (
                <div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Mood:</label>
                    <input 
                      type="text" 
                      value={formData.morning.mood}
                      onChange={(e) => handleInputChange('morning', 'mood', e.target.value)}
                      placeholder="How are you feeling this morning?"
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
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Morning Reflection:</label>
                    <textarea 
                      value={formData.morning.text}
                      onChange={(e) => handleInputChange('morning', 'text', e.target.value)}
                      placeholder="What's on your mind this morning? What are your intentions for today?"
                      style={{
                        width: '100%',
                        minHeight: '150px',
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
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Today's Goals:</label>
                    {formData.morning.goals && formData.morning.goals.map((goal, index) => (
                      <div 
                        key={index}
                        style={{ 
                          display: 'flex', 
                          gap: '0.5rem',
                          marginBottom: '0.5rem'
                        }}
                      >
                        <input 
                          type="text" 
                          value={goal}
                          onChange={(e) => handleListChange('morning', 'goals', index, e.target.value)}
                          placeholder="Enter a goal for today"
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
                          onClick={() => removeListItem('morning', 'goals', index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontSize: '1.2rem'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => addListItem('morning', 'goals')}
                      style={{
                        background: 'none',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginTop: '0.5rem'
                      }}
                    >
                      + Add Goal
                    </button>
                  </div>
                </div>
              )}
              
              {/* Evening Section */}
              {activeSection === 'evening' && (
                <div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Mood:</label>
                    <input 
                      type="text" 
                      value={formData.evening.mood}
                      onChange={(e) => handleInputChange('evening', 'mood', e.target.value)}
                      placeholder="How are you feeling this evening?"
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
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Evening Reflection:</label>
                    <textarea 
                      value={formData.evening.text}
                      onChange={(e) => handleInputChange('evening', 'text', e.target.value)}
                      placeholder="How did your day go? What are your thoughts as you wind down?"
                      style={{
                        width: '100%',
                        minHeight: '150px',
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
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Today's Accomplishments:</label>
                    {formData.evening.accomplishments && formData.evening.accomplishments.map((item, index) => (
                      <div 
                        key={index}
                        style={{ 
                          display: 'flex', 
                          gap: '0.5rem',
                          marginBottom: '0.5rem'
                        }}
                      >
                        <input 
                          type="text" 
                          value={item}
                          onChange={(e) => handleListChange('evening', 'accomplishments', index, e.target.value)}
                          placeholder="What did you accomplish today?"
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
                          onClick={() => removeListItem('evening', 'accomplishments', index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontSize: '1.2rem'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => addListItem('evening', 'accomplishments')}
                      style={{
                        background: 'none',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginTop: '0.5rem'
                      }}
                    >
                      + Add Accomplishment
                    </button>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Areas for Improvement:</label>
                    {formData.evening.improvements && formData.evening.improvements.map((item, index) => (
                      <div 
                        key={index}
                        style={{ 
                          display: 'flex', 
                          gap: '0.5rem',
                          marginBottom: '0.5rem'
                        }}
                      >
                        <input 
                          type="text" 
                          value={item}
                          onChange={(e) => handleListChange('evening', 'improvements', index, e.target.value)}
                          placeholder="What could you improve tomorrow?"
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
                          onClick={() => removeListItem('evening', 'improvements', index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontSize: '1.2rem'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => addListItem('evening', 'improvements')}
                      style={{
                        background: 'none',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginTop: '0.5rem'
                      }}
                    >
                      + Add Improvement Area
                    </button>
                  </div>
                </div>
              )}
              
              {/* Gratitude Section */}
              {activeSection === 'gratitude' && (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <h3>Daily Gratitude Practice</h3>
                    <p style={{ marginBottom: '1rem' }}>
                      Record things you're grateful for today. Practicing gratitude has been shown to increase happiness, 
                      reduce depression, and improve overall well-being.
                    </p>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>I am grateful for:</label>
                    {formData.gratitude.items && formData.gratitude.items.map((item, index) => (
                      <div 
                        key={index}
                        style={{ 
                          display: 'flex', 
                          gap: '0.5rem',
                          marginBottom: '0.5rem'
                        }}
                      >
                        <input 
                          type="text" 
                          value={item}
                          onChange={(e) => handleListChange('gratitude', 'items', index, e.target.value)}
                          placeholder="What are you grateful for today?"
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
                          onClick={() => removeListItem('gratitude', 'items', index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontSize: '1.2rem'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => addListItem('gratitude', 'items')}
                      style={{
                        background: 'none',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        padding: '0.5rem',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginTop: '0.5rem'
                      }}
                    >
                      + Add Gratitude Item
                    </button>
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1rem' }}>
                <button 
                  onClick={cancelEditing}
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
                  onClick={saveEntry}
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
                  Save Entry
                </button>
              </div>
            </div>
          ) : currentEntry ? (
            /* Entry Details View */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <h2>{formatDate(currentEntry.date)}</h2>
                <button 
                  onClick={startEditing}
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
                  Edit Entry
                </button>
              </div>
              
              {/* Section Tabs */}
              <div style={{ 
                display: 'flex', 
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                marginBottom: '1.5rem'
              }}>
                <button 
                  onClick={() => setActiveSection('morning')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeSection === 'morning' ? '2px solid #0AB196' : 'none',
                    color: activeSection === 'morning' ? '#0AB196' : 'white',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontWeight: activeSection === 'morning' ? 'bold' : 'normal'
                  }}
                >
                  Morning
                </button>
                
                <button 
                  onClick={() => setActiveSection('evening')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeSection === 'evening' ? '2px solid #0AB196' : 'none',
                    color: activeSection === 'evening' ? '#0AB196' : 'white',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontWeight: activeSection === 'evening' ? 'bold' : 'normal'
                  }}
                >
                  Evening
                </button>
                
                <button 
                  onClick={() => setActiveSection('gratitude')}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeSection === 'gratitude' ? '2px solid #0AB196' : 'none',
                    color: activeSection === 'gratitude' ? '#0AB196' : 'white',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontWeight: activeSection === 'gratitude' ? 'bold' : 'normal'
                  }}
                >
                  Gratitude
                </button>
              </div>
              
              {/* Morning Section */}
              {activeSection === 'morning' && currentEntry.morning && (
                <div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3>Morning Mood</h3>
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '5px'
                    }}>
                      {currentEntry.morning.mood || 'No mood recorded'}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3>Morning Reflection</h3>
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '5px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {currentEntry.morning.text || 'No reflection recorded'}
                    </div>
                  </div>
                  
                  <div>
                    <h3>Today's Goals</h3>
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '5px'
                    }}>
                      {currentEntry.morning.goals && currentEntry.morning.goals.length > 0 ? (
                        <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                          {currentEntry.morning.goals.map((goal, index) => (
                            <li key={index} style={{ marginBottom: '0.5rem' }}>{goal}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No goals recorded</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Evening Section */}
              {activeSection === 'evening' && currentEntry.evening && (
                <div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3>Evening Mood</h3>
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '5px'
                    }}>
                      {currentEntry.evening.mood || 'No mood recorded'}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3>Evening Reflection</h3>
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '5px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {currentEntry.evening.text || 'No reflection recorded'}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3>Today's Accomplishments</h3>
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '5px'
                    }}>
                      {currentEntry.evening.accomplishments && currentEntry.evening.accomplishments.length > 0 ? (
                        <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                          {currentEntry.evening.accomplishments.map((item, index) => (
                            <li key={index} style={{ marginBottom: '0.5rem' }}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No accomplishments recorded</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3>Areas for Improvement</h3>
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '5px'
                    }}>
                      {currentEntry.evening.improvements && currentEntry.evening.improvements.length > 0 ? (
                        <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                          {currentEntry.evening.improvements.map((item, index) => (
                            <li key={index} style={{ marginBottom: '0.5rem' }}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No improvement areas recorded</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Gratitude Section */}
              {activeSection === 'gratitude' && (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <h3>Daily Gratitude Practice</h3>
                    <p>
                      Practicing gratitude has been shown to increase happiness, reduce depression, and improve overall well-being.
                    </p>
                  </div>
                  
                  <div>
                    <h3>I am grateful for:</h3>
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '5px'
                    }}>
                      {currentEntry.gratitude && currentEntry.gratitude.items && currentEntry.gratitude.items.length > 0 ? (
                        <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                          {currentEntry.gratitude.items.map((item, index) => (
                            <li key={index} style={{ marginBottom: '0.5rem' }}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No gratitude items recorded</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* No Entry Selected */
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <h2>Select an entry or add a new one</h2>
              <p>Record your daily reflections, track your progress, and practice gratitude.</p>
              <button 
                onClick={startAddingEntry}
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
                Add Your First Entry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;
