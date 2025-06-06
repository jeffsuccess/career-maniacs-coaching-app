import React, { useState, useEffect } from 'react';

const MindsetTechniques = () => {
  // State for expanded sections
  const [expandedSection, setExpandedSection] = useState(null);
  
  // Sample techniques data
  const [techniques, setTechniques] = useState([
    {
      id: 'neuroplasticity',
      title: 'Neuroplasticity: Rewire or Retire',
      description: 'The brain can physically rewire itself based on repeated focus and actions, thanks to BDNF (brain-derived neurotrophic factor).',
      quote: 'Where focus goes, energy flows.',
      practices: [
        {
          id: 1,
          date: '2025-06-03',
          notes: 'Started daily visualization practice for 10 minutes, focusing on successful interview scenarios.',
          results: 'Felt more confident during mock interview session.'
        },
        {
          id: 2,
          date: '2025-06-04',
          notes: 'Practiced reframing negative thoughts about my technical skills into growth opportunities.',
          results: 'Caught myself using more positive self-talk during coding challenge.'
        }
      ],
      progress: 35
    },
    {
      id: 'anchoring',
      title: 'State-Dependent Learning "Anchoring"',
      description: 'Your brain associates physical states with mental states. Create anchors that trigger peak performance states on demand.',
      quote: 'Your Anchors',
      practices: [
        {
          id: 1,
          date: '2025-06-02',
          notes: 'Created a power pose anchor - standing tall with hands on hips for 2 minutes before important calls.',
          results: 'Felt more authoritative during team presentation.'
        }
      ],
      progress: 20
    },
    {
      id: 'microWins',
      title: 'Dopamine-Driven Micro Wins',
      description: 'Small wins trigger the release of dopamine, creating momentum and motivation. Break big goals into micro-achievements.',
      quote: 'Today\'s Micro Wins:',
      practices: [
        {
          id: 1,
          date: '2025-06-05',
          notes: 'Broke down resume update into 5 small tasks and completed 3 of them.',
          results: 'Felt accomplished and motivated to continue tomorrow.'
        }
      ],
      progress: 15
    },
    {
      id: 'primeProgramming',
      title: 'Prime Time Mind Programming',
      description: 'The first 20 minutes after waking and the last 20 minutes before sleep are when your brain is most receptive to programming. Use these windows strategically.',
      quote: '',
      morningPractices: [
        {
          id: 1,
          date: '2025-06-04',
          notes: 'Read affirmations and visualized successful job interview for 10 minutes after waking.',
          results: 'Started the day with clear intention and positive mindset.'
        }
      ],
      eveningPractices: [
        {
          id: 1,
          date: '2025-06-04',
          notes: 'Reviewed accomplishments of the day and set intentions for tomorrow before sleep.',
          results: 'Fell asleep feeling satisfied with progress and clear on next steps.'
        }
      ],
      nsdrPractices: [
        {
          id: 1,
          date: '2025-06-05',
          notes: 'Practiced 20-minute NSDR session using the "Reveri" app.',
          results: 'Felt mentally refreshed and more creative afterward.'
        }
      ],
      progress: 40
    }
  ]);
  
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingTechniqueId, setEditingTechniqueId] = useState(null);
  const [editingPracticeId, setEditingPracticeId] = useState(null);
  const [practiceType, setPracticeType] = useState('practices'); // 'practices', 'morningPractices', 'eveningPractices', 'nsdrPractices'
  
  // Form data
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    notes: '',
    results: ''
  });
  
  // State for manual progress editing
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [editingProgressId, setEditingProgressId] = useState(null);
  const [progressValue, setProgressValue] = useState(0);
  
  // Toggle section expansion
  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
    setIsEditing(false);
    setIsEditingProgress(false);
  };
  
  // Start adding new practice
  const startAddingPractice = (techniqueId, type = 'practices') => {
    setEditingTechniqueId(techniqueId);
    setEditingPracticeId(null);
    setPracticeType(type);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      notes: '',
      results: ''
    });
    setIsEditing(true);
    setIsEditingProgress(false);
  };
  
  // Start editing practice
  const startEditingPractice = (techniqueId, practiceId, type = 'practices') => {
    const technique = techniques.find(t => t.id === techniqueId);
    let practice;
    
    if (type === 'practices') {
      practice = technique.practices.find(p => p.id === practiceId);
    } else if (type === 'morningPractices') {
      practice = technique.morningPractices.find(p => p.id === practiceId);
    } else if (type === 'eveningPractices') {
      practice = technique.eveningPractices.find(p => p.id === practiceId);
    } else if (type === 'nsdrPractices') {
      practice = technique.nsdrPractices.find(p => p.id === practiceId);
    }
    
    if (practice) {
      setEditingTechniqueId(techniqueId);
      setEditingPracticeId(practiceId);
      setPracticeType(type);
      setFormData({
        date: practice.date,
        notes: practice.notes,
        results: practice.results
      });
      setIsEditing(true);
      setIsEditingProgress(false);
    }
  };
  
  // Start editing progress
  const startEditingProgress = (techniqueId) => {
    const technique = techniques.find(t => t.id === techniqueId);
    if (technique) {
      setEditingProgressId(techniqueId);
      setProgressValue(technique.progress);
      setIsEditingProgress(true);
      setIsEditing(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Handle progress value change
  const handleProgressChange = (value) => {
    // Ensure value is between 0 and 100
    const newValue = Math.max(0, Math.min(100, value));
    setProgressValue(newValue);
  };
  
  // Save progress
  const saveProgress = () => {
    const updatedTechniques = techniques.map(technique => 
      technique.id === editingProgressId ? 
        { ...technique, progress: progressValue } : 
        technique
    );
    
    setTechniques(updatedTechniques);
    setIsEditingProgress(false);
    setEditingProgressId(null);
  };
  
  // Save practice
  const savePractice = () => {
    const updatedTechniques = [...techniques];
    const techniqueIndex = updatedTechniques.findIndex(t => t.id === editingTechniqueId);
    
    if (techniqueIndex !== -1) {
      const technique = { ...updatedTechniques[techniqueIndex] };
      
      // Initialize arrays if they don't exist
      if (!technique[practiceType]) {
        technique[practiceType] = [];
      }
      
      if (editingPracticeId) {
        // Update existing practice
        const practiceIndex = technique[practiceType].findIndex(p => p.id === editingPracticeId);
        if (practiceIndex !== -1) {
          technique[practiceType][practiceIndex] = {
            ...technique[practiceType][practiceIndex],
            ...formData
          };
        }
      } else {
        // Add new practice
        const newPractice = {
          id: technique[practiceType].length > 0 ? 
            Math.max(...technique[practiceType].map(p => p.id)) + 1 : 1,
          ...formData
        };
        technique[practiceType] = [...technique[practiceType], newPractice];
      }
      
      // Update progress based on number of practices
      const totalPractices = 
        (technique.practices?.length || 0) + 
        (technique.morningPractices?.length || 0) + 
        (technique.eveningPractices?.length || 0) + 
        (technique.nsdrPractices?.length || 0);
      
      // Simple progress calculation - more practices = more progress
      // In a real app, this would be more sophisticated
      technique.progress = Math.min(100, totalPractices * 10);
      
      updatedTechniques[techniqueIndex] = technique;
      setTechniques(updatedTechniques);
    }
    
    setIsEditing(false);
  };
  
  // Delete practice
  const deletePractice = () => {
    if (!editingPracticeId) return;
    
    const updatedTechniques = [...techniques];
    const techniqueIndex = updatedTechniques.findIndex(t => t.id === editingTechniqueId);
    
    if (techniqueIndex !== -1) {
      const technique = { ...updatedTechniques[techniqueIndex] };
      technique[practiceType] = technique[practiceType].filter(p => p.id !== editingPracticeId);
      
      // Update progress
      const totalPractices = 
        (technique.practices?.length || 0) + 
        (technique.morningPractices?.length || 0) + 
        (technique.eveningPractices?.length || 0) + 
        (technique.nsdrPractices?.length || 0);
      
      technique.progress = Math.min(100, totalPractices * 10);
      
      updatedTechniques[techniqueIndex] = technique;
      setTechniques(updatedTechniques);
    }
    
    setIsEditing(false);
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setIsEditingProgress(false);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Get practice type label
  const getPracticeTypeLabel = (type) => {
    switch (type) {
      case 'morningPractices':
        return 'Morning Programming';
      case 'eveningPractices':
        return 'Evening Programming';
      case 'nsdrPractices':
        return 'NSDR (Non-Sleep Deep Rest)';
      default:
        return 'Practice';
    }
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
        Mindset Techniques
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <p>Master these powerful mindset techniques to transform your thinking and achieve your career goals.</p>
      </div>
      
      {/* Techniques List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {techniques.map(technique => (
          <div 
            key={technique.id}
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              borderRadius: '10px',
              overflow: 'hidden'
            }}
          >
            {/* Technique Header */}
            <div 
              style={{ 
                padding: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: expandedSection === technique.id ? 'rgba(10,177,150,0.2)' : 'transparent',
                transition: 'background-color 0.3s ease'
              }}
              onClick={() => toggleSection(technique.id)}
            >
              <div>
                <h2 style={{ margin: '0 0 0.5rem 0' }}>{technique.title}</h2>
                <p style={{ margin: 0, opacity: 0.8 }}>{technique.description}</p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.25rem' }}>Progress</div>
                  <div style={{ fontWeight: 'bold' }}>{technique.progress}%</div>
                </div>
                
                <div style={{ 
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.3s ease'
                }}>
                  {expandedSection === technique.id ? '−' : '+'}
                </div>
              </div>
            </div>
            
            {/* Expanded Content */}
            {expandedSection === technique.id && (
              <div style={{ padding: '0 1.5rem 1.5rem' }}>
                {technique.quote && (
                  <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)', 
                    padding: '1rem', 
                    borderRadius: '5px',
                    marginBottom: '1.5rem',
                    fontStyle: 'italic'
                  }}>
                    "{technique.quote}"
                  </div>
                )}
                
                {/* Progress Bar and Manual Progress Edit */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Technique Mastery</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{technique.progress}%</span>
                      {!isEditingProgress && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingProgress(technique.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#16B3F7',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            padding: '0',
                            textDecoration: 'underline'
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {isEditingProgress && editingProgressId === technique.id ? (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={progressValue}
                          onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                          style={{ flexGrow: 1 }}
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={progressValue}
                          onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                          style={{
                            width: '60px',
                            padding: '0.25rem',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '5px',
                            textAlign: 'center'
                          }}
                        />
                        <span>%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={cancelEditing}
                          style={{
                            background: 'none',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveProgress}
                          style={{
                            background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                            border: 'none',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      backgroundColor: 'rgba(255,255,255,0.1)', 
                      borderRadius: '10px',
                      height: '8px'
                    }}>
                      <div style={{ 
                        width: `${technique.progress}%`, 
                        backgroundColor: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                        background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                        borderRadius: '10px',
                        height: '100%'
                      }} />
                    </div>
                  )}
                </div>
                
                {/* Regular Practices Section */}
                {technique.id !== 'primeProgramming' && (
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <h3 style={{ margin: 0 }}>Your Practice History</h3>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          startAddingPractice(technique.id);
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
                        Add Practice
                      </button>
                    </div>
                    
                    {technique.practices && technique.practices.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {technique.practices.map(practice => (
                          <div 
                            key={practice.id}
                            style={{ 
                              backgroundColor: 'rgba(255,255,255,0.05)', 
                              padding: '1rem', 
                              borderRadius: '5px',
                              cursor: 'pointer'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingPractice(technique.id, practice.id);
                            }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              marginBottom: '0.5rem'
                            }}>
                              <h4 style={{ margin: 0 }}>{formatDate(practice.date)}</h4>
                            </div>
                            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Practice:</strong> {practice.notes}</p>
                            <p style={{ margin: 0 }}><strong>Results:</strong> {practice.results}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No practices recorded yet. Click "Add Practice" to start tracking your progress.</p>
                    )}
                  </div>
                )}
                
                {/* Prime Time Programming Sections */}
                {technique.id === 'primeProgramming' && (
                  <div>
                    {/* Morning Programming */}
                    <div style={{ marginBottom: '2rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '1rem'
                      }}>
                        <h3 style={{ margin: 0 }}>Morning Programming</h3>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            startAddingPractice(technique.id, 'morningPractices');
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
                          Add Practice
                        </button>
                      </div>
                      
                      {technique.morningPractices && technique.morningPractices.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {technique.morningPractices.map(practice => (
                            <div 
                              key={practice.id}
                              style={{ 
                                backgroundColor: 'rgba(255,255,255,0.05)', 
                                padding: '1rem', 
                                borderRadius: '5px',
                                cursor: 'pointer'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditingPractice(technique.id, practice.id, 'morningPractices');
                              }}
                            >
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem'
                              }}>
                                <h4 style={{ margin: 0 }}>{formatDate(practice.date)}</h4>
                              </div>
                              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Practice:</strong> {practice.notes}</p>
                              <p style={{ margin: 0 }}><strong>Results:</strong> {practice.results}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No morning practices recorded yet.</p>
                      )}
                    </div>
                    
                    {/* Evening Programming */}
                    <div style={{ marginBottom: '2rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '1rem'
                      }}>
                        <h3 style={{ margin: 0 }}>Evening Programming</h3>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            startAddingPractice(technique.id, 'eveningPractices');
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
                          Add Practice
                        </button>
                      </div>
                      
                      {technique.eveningPractices && technique.eveningPractices.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {technique.eveningPractices.map(practice => (
                            <div 
                              key={practice.id}
                              style={{ 
                                backgroundColor: 'rgba(255,255,255,0.05)', 
                                padding: '1rem', 
                                borderRadius: '5px',
                                cursor: 'pointer'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditingPractice(technique.id, practice.id, 'eveningPractices');
                              }}
                            >
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem'
                              }}>
                                <h4 style={{ margin: 0 }}>{formatDate(practice.date)}</h4>
                              </div>
                              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Practice:</strong> {practice.notes}</p>
                              <p style={{ margin: 0 }}><strong>Results:</strong> {practice.results}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No evening practices recorded yet.</p>
                      )}
                    </div>
                    
                    {/* NSDR Practices */}
                    <div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '1rem'
                      }}>
                        <h3 style={{ margin: 0 }}>NSDR (Non-Sleep Deep Rest)</h3>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            startAddingPractice(technique.id, 'nsdrPractices');
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
                          Add Practice
                        </button>
                      </div>
                      
                      {technique.nsdrPractices && technique.nsdrPractices.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {technique.nsdrPractices.map(practice => (
                            <div 
                              key={practice.id}
                              style={{ 
                                backgroundColor: 'rgba(255,255,255,0.05)', 
                                padding: '1rem', 
                                borderRadius: '5px',
                                cursor: 'pointer'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditingPractice(technique.id, practice.id, 'nsdrPractices');
                              }}
                            >
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem'
                              }}>
                                <h4 style={{ margin: 0 }}>{formatDate(practice.date)}</h4>
                              </div>
                              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Practice:</strong> {practice.notes}</p>
                              <p style={{ margin: 0 }}><strong>Results:</strong> {practice.results}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No NSDR practices recorded yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Practice Form Modal */}
      {isEditing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1e2a38',
            borderRadius: '10px',
            padding: '2rem',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>
              {editingPracticeId ? 'Edit Practice' : 'Add New Practice'}: {getPracticeTypeLabel(practiceType)}
            </h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date:</label>
              <input 
                type="date"
                value={formData.date}
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
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Practice Notes:</label>
              <textarea 
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
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
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Results/Observations:</label>
              <textarea 
                value={formData.results}
                onChange={(e) => handleInputChange('results', e.target.value)}
                rows={4}
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
                {editingPracticeId && (
                  <button 
                    onClick={deletePractice}
                    style={{
                      background: 'rgba(255,82,82,0.2)',
                      border: '1px solid rgba(255,82,82,0.5)',
                      color: 'rgba(255,82,82,0.8)',
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
                  onClick={cancelEditing}
                  style={{
                    background: 'none',
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
                  onClick={savePractice}
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
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindsetTechniques;
