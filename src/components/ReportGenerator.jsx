import React, { useState } from 'react';

const ReportGenerator = ({ userData }) => {
  // State for report configuration
  const [reportConfig, setReportConfig] = useState({
    title: 'Career Progress Report',
    includeGoals: true,
    includeJournal: true,
    includeJournalInsightsOnly: false, // New option for Journal Insights only
    includeMindset: true,
    includeStoryVault: true,
    includeStorytellingPractice: true,
    includeTargetCompanies: true,
    includeActionPlan: true,
    dateRange: 'all', // 'all', 'week', 'month', 'quarter', 'year'
    customStartDate: '',
    customEndDate: '',
    format: 'pdf' // 'pdf', 'html', 'text'
  });
  
  // State for showing preview
  const [showPreview, setShowPreview] = useState(false);
  
  // Handle checkbox changes
  const handleCheckboxChange = (field) => {
    if (field === 'includeJournalInsightsOnly') {
      // Special handling for Journal Insights Only
      setReportConfig(prev => ({
        ...prev,
        [field]: !prev[field]
      }));
    } else if (field === 'includeJournal' && !reportConfig[field] && reportConfig.includeJournalInsightsOnly) {
      // If turning on Journal and Journal Insights Only was checked, keep both on
      setReportConfig(prev => ({
        ...prev,
        [field]: !prev[field]
      }));
    } else if (field === 'includeJournal' && reportConfig[field] && reportConfig.includeJournalInsightsOnly) {
      // If turning off Journal and Journal Insights Only was checked, turn off both
      setReportConfig(prev => ({
        ...prev,
        [field]: !prev[field],
        includeJournalInsightsOnly: false
      }));
    } else {
      // Normal checkbox behavior for other fields
      setReportConfig(prev => ({
        ...prev,
        [field]: !prev[field]
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
    // In a real implementation, this would generate and download the report
    // For now, we'll just show a preview
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
        return `${reportConfig.customStartDate} to ${reportConfig.customEndDate}`;
      default:
        return 'All time';
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
          
          {/* Journal */}
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
          
          {/* Journal Insights Only - FIXED OPTION */}
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            cursor: reportConfig.includeJournal ? 'pointer' : 'not-allowed',
            marginLeft: '1.5rem',
            fontSize: '0.9em',
            opacity: reportConfig.includeJournal ? 1 : 0.5
          }}>
            <input 
              type="checkbox" 
              checked={reportConfig.includeJournalInsightsOnly}
              onChange={() => handleCheckboxChange('includeJournalInsightsOnly')}
              disabled={!reportConfig.includeJournal}
              style={{ cursor: reportConfig.includeJournal ? 'pointer' : 'not-allowed' }}
            />
            Journal Insights Only
          </label>
          
          {/* Mindset */}
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
          
          {/* Story Vault */}
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
          
          {/* Storytelling Practice */}
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
          
          {/* Target Companies */}
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
          
          {/* Action Plan */}
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
                  <p>This section would include your goals progress and status.</p>
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
                      <span>Overall Progress</span>
                      <span>65%</span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      backgroundColor: '#e0e0e0', 
                      borderRadius: '10px',
                      height: '8px',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ 
                        width: '65%', 
                        backgroundColor: '#0AB196',
                        borderRadius: '10px',
                        height: '100%'
                      }} />
                    </div>
                    <p>3 of 5 goals on track</p>
                  </div>
                </div>
              )}
              
              {/* Journal Section */}
              {reportConfig.includeJournal && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2>Journal</h2>
                  
                  {/* Show only insights if that option is selected */}
                  {reportConfig.includeJournalInsightsOnly ? (
                    <div style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '1rem', 
                      borderRadius: '5px'
                    }}>
                      <h3>Journal Insights</h3>
                      <p><strong>Most Common Mood:</strong> Focused (42%)</p>
                      <p><strong>Top Accomplishment:</strong> Completed 3 interview practice sessions</p>
                      <p><strong>Most Productive Day:</strong> Tuesday</p>
                      <p><strong>Key Patterns:</strong> Higher productivity in morning hours</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ 
                        backgroundColor: '#f5f5f5', 
                        padding: '1rem', 
                        borderRadius: '5px',
                        marginBottom: '1rem'
                      }}>
                        <h3>Journal Insights</h3>
                        <p><strong>Most Common Mood:</strong> Focused (42%)</p>
                        <p><strong>Top Accomplishment:</strong> Completed 3 interview practice sessions</p>
                        <p><strong>Most Productive Day:</strong> Tuesday</p>
                        <p><strong>Key Patterns:</strong> Higher productivity in morning hours</p>
                      </div>
                      
                      <div style={{ 
                        backgroundColor: '#f5f5f5', 
                        padding: '1rem', 
                        borderRadius: '5px'
                      }}>
                        <h3>Recent Journal Entries</h3>
                        <div style={{ marginBottom: '1rem' }}>
                          <p><strong>June 5, 2025</strong></p>
                          <p>Morning: Practiced storytelling for leadership example. Feeling confident.</p>
                          <p>Evening: Researched target company culture. Need to follow up with networking contact.</p>
                        </div>
                        <div>
                          <p><strong>June 4, 2025</strong></p>
                          <p>Morning: Completed LinkedIn profile update. Received positive feedback.</p>
                          <p>Evening: Feeling tired but accomplished. Need to focus on rest tomorrow.</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Mindset Section */}
              {reportConfig.includeMindset && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2>Mindset Techniques</h2>
                  <p>This section would include your mindset technique progress.</p>
                  <div style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '1rem', 
                    borderRadius: '5px'
                  }}>
                    <h3>Mindset Progress</h3>
                    <p><strong>Most Used Technique:</strong> State-Dependent Learning</p>
                    <p><strong>Progress:</strong> 70% completion across all techniques</p>
                  </div>
                </div>
              )}
              
              {/* Story Vault Section */}
              {reportConfig.includeStoryVault && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2>Story Vault</h2>
                  <p>This section would include your professional stories.</p>
                  <div style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '1rem', 
                    borderRadius: '5px'
                  }}>
                    <h3>Story Summary</h3>
                    <p><strong>Total Stories:</strong> 5</p>
                    <p><strong>Categories:</strong> Leadership, Problem Solving, Teamwork, Innovation, Failure</p>
                  </div>
                </div>
              )}
              
              {/* Storytelling Practice Section */}
              {reportConfig.includeStorytellingPractice && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2>Storytelling Practice</h2>
                  <p>This section would include your storytelling practice sessions.</p>
                  <div style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '1rem', 
                    borderRadius: '5px'
                  }}>
                    <h3>Practice Summary</h3>
                    <p><strong>Total Practice Sessions:</strong> 8</p>
                    <p><strong>Most Practiced Story:</strong> Leadership Example</p>
                    <p><strong>Average Duration:</strong> 2:45 minutes</p>
                  </div>
                </div>
              )}
              
              {/* Target Companies Section */}
              {reportConfig.includeTargetCompanies && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2>Target Companies</h2>
                  <p>This section would include your target companies information.</p>
                  <div style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '1rem', 
                    borderRadius: '5px'
                  }}>
                    <h3>Companies Summary</h3>
                    <p><strong>Total Companies:</strong> 3</p>
                    <p><strong>Application Status:</strong> 1 Applied, 2 Researching</p>
                  </div>
                </div>
              )}
              
              {/* Action Plan Section */}
              {reportConfig.includeActionPlan && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2>Action Plan</h2>
                  <p>This section would include your action plan tasks.</p>
                  <div style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '1rem', 
                    borderRadius: '5px'
                  }}>
                    <h3>Tasks Summary</h3>
                    <p><strong>Total Tasks:</strong> 12</p>
                    <p><strong>Completed:</strong> 7 (58%)</p>
                    <p><strong>Upcoming Deadline:</strong> Resume Update (June 8, 2025)</p>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <button 
                onClick={closePreview}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Close
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
