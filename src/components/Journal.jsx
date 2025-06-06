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
  
  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };
  
  // Save new entry
  const saveEntry = () => {
    if (newEntry.content.trim() === '') {
      alert('Please enter some content for your journal entry.');
      return;
    }
    
    if (isEditing && currentEntryIndex !== null) {
      // Update existing entry
      const updatedEntries = [...journalEntries];
      updatedEntries[currentEntryIndex] = newEntry;
      setJournalEntries(updatedEntries);
    } else {
      // Add new entry
      setJournalEntries([...journalEntries, newEntry]);
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
          insights: ''
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
      insights: ''
    });
    setIsEditing(false);
    setCurrentEntryIndex(null);
  };
  
  // Filter entries
  const filteredEntries = journalEntries.filter(entry => {
    // Search term filter
    if (filters.searchTerm && 
        !(entry.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
          entry.content.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          entry.insights.toLowerCase().includes(filters.searchTerm.toLowerCase()))) {
      return false;
    }
    
    // Date range filter
    if (filters.dateRange !== 'all') {
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
              value={newEntry.title}
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
              value={newEntry.date}
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
              value={newEntry.time}
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
              value={newEntry.content}
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
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Insights (Optional):</label>
            <textarea 
              value={newEntry.insights}
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
                      <span>{entry.time.charAt(0).toUpperCase() + entry.time.slice(1)}</span>
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
                  marginBottom: entry.insights ? '1rem' : 0
                }}>
                  {entry.content}
                </div>
                
                {entry.insights && (
                  <div style={{ 
                    backgroundColor: 'rgba(10,177,150,0.1)', 
                    padding: '1rem', 
                    borderRadius: '5px'
                  }}>
                    <strong>Insights:</strong>
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
  );
};

export default Journal;
