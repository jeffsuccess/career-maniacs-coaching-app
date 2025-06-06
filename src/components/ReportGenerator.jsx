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
      mindsetPractices: JSON.parse(localStorage.getItem('mindsetPractices') || '[]'),
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
            width: '100%'
          }}
        >
          Generate Report
        </button>
      </div>
      
      {/* Report Preview Modal */}
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
            backgroundColor: '#1e2130',
            borderRadius: '10px',
            padding: '2rem',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto'
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
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              color: 'black', 
              padding: '2rem',
              borderRadius: '5px'
            }}>
              <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>{reportConfig.title}</h1>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <p><strong>Date Range:</strong> {getDateRangeLabel()}</p>
                <p><strong>Generated On:</strong> {new Date().toLocaleDateString()}</p>
              </div>
              
              {/* Goals Section */}
              {reportConfig.includeGoals && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2>Goals</h2>
                  {!reportConfig.includeGoalsDetails ? (
                    <p>Summary of goals progress and status.</p>
                  ) : (
                    <>
                      <div style={{ 
                        backgroundColor: '#f5f5f5', 
                        padding: '1rem', 
                        borderRadius: '5px'
                      }}>
                        <h3>Goal Progress Summary</h3>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          marginBottom: '0.5rem'
                        }}>
                          <span>Overall Average Progress</span>
                          <span>{calculateOverallGoalProgress()}%</span>
                        </div>
                        <div style={{ 
                          width: '100%', 
                          backgroundColor: '#e0e0e0', 
                          borderRadius: '10px',
                          height: '8px',
                          marginBottom: '1rem'
                        }}>
                          <div style={{ 
                            width: `${calculateOverallGoalProgress()}%`, 
                            backgroundColor: '#0AB196',
                            borderRadius: '10px',
                            height: '100%'
                          }} />
                        </div>
                        <p>{filteredApplicationData.goals.length} goal(s) in total.</p>
                      </div>
                      
                      <div style={{ marginTop: '1rem' }}>
                        <h3>Goal Details</h3>
                        {filteredApplicationData.goals.length > 0 ? (
                          filteredApplicationData.goals.map(goal => (
                            <div key={goal.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '5px' }}>
                              <h4>{goal.title || 'N/A'}</h4>
                              <p><strong>Category:</strong> {goal.category || 'N/A'}</p>
                              <p><strong>Description:</strong> {goal.description || 'N/A'}</p>
                              <p><strong>Progress:</strong> {goal.progress || 0}%</p>
                              <p><strong>Deadline:</strong> {formatDate(goal.deadline)}</p>
                              {goal.milestones && goal.milestones.length > 0 && (
                                <>
                                  <p><strong>Key Milestones:</strong></p>
                                  <ul>
                                    {goal.milestones.map(milestone => (
                                      <li key={milestone.id} style={{ textDecoration: milestone.completed ? 'line-through' : 'none' }}>
                                        {milestone.title || 'N/A'} (Due: {formatDate(milestone.dueDate)})
                                      </li>
                                    ))}
                                  </ul>
                                </> 
                              )}
                            </div>
                          ))
                        ) : (
                          <p>No goals to display.</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Journal Section - Placeholder for brevity, needs similar dynamic data rendering */}
              {reportConfig.includeJournal && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2>Journal</h2>
                  {!reportConfig.includeJournalDetails && !reportConfig.includeJournalInsightsOnly ? (
                     <p>Summary of journal entries and insights.</p>
                  ) : (
                    <p>Detailed journal entries and/or insights will be displayed here based on actual data.</p>
                    // TODO: Implement dynamic rendering for Journal entries and insights
                    // based on filteredApplicationData.journalEntries and reportConfig settings
                  )}
                </div>
              )}
              
              {/* Mindset Techniques Section - Placeholder */}
              {reportConfig.includeMindset && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2>Mindset Techniques</h2>
                   {!reportConfig.includeMindsetDetails ? (
                     <p>Summary of mindset techniques practiced.</p>
                  ) : (
                    <p>Detailed mindset techniques practice will be displayed here based on actual data.</p>
                    // TODO: Implement dynamic rendering for Mindset practices
                    // based on filteredApplicationData.mindsetPractices
                  )}
                </div>
              )}
              
              {/* Story Vault Section - Placeholder */}
              {reportConfig.includeStoryVault && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2>Story Vault</h2>
                  {!reportConfig.includeStoryVaultDetails ? (
                    <p>Summary of stories in the vault.</p>
                  ) : (
                    <p>Detailed stories from the vault will be displayed here based on actual data.</p>
                    // TODO: Implement dynamic rendering for Story Vault
                    // based on filteredApplicationData.stories
                  )}
                </div>
              )}

              {/* Storytelling Practice Section - Placeholder */}
              {reportConfig.includeStorytellingPractice && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2>Storytelling Practice</h2>
                  {!reportConfig.includeStorytellingPracticeDetails ? (
                    <p>Summary of storytelling practice sessions.</p>
                  ) : (
                    <p>Detailed storytelling practice sessions will be displayed here based on actual data.</p>
                    // TODO: Implement dynamic rendering for Storytelling Practice
                    // based on filteredApplicationData.stories and their practiceHistory
                  )}
                </div>
              )}

              {/* Target Companies Section - Placeholder */}
              {reportConfig.includeTargetCompanies && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2>Target Companies</h2>
                  {!reportConfig.includeTargetCompaniesDetails ? (
                    <p>Summary of target companies.</p>
                  ) : (
                    <p>Detailed target company information will be displayed here based on actual data.</p>
                    // TODO: Implement dynamic rendering for Target Companies
                    // based on filteredApplicationData.targetCompanies
                  )}
                </div>
              )}

              {/* Action Plan Section - Placeholder */}
              {reportConfig.includeActionPlan && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2>Action Plan</h2>
                  {!reportConfig.includeActionPlanDetails ? (
                    <p>Summary of action plan tasks.</p>
                  ) : (
                    <p>Detailed action plan tasks will be displayed here based on actual data.</p>
                    // TODO: Implement dynamic rendering for Action Plan tasks
                    // based on filteredApplicationData.tasks
                  )}
                </div>
              )}
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;

