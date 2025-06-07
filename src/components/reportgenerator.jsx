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

  // Filtered data based on date range
  const getFilteredData = () => {
    const result = { ...applicationData };
    
    // Apply date filtering based on reportConfig.dateRange
    if (reportConfig.dateRange !== 'all') {
      const today = new Date();
      let startDate;
      
      switch (reportConfig.dateRange) {
        case 'week':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 1);
          break;
        case 'quarter':
          startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 3);
          break;
        case 'year':
          startDate = new Date(today);
          startDate.setFullYear(today.getFullYear() - 1);
          break;
        case 'custom':
          if (reportConfig.customStartDate) {
            startDate = new Date(reportConfig.customStartDate + 'T00:00:00');
          }
          break;
        default:
          break;
      }
      
      let endDate;
      if (reportConfig.dateRange === 'custom' && reportConfig.customEndDate) {
        endDate = new Date(reportConfig.customEndDate + 'T23:59:59');
      } else {
        endDate = today;
      }
      
      if (startDate) {
        // Filter goals
        result.goals = result.goals.filter(goal => {
          const updatedAt = goal.updatedAt ? new Date(goal.updatedAt) : null;
          const createdAt = goal.createdAt ? new Date(goal.createdAt) : null;
          return (updatedAt && updatedAt >= startDate && updatedAt <= endDate) || 
                 (createdAt && createdAt >= startDate && createdAt <= endDate);
        });
        
        // Filter tasks
        result.tasks = result.tasks.filter(task => {
          const updatedAt = task.updatedAt ? new Date(task.updatedAt) : null;
          const createdAt = task.createdAt ? new Date(task.createdAt) : null;
          return (updatedAt && updatedAt >= startDate && updatedAt <= endDate) || 
                 (createdAt && createdAt >= startDate && createdAt <= endDate);
        });
        
        // Filter journal entries
        result.journalEntries = result.journalEntries.filter(entry => {
          if (!entry.date) return false;
          const entryDate = new Date(entry.date + 'T00:00:00');
          return entryDate >= startDate && entryDate <= endDate;
        });
        
        // Filter mindset practices
        result.mindsetPractices = result.mindsetPractices.map(practice => {
          if (!practice.practices) return practice;
          
          const filteredPractices = practice.practices.filter(p => {
            if (!p.date) return false;
            const practiceDate = new Date(p.date + 'T00:00:00');
            return practiceDate >= startDate && practiceDate <= endDate;
          });
          
          return {
            ...practice,
            practices: filteredPractices
          };
        }).filter(practice => practice.practices && practice.practices.length > 0);
        
        // Filter stories
        result.stories = result.stories.filter(story => {
          // Check practice history dates
          if (story.practiceHistory && story.practiceHistory.length > 0) {
            return story.practiceHistory.some(practice => {
              if (!practice.date) return false;
              const practiceDate = new Date(practice.date);
              return practiceDate >= startDate && practiceDate <= endDate;
            });
          }
          
          // Check creation date
          const createdAt = story.createdAt ? new Date(story.createdAt) : null;
          return createdAt && createdAt >= startDate && createdAt <= endDate;
        });
        
        // Filter target companies
        result.targetCompanies = result.targetCompanies.filter(company => {
          const updatedAt = company.updatedAt ? new Date(company.updatedAt) : null;
          const createdAt = company.createdAt ? new Date(company.createdAt) : null;
          return (updatedAt && updatedAt >= startDate && updatedAt <= endDate) || 
                 (createdAt && createdAt >= startDate && createdAt <= endDate);
        });
      }
    }
    
    return result;
  };

  const filteredApplicationData = getFilteredData();

  const calculateOverallGoalProgress = () => {
    if (!filteredApplicationData.goals || filteredApplicationData.goals.length === 0) return 0;
    const totalProgress = filteredApplicationData.goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
    return Math.round(totalProgress / filteredApplicationData.goals.length);
  };
  
  // Generate detailed content for each section
  const generateDetailedGoalsContent = () => {
    if (!filteredApplicationData.goals || filteredApplicationData.goals.length === 0) {
      return <p>No goals data available for the selected period.</p>;
    }
    
    return (
      <div>
        {filteredApplicationData.goals.map((goal, index) => (
          <div 
            key={goal.id || index}
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              padding: '1rem', 
              borderRadius: '5px',
              marginBottom: '1rem'
            }}
          >
            <h4 style={{ margin: '0 0 0.5rem 0' }}>{goal.title}</h4>
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
                  {goal.milestones.map((milestone, mIndex) => (
                    <li 
                      key={milestone.id || mIndex}
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
    );
  };
  
  const generateDetailedJournalContent = () => {
    if (!filteredApplicationData.journalEntries || filteredApplicationData.journalEntries.length === 0) {
      return <p>No journal entries available for the selected period.</p>;
    }
    
    if (reportConfig.includeJournalInsightsOnly) {
      return (
        <div>
          <h4>Key Insights</h4>
          {filteredApplicationData.journalEntries
            .filter(entry => (entry.insights && entry.insights.trim() !== '') || 
                            (entry.systemInsights && entry.systemInsights.trim() !== ''))
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
                  <span>{entry.time ? (entry.time.charAt(0).toUpperCase() + entry.time.slice(1)) : 'Morning'}</span>
                </div>
                
                {entry.systemInsights && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>System Insights:</strong>
                    <div style={{ whiteSpace: 'pre-line' }}>{entry.systemInsights}</div>
                  </div>
                )}
                
                {entry.insights && (
                  <div>
                    <strong>User Insights:</strong>
                    <div style={{ whiteSpace: 'pre-line' }}>{entry.insights}</div>
                  </div>
                )}
              </div>
            ))}
        </div>
      );
    }
    
    if (reportConfig.includeJournalDetails) {
      return (
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
                <span>{entry.time ? (entry.time.charAt(0).toUpperCase() + entry.time.slice(1)) : 'Morning'}</span>
              </div>
              
              <p style={{ whiteSpace: 'pre-line', marginBottom: '1rem' }}>{entry.content}</p>
              
              {entry.systemInsights && (
                <div style={{ 
                  backgroundColor: 'rgba(10,177,150,0.1)', 
                  padding: '1rem', 
                  borderRadius: '5px',
                  marginBottom: '0.5rem'
                }}>
                  <p style={{ margin: 0 }}><strong>System Insights:</strong></p>
                  <div style={{ whiteSpace: 'pre-line' }}>{entry.systemInsights}</div>
                </div>
              )}
              
              {entry.insights && (
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  padding: '1rem', 
                  borderRadius: '5px'
                }}>
                  <p style={{ margin: 0 }}><strong>User Insights:</strong></p>
                  <div style={{ whiteSpace: 'pre-line' }}>{entry.insights}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div>
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
    );
  };
  
  const generateDetailedMindsetContent = () => {
    if (!filteredApplicationData.mindsetPractices || filteredApplicationData.mindsetPractices.length === 0) {
      return <p>No mindset practice data available for the selected period.</p>;
    }
    
    if (reportConfig.includeMindsetDetails) {
      return (
        <div>
          {filteredApplicationData.mindsetPractices.map((technique, index) => (
            <div 
              key={technique.id || index}
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
                  {technique.practices.map((practice, pIndex) => (
                    <div 
                      key={pIndex}
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
      );
    }
    
    return (
      <div>
        <p><strong>Techniques Practiced:</strong> {filteredApplicationData.mindsetPractices.length}</p>
        <p><strong>Total Practice Sessions:</strong> {
          filteredApplicationData.mindsetPractices.reduce((sum, technique) => 
            sum + (technique.practices ? technique.practices.length : 0), 0)
        }</p>
      </div>
    );
  };
  
  const generateDetailedStoryVaultContent = () => {
    if (!filteredApplicationData.stories || filteredApplicationData.stories.length === 0) {
      return <p>No stories available for the selected period.</p>;
    }
    
    if (reportConfig.includeStoryVaultDetails) {
      return (
        <div>
          {filteredApplicationData.stories.map((story, index) => (
            <div 
              key={story.id || index}
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
                  {story.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
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
                    {story.practiceHistory.map((practice, practiceIndex) => (
                      <li 
                        key={practice.id || practiceIndex}
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.05)', 
                          padding: '0.5rem', 
                          borderRadius: '5px',
                          marginBottom: '0.5rem'
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
                        
                        {practice.selfRating && (
                          <p style={{ margin: '0.25rem 0' }}>
                            <strong>Self Rating:</strong> {
                              practice.selfRating === 'excellent' ? 'Excellent' :
                              practice.selfRating === 'good' ? 'Good' : 'Needs Work'
                            }
                          </p>
                        )}
                        
                        {practice.transcript && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <p style={{ margin: '0 0 0.25rem 0' }}><strong>Practice Transcript:</strong></p>
                            <p style={{ 
                              whiteSpace: 'pre-line', 
                              margin: 0,
                              fontSize: '0.9rem'
                            }}>
                              {practice.transcript}
                            </p>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div>
        <p><strong>Total Stories:</strong> {filteredApplicationData.stories.length}</p>
        <p><strong>Categories:</strong> {
          [...new Set(filteredApplicationData.stories
            .map(story => story.tags || [])
            .flat()
            .filter(tag => tag))]
            .join(', ') || 'None'
        }</p>
      </div>
    );
  };
  
  const generateDetailedTargetCompaniesContent = () => {
    if (!filteredApplicationData.targetCompanies || filteredApplicationData.targetCompanies.length === 0) {
      return <p>No target companies data available for the selected period.</p>;
    }
    
    if (reportConfig.includeTargetCompaniesDetails) {
      return (
        <div>
          {filteredApplicationData.targetCompanies.map((company, index) => (
            <div 
              key={company.id || index}
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)', 
                padding: '1rem', 
                borderRadius: '5px',
                marginBottom: '1rem'
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0' }}>{company.name}</h4>
              
              {company.website && (
                <p><strong>Website:</strong> {company.website}</p>
              )}
              
              {company.industry && (
                <p><strong>Industry:</strong> {company.industry}</p>
              )}
              
              {company.status && (
                <p><strong>Status:</strong> {company.status}</p>
              )}
              
              {company.notes && (
                <div style={{ marginTop: '0.5rem' }}>
                  <p><strong>Notes:</strong></p>
                  <p style={{ whiteSpace: 'pre-line' }}>{company.notes}</p>
                </div>
              )}
              
              {company.keyPlayers && company.keyPlayers.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Key Players:</strong></p>
                  <ul style={{ 
                    listStyleType: 'none', 
                    padding: 0,
                    margin: '0.5rem 0 0 0'
                  }}>
                    {company.keyPlayers.map((player, playerIndex) => (
                      <li 
                        key={playerIndex}
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.05)', 
                          padding: '0.5rem', 
                          borderRadius: '5px',
                          marginBottom: '0.5rem'
                        }}
                      >
                        <p style={{ margin: '0 0 0.25rem 0' }}><strong>{player.name}</strong></p>
                        {player.title && <p style={{ margin: '0 0 0.25rem 0' }}>{player.title}</p>}
                        {player.contact && <p style={{ margin: '0' }}>{player.contact}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {company.jobs && company.jobs.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <p><strong>Job Opportunities:</strong></p>
                  <ul style={{ 
                    listStyleType: 'none', 
                    padding: 0,
                    margin: '0.5rem 0 0 0'
                  }}>
                    {company.jobs.map((job, jobIndex) => (
                      <li 
                        key={jobIndex}
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.05)', 
                          padding: '0.5rem', 
                          borderRadius: '5px',
                          marginBottom: '0.5rem'
                        }}
                      >
                        <p style={{ margin: '0 0 0.25rem 0' }}><strong>{job.title}</strong></p>
                        {job.datePosted && (
                          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>
                            Posted: {formatDate(job.datePosted)}
                          </p>
                        )}
                        {job.hiringManager && (
                          <p style={{ margin: '0 0 0.25rem 0' }}>
                            Hiring Manager: {job.hiringManager}
                          </p>
                        )}
                        {job.requirements && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <p style={{ margin: '0 0 0.25rem 0' }}><strong>Requirements:</strong></p>
                            <ul style={{ margin: '0', paddingLeft: '1.5rem' }}>
                              {job.requirements.map((req, reqIndex) => (
                                <li key={reqIndex}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div>
        <p><strong>Total Companies:</strong> {filteredApplicationData.targetCompanies.length}</p>
        <p><strong>Industries:</strong> {
          [...new Set(filteredApplicationData.targetCompanies
            .map(company => company.industry)
            .filter(industry => industry))]
            .join(', ') || 'None'
        }</p>
      </div>
    );
  };
  
  const generateDetailedActionPlanContent = () => {
    if (!filteredApplicationData.tasks || filteredApplicationData.tasks.length === 0) {
      return <p>No tasks available for the selected period.</p>;
    }
    
    if (reportConfig.includeActionPlanDetails) {
      return (
        <div>
          {filteredApplicationData.tasks.map((task, index) => (
            <div 
              key={task.id || index}
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
                alignItems: 'flex-start',
                marginBottom: '0.5rem'
              }}>
                <h4 style={{ margin: '0' }}>{task.title}</h4>
                <span style={{ 
                  backgroundColor: 
                    task.status === 'completed' ? 'rgba(40,167,69,0.2)' :
                    task.status === 'in_progress' ? 'rgba(255,193,7,0.2)' :
                    'rgba(255,255,255,0.1)',
                  color: 
                    task.status === 'completed' ? '#28a745' :
                    task.status === 'in_progress' ? '#ffc107' :
                    'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '5px',
                  fontSize: '0.8rem'
                }}>
                  {task.status === 'not_started' ? 'Not Started' : 
                   task.status === 'in_progress' ? 'In Progress' : 'Completed'}
                </span>
              </div>
              
              {task.description && (
                <p style={{ whiteSpace: 'pre-line' }}>{task.description}</p>
              )}
              
              <div style={{ 
                display: 'flex', 
                gap: '1rem',
                flexWrap: 'wrap',
                marginTop: '0.5rem'
              }}>
                {task.dueDate && (
                  <span style={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '5px',
                    fontSize: '0.8rem'
                  }}>
                    Due: {formatDate(task.dueDate)}
                  </span>
                )}
                
                <span style={{ 
                  backgroundColor: 
                    task.priority === 'high' ? 'rgba(220,53,69,0.2)' :
                    task.priority === 'medium' ? 'rgba(255,193,7,0.2)' :
                    'rgba(40,167,69,0.2)',
                  color: 
                    task.priority === 'high' ? '#dc3545' :
                    task.priority === 'medium' ? '#ffc107' :
                    '#28a745',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '5px',
                  fontSize: '0.8rem'
                }}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </span>
                
                {task.linkedGoalId && (
                  <span style={{ 
                    backgroundColor: 'rgba(10,177,150,0.2)',
                    color: '#0AB196',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '5px',
                    fontSize: '0.8rem'
                  }}>
                    Linked to Goal: {
                      filteredApplicationData.goals.find(g => g.id === task.linkedGoalId)?.title || 'Unknown Goal'
                    }
                  </span>
                )}
              </div>
              
              {task.subtasks && task.subtasks.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}><strong>Subtasks:</strong></p>
                  <ul style={{ 
                    listStyleType: 'none', 
                    padding: 0,
                    margin: 0
                  }}>
                    {task.subtasks.map((subtask, subtaskIndex) => (
                      <li 
                        key={subtask.id || subtaskIndex}
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
                          backgroundColor: subtask.completed ? '#28a745' : 'rgba(255,255,255,0.2)',
                          flexShrink: 0
                        }} />
                        <span style={{ 
                          textDecoration: subtask.completed ? 'line-through' : 'none',
                          opacity: subtask.completed ? 0.7 : 1
                        }}>
                          {subtask.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div>
        <p><strong>Total Tasks:</strong> {filteredApplicationData.tasks.length}</p>
        <p><strong>Completed Tasks:</strong> {
          filteredApplicationData.tasks.filter(task => task.status === 'completed').length
        }</p>
        <p><strong>In Progress Tasks:</strong> {
          filteredApplicationData.tasks.filter(task => task.status === 'in_progress').length
        }</p>
        <p><strong>Not Started Tasks:</strong> {
          filteredApplicationData.tasks.filter(task => task.status === 'not_started').length
        }</p>
      </div>
    );
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
      
      {!showPreview ? (
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
          
          <button 
            onClick={generateReport}
            style={{
              width: '100%',
              background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
              border: 'none',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Generate Report
          </button>
        </div>
      ) : (
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ margin: 0 }}>Report Preview</h2>
            <button 
              onClick={closePreview}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Back to Configuration
            </button>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            color: '#333',
            padding: '2rem',
            borderRadius: '5px',
            maxHeight: '600px',
            overflow: 'auto'
          }}>
            <div style={{ 
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <h1 style={{ 
                color: '#0AB196',
                margin: '0 0 0.5rem 0'
              }}>
                {reportConfig.title}
              </h1>
              <p style={{ 
                margin: 0,
                color: '#666'
              }}>
                {getDateRangeLabel()} • Generated on {formatDate(new Date().toISOString().split('T')[0])}
              </p>
            </div>
            
            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{ 
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'conic-gradient(#0AB196 0% ' + calculateOverallGoalProgress() + '%, #eee ' + calculateOverallGoalProgress() + '% 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{ 
                  width: '130px',
                  height: '130px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <span style={{ 
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#0AB196'
                  }}>
                    {calculateOverallGoalProgress()}%
                  </span>
                  <span style={{ 
                    fontSize: '0.8rem',
                    color: '#666'
                  }}>
                    Overall Progress
                  </span>
                </div>
              </div>
            </div>
            
            {/* Goals Section */}
            {reportConfig.includeGoals && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  borderBottom: '2px solid #0AB196',
                  paddingBottom: '0.5rem',
                  color: '#0AB196'
                }}>
                  Goals
                </h2>
                
                {filteredApplicationData.goals.length > 0 ? (
                  <div>
                    <div style={{ 
                      backgroundColor: '#f9f9f9', 
                      padding: '1rem', 
                      borderRadius: '5px',
                      marginBottom: '1rem'
                    }}>
                      <p><strong>Total Goals:</strong> {filteredApplicationData.goals.length}</p>
                      <p><strong>Average Progress:</strong> {calculateOverallGoalProgress()}%</p>
                    </div>
                    
                    {reportConfig.includeGoalsDetails && generateDetailedGoalsContent()}
                  </div>
                ) : (
                  <p>No goals data available for the selected period.</p>
                )}
              </div>
            )}
            
            {/* Journal Section */}
            {reportConfig.includeJournal && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  borderBottom: '2px solid #0AB196',
                  paddingBottom: '0.5rem',
                  color: '#0AB196'
                }}>
                  Journal
                </h2>
                
                {filteredApplicationData.journalEntries.length > 0 ? (
                  <div>
                    <div style={{ 
                      backgroundColor: '#f9f9f9', 
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
                    
                    {generateDetailedJournalContent()}
                  </div>
                ) : (
                  <p>No journal entries available for the selected period.</p>
                )}
              </div>
            )}
            
            {/* Mindset Techniques Section */}
            {reportConfig.includeMindset && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  borderBottom: '2px solid #0AB196',
                  paddingBottom: '0.5rem',
                  color: '#0AB196'
                }}>
                  Mindset Techniques
                </h2>
                
                {filteredApplicationData.mindsetPractices.length > 0 ? (
                  <div>
                    <div style={{ 
                      backgroundColor: '#f9f9f9', 
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
                    
                    {generateDetailedMindsetContent()}
                  </div>
                ) : (
                  <p>No mindset practice data available for the selected period.</p>
                )}
              </div>
            )}
            
            {/* Story Vault Section */}
            {reportConfig.includeStoryVault && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  borderBottom: '2px solid #0AB196',
                  paddingBottom: '0.5rem',
                  color: '#0AB196'
                }}>
                  Story Vault
                </h2>
                
                {filteredApplicationData.stories.length > 0 ? (
                  <div>
                    <div style={{ 
                      backgroundColor: '#f9f9f9', 
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
                    
                    {generateDetailedStoryVaultContent()}
                  </div>
                ) : (
                  <p>No stories available for the selected period.</p>
                )}
              </div>
            )}
            
            {/* Target Companies Section */}
            {reportConfig.includeTargetCompanies && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  borderBottom: '2px solid #0AB196',
                  paddingBottom: '0.5rem',
                  color: '#0AB196'
                }}>
                  Target Companies
                </h2>
                
                {generateDetailedTargetCompaniesContent()}
              </div>
            )}
            
            {/* Action Plan Section */}
            {reportConfig.includeActionPlan && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  borderBottom: '2px solid #0AB196',
                  paddingBottom: '0.5rem',
                  color: '#0AB196'
                }}>
                  Action Plan
                </h2>
                
                {generateDetailedActionPlanContent()}
              </div>
            )}
            
            <div style={{ 
              textAlign: 'center',
              marginTop: '3rem',
              color: '#666',
              fontSize: '0.8rem'
            }}>
              <p>Generated with Career Maniacs Coaching Platform</p>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            marginTop: '1.5rem'
          }}>
            <button 
              style={{
                background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                border: 'none',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Download {reportConfig.format.toUpperCase()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
