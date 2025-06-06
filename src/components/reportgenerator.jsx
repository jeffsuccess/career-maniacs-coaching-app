import React, { useState, useEffect } from 'react';

const ReportGenerator = () => {
  // State for application data loaded from localStorage
  const [applicationData, setApplicationData] = useState({
    goals: [],
    tasks: [], // From ActionPlan
    journalEntries: [],
    mindsetPractices: [],
    stories: [], // From StorytellingPractice
    targetCompanies: [],
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadedData = {
      goals: JSON.parse(localStorage.getItem('goals') || '[]'),
      tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
      journalEntries: JSON.parse(localStorage.getItem('journalEntries') || '[]'),
      mindsetPractices: JSON.parse(localStorage.getItem('mindsetTechniques') || '[]'),
      stories: JSON.parse(localStorage.getItem('storytellingPracticeStories') || '[]'),
      targetCompanies: JSON.parse(localStorage.getItem('targetCompanies') || '[]'),
    };
    setApplicationData(loadedData);
  }, []);

  // State for report configuration
  const [reportConfig, setReportConfig] = useState({
    title: 'Career Progress Report',
    includeGoals: true,
    includeGoalsDetails: true,
    includeJournal: true,
    includeJournalInsightsOnly: false,
    includeJournalDetails: true,
    includeMindset: true,
    includeMindsetDetails: true,
    includeStoryVault: true, // Story Vault and StorytellingPractice use the same 'stories' data
    includeStoryVaultDetails: true,
    includeStorytellingPractice: true,
    includeStorytellingPracticeDetails: true,
    includeTargetCompanies: true,
    includeTargetCompaniesDetails: true,
    includeActionPlan: true,
    includeActionPlanDetails: true,
    dateRange: 'all', // 'all', 'week', 'month', 'quarter', 'year', 'custom'
    customStartDate: '',
    customEndDate: '',
    format: 'pdf' // 'pdf', 'html', 'text'
  });
  
  // State for showing preview
  const [showPreview, setShowPreview] = useState(false);

  // Helper function to format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Assuming dateString is YYYY-MM-DD. Adding T00:00:00 to ensure it's parsed as local date.
      const date = new Date(dateString + 'T00:00:00');
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return dateString; // Fallback for invalid dates
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (field) => {
    if (field === 'includeJournalInsightsOnly') {
      setReportConfig(prev => ({
        ...prev,
        [field]: !prev[field]
      }));
    } else if (field === 'includeJournal' && !reportConfig[field] && reportConfig.includeJournalInsightsOnly) {
      setReportConfig(prev => ({
        ...prev,
        [field]: !prev[field]
      }));
    } else if (field === 'includeJournal' && reportConfig[field] && reportConfig.includeJournalInsightsOnly) {
      setReportConfig(prev => ({
        ...prev,
        [field]: !prev[field],
        includeJournalInsightsOnly: false
      }));
    } else if (field.includes('Details')) {
      setReportConfig(prev => ({
        ...prev,
        [field]: !prev[field]
      }));
    } else {
      const detailField = `${field}Details`;
      setReportConfig(prev => ({
        ...prev,
        [field]: !prev[field],
        ...(prev[field] ? { [detailField]: false } : {})
      }));
    }
  };
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    setReportConfig({
      ...reportConfig,
      [field]: value
    });
  };
  
  // Generate report
  const generateReport = () => {
    setShowPreview(true);
  };
  
  // Close preview
  const closePreview = () => {
    setShowPreview(false);
  };
  
  // Get date range label
  const getDateRangeLabel = () => {
    switch (reportConfig.dateRange) {
      case 'week':
        return 'Last 7 days';
      case 'month':
        return 'Last 30 days';
      case 'quarter':
        return 'Last 90 days';
      case 'year':
        return 'Last 365 days';
      case 'custom':
        return `${reportConfig.customStartDate || 'N/A'} to ${reportConfig.customEndDate || 'N/A'}`;
      default:
        return 'All time';
    }
  };

  // Filtered data based on date range (basic implementation for now)
  // This needs to be more robust based on actual date fields in each data type
  const getFilteredData = () => {
    // For now, returning all data as date filtering is complex and not fully implemented
    // In a real scenario, you'd filter each applicationData array (goals, tasks, etc.)
    // based on reportConfig.dateRange, customStartDate, and customEndDate.
    return applicationData;
  };

  const filteredApplicationData = getFilteredData();

  const calculateOverallGoalProgress = () => {
    if (!filteredApplicationData.goals || filteredApplicationData.goals.length === 0) return 0;
    const totalProgress = filteredApplicationData.goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
    return Math.round(totalProgress / filteredApplicationData.goals.length);
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
        Report Generator
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <p>Create custom reports to track your progress and share with your coach.</p>
      </div>
      
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        padding: '1.5rem', 
        borderRadius: '10px',
        marginBottom: '2rem'
      }}>
        <h2>Report Configuration</h2>
        
        {/* Report Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Report Title:</label>
          <input 
            type="text" 
            value={reportConfig.title}
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
        
        {/* Date Range */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date Range:</label>
          <select
            value={reportConfig.dateRange}
            onChange={(e) => handleInputChange('dateRange', e.target.value)}
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
            <option value="quarter">Last 90 Days</option>
            <option value="year">Last 365 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        
        {/* Custom Date Range */}
        {reportConfig.dateRange === 'custom' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Start Date:</label>
              <input 
                type="date" 
                value={reportConfig.customStartDate}
                onChange={(e) => handleInputChange('customStartDate', e.target.value)}
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
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>End Date:</label>
              <input 
                type="date" 
                value={reportConfig.customEndDate}
                onChange={(e) => handleInputChange('customEndDate', e.target.value)}
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
          </div>
        )}
        
        {/* Report Format */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Report Format:</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: 'pointer'
            }}>
              <input 
                type="radio" 
                checked={reportConfig.format === 'pdf'}
                onChange={() => handleInputChange('format', 'pdf')}
              />
              PDF
            </label>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: 'pointer'
            }}>
              <input 
                type="radio" 
                checked={reportConfig.format === 'html'}
                onChange={() => handleInputChange('format', 'html')}
              />
              HTML
            </label>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: 'pointer'
            }}>
              <input 
                type="radio" 
                checked={reportConfig.format === 'text'}
                onChange={() => handleInputChange('format', 'text')}
              />
              Text
            </label>
          </div>
        </div>
        
        <h3>Include Sections:</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {/* Goals */}
          <div>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: 'pointer'
            }}>
              <input 
                type="checkbox" 
                checked={reportConfig.includeGoals}
                onChange={() => handleCheckboxChange('includeGoals')}
              />
              Goals
            </label>
            {reportConfig.includeGoals && (
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                cursor: 'pointer',
                marginLeft: '1.5rem',
                fontSize: '0.9em',
              }}>
                <input 
                  type="checkbox" 
                  checked={reportConfig.includeGoalsDetails}
                  onChange={() => handleCheckboxChange('includeGoalsDetails')}
                />
                Include Details
              </label>
            )}
          </div>
          
          {/* Journal */}
          <div>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: 'pointer'
            }}>
              <input 
                type="checkbox" 
                checked={reportConfig.includeJournal}
                onChange={() => handleCheckboxChange('includeJournal')}
              />
              Journal
            </label>
            
            {reportConfig.includeJournal && (
              <>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  cursor: 'pointer',
                  marginLeft: '1.5rem',
                  fontSize: '0.9em',
                }}>
                  <input 
                    type="checkbox" 
                    checked={reportConfig.includeJournalInsightsOnly}
                    onChange={() => handleCheckboxChange('includeJournalInsightsOnly')}
                  />
                  Insights Only
                </label>
                
                {!reportConfig.includeJournalInsightsOnly && (
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    cursor: 'pointer',
                    marginLeft: '1.5rem',
                    fontSize: '0.9em',
                  }}>
                    <input 
                      type="checkbox" 
                      checked={reportConfig.includeJournalDetails}
                      onChange={() => handleCheckboxChange('includeJournalDetails')}
                    />
                    Include Details
                  </label>
                )}
              </>
            )}
          </div>
          
          {/* Mindset */}
          <div>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: 'pointer'
            }}>
              <input 
                type="checkbox" 
                checked={reportConfig.includeMindset}
                onChange={() => handleCheckboxChange('includeMindset')}
              />
              Mindset Techniques
            </label>
            
            {reportConfig.includeMindset && (
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                cursor: 'pointer',
                marginLeft: '1.5rem',
                fontSize: '0.9em',
              }}>
                <input 
                  type="checkbox" 
                  checked={reportConfig.includeMindsetDetails}
                  onChange={() => handleCheckboxChange('includeMindsetDetails')}
                />
                Include Details
              </label>
            )}
          </div>
          
          {/* Story Vault */}
          <div>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: 'pointer'
            }}>
              <input 
                type="checkbox" 
                checked={reportConfig.includeStoryVault}
                onChange={() => handleCheckboxChange('includeStoryVault')}
              />
              Story Vault
            </label>
            
            {reportConfig.includeStoryVault && (
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                cursor: 'pointer',
                marginLeft: '1.5rem',
                fontSize: '0.9em',
              }}>
                <input 
                  type="checkbox" 
                  checked={reportConfig.includeStoryVaultDetails}
                  onChange={() => handleCheckboxChange('includeStoryVaultDetails')}
                />
                Include Details
              </label>
            )}
          </div>
          
          {/* Storytelling Practice */}
          <div>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: 'pointer'
            }}>
              <input 
                type="checkbox" 
                checked={reportConfig.includeStorytellingPractice}
                onChange={() => handleCheckboxChange('includeStorytellingPractice')}
              />
              Storytelling Practice
            </label>
            
            {reportConfig.includeStorytellingPractice && (
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                cursor: 'pointer',
                marginLeft: '1.5rem',
                fontSize: '0.9em',
              }}>
                <input 
                  type="checkbox" 
                  checked={reportConfig.includeStorytellingPracticeDetails}
                  onChange={() => handleCheckboxChange('includeStorytellingPracticeDetails')}
                />
                Include Details
              </label>
            )}
          </div>
          
          {/* Target Companies */}
          <div>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: 'pointer'
            }}>
              <input 
                type="checkbox" 
                checked={reportConfig.includeTargetCompanies}
                onChange={() => handleCheckboxChange('includeTargetCompanies')}
              />
              Target Companies
            </label>
            
            {reportConfig.includeTargetCompanies && (
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                cursor: 'pointer',
                marginLeft: '1.5rem',
                fontSize: '0.9em',
              }}>
                <input 
                  type="checkbox" 
                  checked={reportConfig.includeTargetCompaniesDetails}
                  onChange={() => handleCheckboxChange('includeTargetCompaniesDetails')}
                />
                Include Details
              </label>
            )}
          </div>
          
          {/* Action Plan */}
          <div>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              cursor: 'pointer'
            }}>
              <input 
                type="checkbox" 
                checked={reportConfig.includeActionPlan}
                onChange={() => handleCheckboxChange('includeActionPlan')}
              />
              Action Plan
            </label>
            
            {reportConfig.includeActionPlan && (
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                cursor: 'pointer',
                marginLeft: '1.5rem',
                fontSize: '0.9em',
              }}>
                <input 
                  type="checkbox" 
                  checked={reportConfig.includeActionPlanDetails}
                  onChange={() => handleCheckboxChange('includeActionPlanDetails')}
                />
                Include Details
              </label>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={generateReport}
            style={{
              background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
              border: 'none',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}
          >
            Generate Report
          </button>
        </div>
      </div>
      
      {/* Report Preview */}
      {showPreview && (
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
            backgroundColor: '#121212',
            width: '90%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            borderRadius: '10px',
            padding: '2rem',
            overflowY: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2>{reportConfig.title}</h2>
              <button 
                onClick={closePreview}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Close Preview
              </button>
            </div>
            
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              padding: '1rem', 
              borderRadius: '5px',
              marginBottom: '1.5rem'
            }}>
              <p><strong>Date Range:</strong> {getDateRangeLabel()}</p>
              <p><strong>Generated:</strong> {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
            
            {/* Goals Section */}
            {reportConfig.includeGoals && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  Goals
                </h3>
                
                {filteredApplicationData.goals.length > 0 ? (
                  <div>
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '5px',
                      marginBottom: '1rem'
                    }}>
                      <p><strong>Overall Progress:</strong> {calculateOverallGoalProgress()}%</p>
                      <p><strong>Active Goals:</strong> {filteredApplicationData.goals.length}</p>
                      <p><strong>Completed Goals:</strong> {filteredApplicationData.goals.filter(g => g.progress === 100).length}</p>
                    </div>
                    
                    {reportConfig.includeGoalsDetails && (
                      <div>
                        {filteredApplicationData.goals.map(goal => (
                          <div 
                            key={goal.id}
                            style={{ 
                              backgroundColor: 'rgba(255,255,255,0.05)', 
                              padding: '1rem', 
                              borderRadius: '5px',
                              marginBottom: '1rem'
                            }}
                          >
                            <h4 style={{ margin: '0 0 0.5rem 0' }}>{goal.title}</h4>
                            <p><strong>Category:</strong> {goal.category}</p>
                            <p><strong>Progress:</strong> {goal.progress || 0}%</p>
                            {goal.deadline && (
                              <p><strong>Deadline:</strong> {formatDate(goal.deadline)}</p>
                            )}
                            
                            {goal.description && (
                              <p><strong>Description:</strong> {goal.description}</p>
                            )}
                            
                            {goal.why && (
                              <p><strong>Why:</strong> {goal.why}</p>
                            )}
                            
                            {goal.implications && (
                              <p><strong>Implications:</strong> {goal.implications}</p>
                            )}
                            
                            {goal.milestones && goal.milestones.length > 0 && (
                              <div style={{ marginTop: '1rem' }}>
                                <p><strong>Milestones:</strong></p>
                                <ul style={{ 
                                  listStyleType: 'none', 
                                  padding: 0,
                                  margin: '0.5rem 0 0 0'
                                }}>
                                  {goal.milestones.map(milestone => (
                                    <li 
                                      key={milestone.id}
                                      style={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '0.5rem'
                                      }}
                                    >
                                      <span style={{ 
                                        display: 'inline-block',
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        backgroundColor: milestone.completed ? '#28a745' : 'rgba(255,255,255,0.2)',
                                        flexShrink: 0
                                      }} />
                                      <span>
                                        {milestone.title}
                                        {milestone.dueDate && (
                                          <span style={{ opacity: 0.7, marginLeft: '0.5rem' }}>
                                            (Due: {formatDate(milestone.dueDate)})
                                          </span>
                                        )}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p>No goals data available for the selected period.</p>
                )}
              </div>
            )}
            
            {/* Journal Section */}
            {reportConfig.includeJournal && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  Journal
                </h3>
                
                {filteredApplicationData.journalEntries.length > 0 ? (
                  <div>
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '5px',
                      marginBottom: '1rem'
                    }}>
                      <p><strong>Total Entries:</strong> {filteredApplicationData.journalEntries.length}</p>
                      <p><strong>Date Range:</strong> {
                        filteredApplicationData.journalEntries.length > 0 ? 
                          `${formatDate(filteredApplicationData.journalEntries.reduce((min, entry) => 
                            !min || new Date(entry.date) < new Date(min) ? entry.date : min, null))} to 
                           ${formatDate(filteredApplicationData.journalEntries.reduce((max, entry) => 
                            !max || new Date(entry.date) > new Date(max) ? entry.date : max, null))}` : 
                          'N/A'
                      }</p>
                    </div>
                    
                    {reportConfig.includeJournalDetails && !reportConfig.includeJournalInsightsOnly && (
                      <div>
                        {filteredApplicationData.journalEntries.map((entry, index) => (
                          <div 
                            key={index}
                            style={{ 
                              backgroundColor: 'rgba(255,255,255,0.05)', 
                              padding: '1rem', 
                              borderRadius: '5px',
                              marginBottom: '1rem'
                            }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              marginBottom: '0.5rem'
                            }}>
                              <h4 style={{ margin: 0 }}>{entry.title || formatDate(entry.date)}</h4>
                              <span>{entry.time || 'Morning'}</span>
                            </div>
                            
                            <p style={{ whiteSpace: 'pre-line' }}>{entry.content}</p>
                            
                            {entry.insights && (
                              <div style={{ 
                                backgroundColor: 'rgba(10,177,150,0.1)', 
                                padding: '1rem', 
                                borderRadius: '5px',
                                marginTop: '1rem'
                              }}>
                                <p style={{ margin: 0 }}><strong>Insights:</strong> {entry.insights}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {(reportConfig.includeJournalInsightsOnly || !reportConfig.includeJournalDetails) && (
                      <div>
                        <h4>Key Insights</h4>
                        {filteredApplicationData.journalEntries
                          .filter(entry => entry.insights && entry.insights.trim() !== '')
                          .map((entry, index) => (
                            <div 
                              key={index}
                              style={{ 
                                backgroundColor: 'rgba(255,255,255,0.05)', 
                                padding: '1rem', 
                                borderRadius: '5px',
                                marginBottom: '1rem'
                              }}
                            >
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                marginBottom: '0.5rem'
                              }}>
                                <strong>{formatDate(entry.date)}</strong>
                                <span>{entry.time || 'Morning'}</span>
                              </div>
                              <p>{entry.insights}</p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p>No journal entries available for the selected period.</p>
                )}
              </div>
            )}
            
            {/* Mindset Techniques Section */}
            {reportConfig.includeMindset && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  Mindset Techniques
                </h3>
                
                {filteredApplicationData.mindsetPractices.length > 0 ? (
                  <div>
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '5px',
                      marginBottom: '1rem'
                    }}>
                      <p><strong>Techniques Practiced:</strong> {filteredApplicationData.mindsetPractices.length}</p>
                      <p><strong>Total Practice Sessions:</strong> {
                        filteredApplicationData.mindsetPractices.reduce((sum, technique) => 
                          sum + (technique.practices ? technique.practices.length : 0), 0)
                      }</p>
                    </div>
                    
                    {reportConfig.includeMindsetDetails && (
                      <div>
                        {filteredApplicationData.mindsetPractices.map(technique => (
                          <div 
                            key={technique.id}
                            style={{ 
                              backgroundColor: 'rgba(255,255,255,0.05)', 
                              padding: '1rem', 
                              borderRadius: '5px',
                              marginBottom: '1rem'
                            }}
                          >
                            <h4 style={{ margin: '0 0 0.5rem 0' }}>{technique.title}</h4>
                            <p>{technique.description}</p>
                            
                            {technique.practices && technique.practices.length > 0 && (
                              <div style={{ marginTop: '1rem' }}>
                                <p><strong>Practice History:</strong></p>
                                {technique.practices.map((practice, index) => (
                                  <div 
                                    key={index}
                                    style={{ 
                                      backgroundColor: 'rgba(255,255,255,0.05)', 
                                      padding: '0.75rem', 
                                      borderRadius: '5px',
                                      marginTop: '0.5rem'
                                    }}
                                  >
                                    <div style={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between',
                                      marginBottom: '0.25rem'
                                    }}>
                                      <strong>{formatDate(practice.date)}</strong>
                                    </div>
                                    {practice.notes && <p><strong>Notes:</strong> {practice.notes}</p>}
                                    {practice.results && <p><strong>Results:</strong> {practice.results}</p>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p>No mindset practice data available for the selected period.</p>
                )}
              </div>
            )}
            
            {/* Story Vault Section */}
            {reportConfig.includeStoryVault && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  Story Vault
                </h3>
                
                {filteredApplicationData.stories.length > 0 ? (
                  <div>
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '5px',
                      marginBottom: '1rem'
                    }}>
                      <p><strong>Total Stories:</strong> {filteredApplicationData.stories.length}</p>
                      <p><strong>Categories:</strong> {
                        [...new Set(filteredApplicationData.stories
                          .map(story => story.tags || [])
                          .flat()
                          .filter(tag => tag))]
                          .join(', ') || 'None'
                      }</p>
                    </div>
                    
                    {reportConfig.includeStoryVaultDetails && (
                      <div>
                        {filteredApplicationData.stories.map(story => (
                          <div 
                            key={story.id}
                            style={{ 
                              backgroundColor: 'rgba(255,255,255,0.05)', 
                              padding: '1rem', 
                              borderRadius: '5px',
                              marginBottom: '1rem'
                            }}
                          >
                            <h4 style={{ margin: '0 0 0.5rem 0' }}>{story.title}</h4>
                            
                            {story.tags && story.tags.length > 0 && (
                              <div style={{ 
                                display: 'flex', 
                                gap: '0.5rem', 
                                flexWrap: 'wrap',
                                marginBottom: '0.5rem'
                              }}>
                                {story.tags.map((tag, index) => (
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
                            )}
                            
                            <div style={{ marginTop: '1rem' }}>
                              <p><strong>Transcript:</strong></p>
                              <p style={{ whiteSpace: 'pre-line' }}>{story.transcript}</p>
                            </div>
                            
                            {story.practiceHistory && story.practiceHistory.length > 0 && (
                              <div style={{ marginTop: '1rem' }}>
                                <p><strong>Practice History:</strong></p>
                                <ul style={{ 
                                  listStyleType: 'none', 
                                  padding: 0,
                                  margin: '0.5rem 0 0 0'
                                }}>
                                  {story.practiceHistory.map((practice, index) => (
                                    <li 
                                      key={index}
                                      style={{ marginBottom: '0.5rem' }}
                                    >
                                      {formatDate(practice.date)} - 
                                      Duration: {Math.floor(practice.duration / 60)}:{(practice.duration % 60).toString().padStart(2, '0')} - 
                                      Feedback: {practice.feedback || 'None'}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p>No story data available for the selected period.</p>
                )}
              </div>
            )}
            
            {/* Storytelling Practice Section */}
            {reportConfig.includeStorytellingPractice && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  Storytelling Practice
                </h3>
                
                {filteredApplicationData.stories.length > 0 ? (
                  <div>
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '5px',
                      marginBottom: '1rem'
                    }}>
                      <p><strong>Total Practice Sessions:</strong> {
                        filteredApplicationData.stories.reduce((sum, story) => 
                          sum + (story.practiceHistory ? story.practiceHistory.length : 0), 0)
                      }</p>
                      <p><strong>Average Duration:</strong> {
                        filteredApplicationData.stories.reduce((sum, story) => {
                          if (!story.practiceHistory) return sum;
                          const totalDuration = story.practiceHistory.reduce((s, p) => s + (p.duration || 0), 0);
                          return sum + totalDuration;
                        }, 0) / 
                        Math.max(1, filteredApplicationData.stories.reduce((sum, story) => 
                          sum + (story.practiceHistory ? story.practiceHistory.length : 0), 0))
                      } seconds</p>
                    </div>
                    
                    {reportConfig.includeStorytellingPracticeDetails && (
                      <div>
                        {filteredApplicationData.stories
                          .filter(story => story.practiceHistory && story.practiceHistory.length > 0)
                          .map(story => (
                            <div 
                              key={story.id}
                              style={{ 
                                backgroundColor: 'rgba(255,255,255,0.05)', 
                                padding: '1rem', 
                                borderRadius: '5px',
                                marginBottom: '1rem'
                              }}
                            >
                              <h4 style={{ margin: '0 0 0.5rem 0' }}>{story.title}</h4>
                              
                              <div style={{ marginTop: '1rem' }}>
                                <p><strong>Practice Sessions:</strong></p>
                                {story.practiceHistory.map((practice, index) => (
                                  <div 
                                    key={index}
                                    style={{ 
                                      backgroundColor: 'rgba(255,255,255,0.05)', 
                                      padding: '0.75rem', 
                                      borderRadius: '5px',
                                      marginTop: '0.5rem'
                                    }}
                                  >
                                    <div style={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between',
                                      marginBottom: '0.25rem'
                                    }}>
                                      <strong>{formatDate(practice.date)}</strong>
                                      <span>Duration: {Math.floor(practice.duration / 60)}:{(practice.duration % 60).toString().padStart(2, '0')}</span>
                                    </div>
                                    {practice.feedback && (
                                      <p><strong>Feedback:</strong> {practice.feedback}</p>
                                    )}
                                    {practice.transcript && (
                                      <div>
                                        <p><strong>Transcript:</strong></p>
                                        <p style={{ 
                                          whiteSpace: 'pre-line',
                                          backgroundColor: 'rgba(255,255,255,0.03)',
                                          padding: '0.5rem',
                                          borderRadius: '5px',
                                          fontSize: '0.9rem'
                                        }}>
                                          {practice.transcript}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p>No storytelling practice data available for the selected period.</p>
                )}
              </div>
            )}
            
            {/* Target Companies Section */}
            {reportConfig.includeTargetCompanies && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  Target Companies
                </h3>
                
                {filteredApplicationData.targetCompanies.length > 0 ? (
                  <div>
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '5px',
                      marginBottom: '1rem'
                    }}>
                      <p><strong>Total Companies:</strong> {filteredApplicationData.targetCompanies.length}</p>
                      <p><strong>Application Status:</strong></p>
                      <ul style={{ margin: '0.5rem 0 0 0' }}>
                        <li>Researching: {filteredApplicationData.targetCompanies.filter(c => c.status === 'Researching').length}</li>
                        <li>Applied: {filteredApplicationData.targetCompanies.filter(c => c.status === 'Applied').length}</li>
                        <li>Interview Scheduled: {filteredApplicationData.targetCompanies.filter(c => c.status === 'Interview Scheduled').length}</li>
                        <li>Interview Completed: {filteredApplicationData.targetCompanies.filter(c => c.status === 'Interview Completed').length}</li>
                        <li>Offer Received: {filteredApplicationData.targetCompanies.filter(c => c.status === 'Offer Received').length}</li>
                        <li>Rejected: {filteredApplicationData.targetCompanies.filter(c => c.status === 'Rejected').length}</li>
                        <li>Not Interested: {filteredApplicationData.targetCompanies.filter(c => c.status === 'Not Interested').length}</li>
                      </ul>
                    </div>
                    
                    {reportConfig.includeTargetCompaniesDetails && (
                      <div>
                        {filteredApplicationData.targetCompanies.map((company, index) => (
                          <div 
                            key={index}
                            style={{ 
                              backgroundColor: 'rgba(255,255,255,0.05)', 
                              padding: '1rem', 
                              borderRadius: '5px',
                              marginBottom: '1rem'
                            }}
                          >
                            <h4 style={{ margin: '0 0 0.5rem 0' }}>{company.name}</h4>
                            <p><strong>Position:</strong> {company.position}</p>
                            <p><strong>Status:</strong> {company.status}</p>
                            
                            {company.hiringManager && (
                              <p><strong>Hiring Manager:</strong> {company.hiringManager}</p>
                            )}
                            
                            {company.dateApplied && (
                              <p><strong>Date Applied:</strong> {formatDate(company.dateApplied)}</p>
                            )}
                            
                            {company.interviewDate && (
                              <p><strong>Interview Date:</strong> {formatDate(company.interviewDate)}</p>
                            )}
                            
                            {company.notes && (
                              <div style={{ marginTop: '1rem' }}>
                                <p><strong>Notes:</strong></p>
                                <p style={{ whiteSpace: 'pre-line' }}>{company.notes}</p>
                              </div>
                            )}
                            
                            {company.requirements && company.requirements.length > 0 && (
                              <div style={{ marginTop: '1rem' }}>
                                <p><strong>Job Requirements:</strong></p>
                                <ul>
                                  {company.requirements.map((req, i) => (
                                    <li key={i}>{req}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p>No target companies data available for the selected period.</p>
                )}
              </div>
            )}
            
            {/* Action Plan Section */}
            {reportConfig.includeActionPlan && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  Action Plan
                </h3>
                
                {filteredApplicationData.tasks.length > 0 ? (
                  <div>
                    <div style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      padding: '1rem', 
                      borderRadius: '5px',
                      marginBottom: '1rem'
                    }}>
                      <p><strong>Total Tasks:</strong> {filteredApplicationData.tasks.length}</p>
                      <p><strong>Completed Tasks:</strong> {filteredApplicationData.tasks.filter(t => t.completed).length}</p>
                      <p><strong>Pending Tasks:</strong> {filteredApplicationData.tasks.filter(t => !t.completed).length}</p>
                    </div>
                    
                    {reportConfig.includeActionPlanDetails && (
                      <div>
                        <h4>Pending Tasks</h4>
                        {filteredApplicationData.tasks
                          .filter(task => !task.completed)
                          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                          .map((task, index) => (
                            <div 
                              key={index}
                              style={{ 
                                backgroundColor: 'rgba(255,255,255,0.05)', 
                                padding: '1rem', 
                                borderRadius: '5px',
                                marginBottom: '0.5rem'
                              }}
                            >
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                marginBottom: '0.25rem'
                              }}>
                                <h5 style={{ margin: 0 }}>{task.title}</h5>
                                <span>{task.priority || 'Medium'} Priority</span>
                              </div>
                              
                              {task.description && (
                                <p>{task.description}</p>
                              )}
                              
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                fontSize: '0.9rem',
                                opacity: 0.7
                              }}>
                                <span>Due: {formatDate(task.dueDate)}</span>
                                {task.goalId && (
                                  <span>
                                    Related Goal: {
                                      filteredApplicationData.goals.find(g => g.id === task.goalId)?.title || 'Unknown'
                                    }
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        
                        <h4 style={{ marginTop: '1.5rem' }}>Completed Tasks</h4>
                        {filteredApplicationData.tasks
                          .filter(task => task.completed)
                          .sort((a, b) => new Date(b.completedDate || b.dueDate) - new Date(a.completedDate || a.dueDate))
                          .map((task, index) => (
                            <div 
                              key={index}
                              style={{ 
                                backgroundColor: 'rgba(255,255,255,0.05)', 
                                padding: '1rem', 
                                borderRadius: '5px',
                                marginBottom: '0.5rem'
                              }}
                            >
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                marginBottom: '0.25rem'
                              }}>
                                <h5 style={{ margin: 0 }}>{task.title}</h5>
                                <span>{task.priority || 'Medium'} Priority</span>
                              </div>
                              
                              {task.description && (
                                <p>{task.description}</p>
                              )}
                              
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                fontSize: '0.9rem',
                                opacity: 0.7
                              }}>
                                <span>Completed: {formatDate(task.completedDate || task.dueDate)}</span>
                                {task.goalId && (
                                  <span>
                                    Related Goal: {
                                      filteredApplicationData.goals.find(g => g.id === task.goalId)?.title || 'Unknown'
                                    }
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p>No action plan data available for the selected period.</p>
                )}
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginTop: '2rem'
            }}>
              <button 
                onClick={closePreview}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Close Preview
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
              >
                Download {reportConfig.format.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
