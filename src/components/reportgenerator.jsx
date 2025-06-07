import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const ReportGenerator = () => {
  // State for report options
  const [reportOptions, setReportOptions] = useState({
    includeGoals: true,
    includeActionPlan: true,
    includeTargetCompanies: true,
    includeStories: true,
    includeMindsetTechniques: true,
    includeJournal: false,
    includeDetails: false,
    startDate: '',
    endDate: ''
  });
  
  // State for report data
  const [reportData, setReportData] = useState({
    goals: [],
    actionPlan: [],
    targetCompanies: [],
    stories: [],
    mindsetTechniques: [],
    journal: []
  });
  
  // State for previous report data (for improvement comparison)
  const [previousReportData, setPreviousReportData] = useState(null);
  
  // State for report preview
  const [showPreview, setShowPreview] = useState(false);
  
  // State for PDF generation status
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  
  // Reference to the report preview container
  const reportRef = React.useRef(null);
  
  // Load data from localStorage on component mount
  useEffect(() => {
    // Load current data
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    const actionPlan = JSON.parse(localStorage.getItem('actionplan') || '[]');
    const targetCompanies = JSON.parse(localStorage.getItem('targetcompanies') || '[]');
    const stories = JSON.parse(localStorage.getItem('stories') || '[]');
    const mindsetTechniques = JSON.parse(localStorage.getItem('mindsettechniques') || '[]');
    const journal = JSON.parse(localStorage.getItem('journalentries') || '[]');
    
    setReportData({
      goals,
      actionPlan,
      targetCompanies,
      stories,
      mindsetTechniques,
      journal
    });
    
    // Load previous report data if available
    const savedPreviousReport = localStorage.getItem('previousreportdata');
    if (savedPreviousReport) {
      try {
        setPreviousReportData(JSON.parse(savedPreviousReport));
      } catch (e) {
        console.error("Error parsing previous report data:", e);
        setPreviousReportData(null);
      }
    }
    
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    setReportOptions(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }));
  }, []);
  
  // Handle option changes
  const handleOptionChange = (option, value) => {
    setReportOptions({
      ...reportOptions,
      [option]: value
    });
  };
  
  // Generate report
  const generateReport = () => {
    // Save current data as previous report data for future comparison
    localStorage.setItem('previousreportdata', JSON.stringify(reportData));
    
    // Show preview
    setShowPreview(true);
    
    // Reset PDF states
    setPdfError(null);
    setPdfSuccess(false);
  };
  
  // Calculate overall progress
  const calculateOverallProgress = () => {
    let totalProgress = 0;
    let totalItems = 0;
    
    // Goals progress
    if (reportData.goals.length > 0) {
      const goalsProgress = reportData.goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
      totalProgress += goalsProgress;
      totalItems += reportData.goals.length;
    }
    
    // Action plan progress (completed tasks)
    if (reportData.actionPlan.length > 0) {
      const completedTasks = reportData.actionPlan.filter(task => task.completed).length;
      const actionPlanProgress = (completedTasks / reportData.actionPlan.length) * 100;
      totalProgress += actionPlanProgress;
      totalItems += 1;
    }
    
    // Target companies progress (based on status)
    if (reportData.targetCompanies.length > 0) {
      const statusValues = {
        'Researching': 20,
        'Applied': 40,
        'Interview Scheduled': 60,
        'Interview Completed': 80,
        'Offer Received': 90,
        'Accepted': 100,
        'Rejected': 0
      };
      
      const companiesProgress = reportData.targetCompanies.reduce((sum, company) => {
        return sum + (statusValues[company.status] || 0);
      }, 0);
      
      const avgCompaniesProgress = companiesProgress / reportData.targetCompanies.length;
      totalProgress += avgCompaniesProgress;
      totalItems += 1;
    }
    
    // Calculate average
    const overallProgress = totalItems > 0 ? Math.round(totalProgress / totalItems) : 0;
    return overallProgress;
  };
  
  // Calculate previous overall progress
  const calculatePreviousOverallProgress = () => {
    if (!previousReportData) return 0;
    
    let totalProgress = 0;
    let totalItems = 0;
    
    // Goals progress
    if (previousReportData.goals && previousReportData.goals.length > 0) {
      const goalsProgress = previousReportData.goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
      totalProgress += goalsProgress;
      totalItems += previousReportData.goals.length;
    }
    
    // Action plan progress (completed tasks)
    if (previousReportData.actionPlan && previousReportData.actionPlan.length > 0) {
      const completedTasks = previousReportData.actionPlan.filter(task => task.completed).length;
      const actionPlanProgress = (completedTasks / previousReportData.actionPlan.length) * 100;
      totalProgress += actionPlanProgress;
      totalItems += 1;
    }
    
    // Target companies progress (based on status)
    if (previousReportData.targetCompanies && previousReportData.targetCompanies.length > 0) {
      const statusValues = {
        'Researching': 20,
        'Applied': 40,
        'Interview Scheduled': 60,
        'Interview Completed': 80,
        'Offer Received': 90,
        'Accepted': 100,
        'Rejected': 0
      };
      
      const companiesProgress = previousReportData.targetCompanies.reduce((sum, company) => {
        return sum + (statusValues[company.status] || 0);
      }, 0);
      
      const avgCompaniesProgress = companiesProgress / previousReportData.targetCompanies.length;
      totalProgress += avgCompaniesProgress;
      totalItems += 1;
    }
    
    // Calculate average
    const overallProgress = totalItems > 0 ? Math.round(totalProgress / totalItems) : 0;
    return overallProgress;
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };
  
  // Download PDF report using html2canvas and jsPDF
  const downloadPDF = async () => {
    if (!reportRef.current) {
      alert('Please generate a report preview first');
      return;
    }
    
    try {
      setPdfGenerating(true);
      setPdfError(null);
      setPdfSuccess(false);
      
      // Create a new jsPDF instance
      const pdf = new jsPDF('p', 'mm', 'a4');
      const reportElement = reportRef.current;
      
      // Add a message to the user
      const statusDiv = document.createElement('div');
      statusDiv.style.position = 'fixed';
      statusDiv.style.top = '50%';
      statusDiv.style.left = '50%';
      statusDiv.style.transform = 'translate(-50%, -50%)';
      statusDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      statusDiv.style.color = 'white';
      statusDiv.style.padding = '20px';
      statusDiv.style.borderRadius = '5px';
      statusDiv.style.zIndex = '9999';
      statusDiv.textContent = 'Generating PDF... Please wait.';
      document.body.appendChild(statusDiv);
      
      // Wait a moment to ensure the status message is displayed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Convert the report to canvas with improved settings
      const canvas = await html2canvas(reportElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Enable cross-origin image loading
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: reportElement.scrollWidth,
        windowHeight: reportElement.scrollHeight
      });
      
      // Convert canvas to image
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Calculate dimensions
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 10; // margin in mm
      
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Calculate the number of pages needed
      const pageCount = Math.ceil(imgHeight / (pageHeight - (margin * 2)));
      
      // Add each page to the PDF
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
      heightLeft -= (pageHeight - (margin * 2));
      
      // Add subsequent pages if needed
      for (let i = 1; i < pageCount; i++) {
        position = -(pageHeight * i) + (margin * 2);
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
      }
      
      // Save the PDF
      pdf.save('career_maniacs_report.pdf');
      
      // Remove the status message
      document.body.removeChild(statusDiv);
      
      setPdfGenerating(false);
      setPdfSuccess(true);
      
      // Show success message
      setTimeout(() => {
        setPdfSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setPdfError('Failed to generate PDF. Please try again.');
      setPdfGenerating(false);
      alert('There was an error generating the PDF. Please try again.');
    }
  };
  
  // Calculate improvement from previous report
  const calculateImprovement = () => {
    const currentProgress = calculateOverallProgress();
    const previousProgress = calculatePreviousOverallProgress();
    return currentProgress - previousProgress;
  };
  
  // Get improvement display class
  const getImprovementClass = () => {
    const improvement = calculateImprovement();
    if (improvement > 0) return 'improvement positive';
    if (improvement < 0) return 'improvement negative';
    return 'improvement neutral';
  };
  
  // Get improvement display text
  const getImprovementText = () => {
    const improvement = calculateImprovement();
    if (improvement > 0) return `+${improvement.toFixed(1)}%`;
    if (improvement < 0) return `${improvement.toFixed(1)}%`;
    return 'No change (0%)';
  };
  
  // Get improvement description
  const getImprovementDescription = () => {
    const improvement = calculateImprovement();
    if (improvement > 0) return 'You\'ve made positive progress since your last report!';
    if (improvement < 0) return 'Your progress has decreased since your last report. Consider reviewing your goals and action plan.';
    return 'Your progress has remained stable since your last report.';
  };
  
  // Always show improvement section if previous data exists
  const shouldShowImprovement = () => {
    return previousReportData !== null;
  };
  
  return (
    <div className="report-generator" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ 
        background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: 'bold',
        marginBottom: '2rem'
      }}>
        Report Generator
      </h2>
      
      {!showPreview ? (
        <div className="report-options" style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Report Options</h3>
          
          <div className="date-range" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Date Range</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Start Date:</label>
                <input
                  type="date"
                  value={reportOptions.startDate}
                  onChange={(e) => handleOptionChange('startDate', e.target.value)}
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
                  value={reportOptions.endDate}
                  onChange={(e) => handleOptionChange('endDate', e.target.value)}
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
          </div>
          
          <div className="sections" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Include Sections</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="includeGoals"
                  checked={reportOptions.includeGoals}
                  onChange={(e) => handleOptionChange('includeGoals', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                <label htmlFor="includeGoals">Goals</label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="includeActionPlan"
                  checked={reportOptions.includeActionPlan}
                  onChange={(e) => handleOptionChange('includeActionPlan', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                <label htmlFor="includeActionPlan">Action Plan</label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="includeTargetCompanies"
                  checked={reportOptions.includeTargetCompanies}
                  onChange={(e) => handleOptionChange('includeTargetCompanies', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                <label htmlFor="includeTargetCompanies">Target Companies</label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="includeStories"
                  checked={reportOptions.includeStories}
                  onChange={(e) => handleOptionChange('includeStories', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                <label htmlFor="includeStories">Stories</label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="includeMindsetTechniques"
                  checked={reportOptions.includeMindsetTechniques}
                  onChange={(e) => handleOptionChange('includeMindsetTechniques', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                <label htmlFor="includeMindsetTechniques">Mindset Techniques</label>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="includeJournal"
                  checked={reportOptions.includeJournal}
                  onChange={(e) => handleOptionChange('includeJournal', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                <label htmlFor="includeJournal">Journal</label>
              </div>
            </div>
          </div>
          
          <div className="detail-level" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Detail Level</h4>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="includeDetails"
                checked={reportOptions.includeDetails}
                onChange={(e) => handleOptionChange('includeDetails', e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              <label htmlFor="includeDetails">Include Details</label>
            </div>
          </div>
          
          <button 
            onClick={generateReport}
            style={{
              background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
              border: 'none',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            Generate Report
          </button>
        </div>
      ) : (
        <div className="report-preview-container">
          <div className="report-actions" style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <button 
              onClick={() => setShowPreview(false)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Back to Options
            </button>
            
            <button 
              onClick={downloadPDF}
              disabled={pdfGenerating}
              style={{
                background: pdfGenerating ? 'rgba(22, 179, 247, 0.5)' : 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                border: 'none',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '5px',
                cursor: pdfGenerating ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {pdfGenerating ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>
          
          {pdfError && (
            <div style={{ 
              backgroundColor: 'rgba(220,53,69,0.2)', 
              color: '#dc3545',
              padding: '1rem',
              borderRadius: '5px',
              marginBottom: '1rem'
            }}>
              {pdfError}
            </div>
          )}
          
          {pdfSuccess && (
            <div style={{ 
              backgroundColor: 'rgba(40,167,69,0.2)', 
              color: '#28a745',
              padding: '1rem',
              borderRadius: '5px',
              marginBottom: '1rem'
            }}>
              PDF generated successfully! Your download should begin automatically.
            </div>
          )}
          
          <div 
            className="report-preview" 
            ref={reportRef}
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: '2rem', 
              borderRadius: '10px',
              marginBottom: '2rem'
            }}
          >
            <div className="report-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h2 style={{ 
                background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                Career Maniacs Progress Report
              </h2>
              <p style={{ marginBottom: '0.5rem' }}>
                {formatDate(reportOptions.startDate)} to {formatDate(reportOptions.endDate)}
              </p>
              <p style={{ opacity: 0.7 }}>
                Generated on: {formatDate(new Date().toISOString().split('T')[0])}
              </p>
            </div>
            
            <div className="report-section" style={{ 
              marginBottom: '2rem',
              backgroundColor: 'rgba(255,255,255,0.05)',
              padding: '1.5rem',
              borderRadius: '10px'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>Overall Progress</h3>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold',
                  marginRight: '1rem',
                  color: '#16B3F7'
                }}>
                  {calculateOverallProgress()}%
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    height: '20px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      height: '100%',
                      width: `${calculateOverallProgress()}%`,
                      background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                      borderRadius: '10px'
                    }}></div>
                  </div>
                </div>
              </div>
              
              {shouldShowImprovement() && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Improvement from Previous Report</h4>
                  <div style={{ 
                    padding: '0.75rem',
                    borderRadius: '5px',
                    display: 'inline-block',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    backgroundColor: calculateImprovement() > 0 
                      ? 'rgba(40,167,69,0.2)' 
                      : calculateImprovement() < 0 
                        ? 'rgba(220,53,69,0.2)'
                        : 'rgba(255,255,255,0.1)',
                    color: calculateImprovement() > 0 
                      ? '#28a745' 
                      : calculateImprovement() < 0 
                        ? '#dc3545'
                        : 'white'
                  }}>
                    {getImprovementText()}
                  </div>
                  <p style={{ marginTop: '0.75rem' }}>{getImprovementDescription()}</p>
                </div>
              )}
            </div>
            
            {reportOptions.includeGoals && (
              <div className="report-section" style={{ 
                marginBottom: '2rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '1.5rem',
                borderRadius: '10px'
              }}>
                <h3 style={{ marginBottom: '1rem' }}>Goals</h3>
                {reportData.goals.length === 0 ? (
                  <p style={{ opacity: 0.7 }}>No goals have been set yet.</p>
                ) : reportOptions.includeDetails ? (
                  <div className="goals-details">
                    {reportData.goals.map((goal, index) => (
                      <div key={index} style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        padding: '1.5rem',
                        borderRadius: '10px',
                        marginBottom: index < reportData.goals.length - 1 ? '1rem' : 0
                      }}>
                        <h4 style={{ marginBottom: '1rem' }}>{goal.title}</h4>
                        
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem'
                          }}>
                            <span>Progress: {goal.progress || 0}%</span>
                          </div>
                          <div style={{ 
                            height: '10px',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            borderRadius: '5px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              height: '100%',
                              width: `${goal.progress || 0}%`,
                              background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                              borderRadius: '5px'
                            }}></div>
                          </div>
                        </div>
                        
                        {goal.deadline && (
                          <div style={{ marginBottom: '1rem' }}>
                            <strong>Deadline:</strong> {formatDate(goal.deadline)}
                          </div>
                        )}
                        
                        {goal.description && (
                          <div style={{ marginBottom: '1rem' }}>
                            {goal.description}
                          </div>
                        )}
                        
                        {goal.why && (
                          <div style={{ marginBottom: '1rem' }}>
                            <h5 style={{ marginBottom: '0.5rem' }}>Why:</h5>
                            <p style={{ 
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              padding: '1rem',
                              borderRadius: '5px'
                            }}>{goal.why}</p>
                          </div>
                        )}
                        
                        {goal.implications && (
                          <div style={{ marginBottom: '1rem' }}>
                            <h5 style={{ marginBottom: '0.5rem' }}>Implications:</h5>
                            <p style={{ 
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              padding: '1rem',
                              borderRadius: '5px'
                            }}>{goal.implications}</p>
                          </div>
                        )}
                        
                        {goal.miniActionPlan && goal.miniActionPlan.length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <h5 style={{ marginBottom: '0.5rem' }}>Mini Action Plan:</h5>
                            <ul style={{ 
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              padding: '1rem',
                              borderRadius: '5px',
                              listStylePosition: 'inside'
                            }}>
                              {goal.miniActionPlan.map((step, i) => (
                                <li key={i} style={{ 
                                  marginBottom: i < goal.miniActionPlan.length - 1 ? '0.5rem' : 0,
                                  textDecoration: step.completed ? 'line-through' : 'none',
                                  opacity: step.completed ? 0.7 : 1
                                }}>
                                  {step.text}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {goal.milestones && goal.milestones.length > 0 && (
                          <div>
                            <h5 style={{ marginBottom: '0.5rem' }}>Milestones:</h5>
                            <ul style={{ 
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              padding: '1rem',
                              borderRadius: '5px',
                              listStylePosition: 'inside'
                            }}>
                              {goal.milestones.map((milestone, i) => (
                                <li key={i} style={{ 
                                  marginBottom: i < goal.milestones.length - 1 ? '0.5rem' : 0,
                                  textDecoration: milestone.completed ? 'line-through' : 'none',
                                  opacity: milestone.completed ? 0.7 : 1
                                }}>
                                  {milestone.title}
                                  {milestone.dueDate && ` (Due: ${formatDate(milestone.dueDate)})`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '1.5rem',
                    borderRadius: '10px'
                  }}>
                    <p>You have {reportData.goals.length} goals set.</p>
                    
                    {reportData.goals.length > 0 && (
                      <>
                        <p style={{ marginTop: '0.5rem' }}>
                          Average progress: {
                            Math.round(
                              reportData.goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / 
                              reportData.goals.length
                            )
                          }%
                        </p>
                        
                        <p style={{ marginTop: '0.5rem' }}>
                          Milestones: {
                            reportData.goals.reduce((sum, goal) => {
                              return sum + (goal.milestones?.filter(m => m.completed)?.length || 0);
                            }, 0)
                          } completed out of {
                            reportData.goals.reduce((sum, goal) => sum + (goal.milestones?.length || 0), 0)
                          } total
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {reportOptions.includeActionPlan && (
              <div className="report-section" style={{ 
                marginBottom: '2rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '1.5rem',
                borderRadius: '10px'
              }}>
                <h3 style={{ marginBottom: '1rem' }}>Action Plan</h3>
                {reportData.actionPlan.length === 0 ? (
                  <p style={{ opacity: 0.7 }}>No action plan items have been created yet.</p>
                ) : reportOptions.includeDetails ? (
                  <div>
                    {reportData.actionPlan.filter(task => !task.completed).length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1rem' }}>Pending Tasks</h4>
                        {reportData.actionPlan.filter(task => !task.completed).map((task, index) => (
                          <div key={index} style={{ 
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            padding: '1rem',
                            borderRadius: '5px',
                            marginBottom: index < reportData.actionPlan.filter(t => !t.completed).length - 1 ? '0.5rem' : 0
                          }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{task.text}</div>
                            
                            {task.dueDate && (
                              <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                                Due: {formatDate(task.dueDate)}
                              </div>
                            )}
                            
                            {task.notes && (
                              <div style={{ 
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                padding: '0.75rem',
                                borderRadius: '5px',
                                fontSize: '0.9rem'
                              }}>
                                {task.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {reportData.actionPlan.filter(task => task.completed).length > 0 && (
                      <div>
                        <h4 style={{ marginBottom: '1rem' }}>Completed Tasks</h4>
                        {reportData.actionPlan.filter(task => task.completed).map((task, index) => (
                          <div key={index} style={{ 
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            padding: '1rem',
                            borderRadius: '5px',
                            marginBottom: index < reportData.actionPlan.filter(t => t.completed).length - 1 ? '0.5rem' : 0,
                            opacity: 0.7
                          }}>
                            <div style={{ 
                              fontWeight: 'bold', 
                              marginBottom: '0.5rem',
                              textDecoration: 'line-through'
                            }}>
                              {task.text}
                            </div>
                            
                            {task.completedDate && (
                              <div style={{ fontSize: '0.9rem' }}>
                                Completed: {formatDate(task.completedDate)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '1.5rem',
                    borderRadius: '10px'
                  }}>
                    <p>Total tasks: {reportData.actionPlan.length}</p>
                    <p style={{ marginTop: '0.5rem' }}>
                      Completed: {reportData.actionPlan.filter(task => task.completed).length}
                    </p>
                    <p style={{ marginTop: '0.5rem' }}>
                      Pending: {reportData.actionPlan.filter(task => !task.completed).length}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {reportOptions.includeTargetCompanies && (
              <div className="report-section" style={{ 
                marginBottom: '2rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '1.5rem',
                borderRadius: '10px'
              }}>
                <h3 style={{ marginBottom: '1rem' }}>Target Companies</h3>
                {reportData.targetCompanies.length === 0 ? (
                  <p style={{ opacity: 0.7 }}>No target companies have been added yet.</p>
                ) : reportOptions.includeDetails ? (
                  <div>
                    {reportData.targetCompanies.map((company, index) => (
                      <div key={index} style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        padding: '1.5rem',
                        borderRadius: '10px',
                        marginBottom: index < reportData.targetCompanies.length - 1 ? '1rem' : 0
                      }}>
                        <h4 style={{ marginBottom: '1rem' }}>{company.name}</h4>
                        
                        {company.position && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong>Position:</strong> {company.position}
                          </div>
                        )}
                        
                        {company.status && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong>Status:</strong> {company.status}
                          </div>
                        )}
                        
                        {company.hiringManager && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong>Hiring Manager:</strong> {company.hiringManager}
                          </div>
                        )}
                        
                        {company.datePosted && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong>Date Posted:</strong> {formatDate(company.datePosted)}
                          </div>
                        )}
                        
                        {company.notes && (
                          <div style={{ 
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            padding: '1rem',
                            borderRadius: '5px',
                            marginTop: '1rem'
                          }}>
                            {company.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '1.5rem',
                    borderRadius: '10px'
                  }}>
                    <p>Total companies: {reportData.targetCompanies.length}</p>
                    
                    {reportData.targetCompanies.length > 0 && (
                      <>
                        <p style={{ marginTop: '0.5rem' }}>
                          Applied: {
                            reportData.targetCompanies.filter(
                              company => company.status && company.status !== 'Researching'
                            ).length
                          }
                        </p>
                        
                        <p style={{ marginTop: '0.5rem' }}>
                          Interviews: {
                            reportData.targetCompanies.filter(
                              company => company.status && 
                              (company.status === 'Interview Scheduled' || 
                               company.status === 'Interview Completed')
                            ).length
                          }
                        </p>
                        
                        <p style={{ marginTop: '0.5rem' }}>
                          Offers: {
                            reportData.targetCompanies.filter(
                              company => company.status && 
                              (company.status === 'Offer Received' || 
                               company.status === 'Accepted')
                            ).length
                          }
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {reportOptions.includeStories && (
              <div className="report-section" style={{ 
                marginBottom: '2rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '1.5rem',
                borderRadius: '10px'
              }}>
                <h3 style={{ marginBottom: '1rem' }}>Stories</h3>
                {reportData.stories.length === 0 ? (
                  <p style={{ opacity: 0.7 }}>No stories have been created yet.</p>
                ) : reportOptions.includeDetails ? (
                  <div>
                    {reportData.stories.map((story, index) => (
                      <div key={index} style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        padding: '1.5rem',
                        borderRadius: '10px',
                        marginBottom: index < reportData.stories.length - 1 ? '1rem' : 0
                      }}>
                        <h4 style={{ marginBottom: '1rem' }}>{story.title}</h4>
                        
                        {story.category && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong>Category:</strong> {story.category}
                          </div>
                        )}
                        
                        {story.createdAt && (
                          <div style={{ marginBottom: '1rem' }}>
                            <strong>Created:</strong> {formatDate(story.createdAt)}
                          </div>
                        )}
                        
                        {story.content && (
                          <div style={{ 
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            padding: '1rem',
                            borderRadius: '5px',
                            marginBottom: '1rem'
                          }}>
                            {story.content}
                          </div>
                        )}
                        
                        {story.feedback && (
                          <div>
                            <h5 style={{ marginBottom: '0.5rem' }}>Feedback:</h5>
                            <div style={{ 
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              padding: '1rem',
                              borderRadius: '5px'
                            }}>
                              {story.feedback}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '1.5rem',
                    borderRadius: '10px'
                  }}>
                    <p>Total stories: {reportData.stories.length}</p>
                    
                    {reportData.stories.length > 0 && (
                      <>
                        <p style={{ marginTop: '0.5rem' }}>
                          Categories: {
                            [...new Set(reportData.stories.map(story => story.category).filter(Boolean))].join(', ')
                          }
                        </p>
                        
                        <p style={{ marginTop: '0.5rem' }}>
                          Most recent: {
                            formatDate(
                              reportData.stories
                                .filter(story => story.createdAt)
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.createdAt
                            )
                          }
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {reportOptions.includeMindsetTechniques && (
              <div className="report-section" style={{ 
                marginBottom: '2rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '1.5rem',
                borderRadius: '10px'
              }}>
                <h3 style={{ marginBottom: '1rem' }}>Mindset Techniques</h3>
                {reportData.mindsetTechniques.length === 0 ? (
                  <p style={{ opacity: 0.7 }}>No mindset techniques have been practiced yet.</p>
                ) : reportOptions.includeDetails ? (
                  <div>
                    {reportData.mindsetTechniques.map((technique, index) => (
                      <div key={index} style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        padding: '1.5rem',
                        borderRadius: '10px',
                        marginBottom: index < reportData.mindsetTechniques.length - 1 ? '1rem' : 0
                      }}>
                        <h4 style={{ marginBottom: '1rem' }}>{technique.name}</h4>
                        
                        {technique.description && (
                          <div style={{ marginBottom: '1rem' }}>
                            {technique.description}
                          </div>
                        )}
                        
                        {technique.practices && technique.practices.length > 0 && (
                          <div>
                            <h5 style={{ marginBottom: '0.5rem' }}>Practice Sessions:</h5>
                            {technique.practices.map((practice, i) => (
                              <div key={i} style={{ 
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                padding: '1rem',
                                borderRadius: '5px',
                                marginBottom: i < technique.practices.length - 1 ? '0.5rem' : 0
                              }}>
                                {practice.date && (
                                  <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    {formatDate(practice.date)}
                                  </div>
                                )}
                                
                                {practice.notes && (
                                  <div>{practice.notes}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '1.5rem',
                    borderRadius: '10px'
                  }}>
                    <p>Total techniques: {reportData.mindsetTechniques.length}</p>
                    
                    {reportData.mindsetTechniques.length > 0 && (
                      <>
                        <p style={{ marginTop: '0.5rem' }}>
                          Practice sessions: {
                            reportData.mindsetTechniques.reduce(
                              (sum, technique) => sum + (technique.practices?.length || 0), 0
                            )
                          }
                        </p>
                        
                        <p style={{ marginTop: '0.5rem' }}>
                          Most practiced: {
                            reportData.mindsetTechniques
                              .sort((a, b) => (b.practices?.length || 0) - (a.practices?.length || 0))[0]?.name
                          }
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {reportOptions.includeJournal && (
              <div className="report-section" style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '1.5rem',
                borderRadius: '10px'
              }}>
                <h3 style={{ marginBottom: '1rem' }}>Journal</h3>
                {reportData.journal.length === 0 ? (
                  <p style={{ opacity: 0.7 }}>No journal entries have been created yet.</p>
                ) : reportOptions.includeDetails ? (
                  <div>
                    {reportData.journal
                      .filter(entry => {
                        // Filter entries within the selected date range
                        if (!entry.date) return true;
                        const entryDate = new Date(entry.date);
                        const startDate = new Date(reportOptions.startDate);
                        const endDate = new Date(reportOptions.endDate);
                        return entryDate >= startDate && entryDate <= endDate;
                      })
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((entry, index) => (
                        <div key={index} style={{ 
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          padding: '1.5rem',
                          borderRadius: '10px',
                          marginBottom: index < reportData.journal.length - 1 ? '1rem' : 0
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '1rem'
                          }}>
                            <h4>{entry.title || `Journal Entry ${index + 1}`}</h4>
                            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                              {formatDate(entry.date)} - {entry.time}
                            </div>
                          </div>
                          
                          {entry.content && (
                            <div style={{ 
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              padding: '1rem',
                              borderRadius: '5px',
                              marginBottom: entry.insights ? '1rem' : 0,
                              whiteSpace: 'pre-line'
                            }}>
                              {entry.content}
                            </div>
                          )}
                          
                          {entry.insights && (
                            <div>
                              <h5 style={{ marginBottom: '0.5rem', marginTop: '1rem' }}>Insights:</h5>
                              <div style={{ 
                                backgroundColor: 'rgba(10,177,150,0.1)', 
                                padding: '1rem', 
                                borderRadius: '5px',
                                whiteSpace: 'pre-line'
                              }}>
                                {entry.insights}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '1.5rem',
                    borderRadius: '10px'
                  }}>
                    <p>Total entries: {
                      reportData.journal.filter(entry => {
                        if (!entry.date) return true;
                        const entryDate = new Date(entry.date);
                        const startDate = new Date(reportOptions.startDate);
                        const endDate = new Date(reportOptions.endDate);
                        return entryDate >= startDate && entryDate <= endDate;
                      }).length
                    }</p>
                    
                    {reportData.journal.length > 0 && (
                      <>
                        <p style={{ marginTop: '0.5rem' }}>
                          Morning entries: {
                            reportData.journal.filter(entry => entry.time === 'morning').length
                          }
                        </p>
                        
                        <p style={{ marginTop: '0.5rem' }}>
                          Afternoon entries: {
                            reportData.journal.filter(entry => entry.time === 'afternoon').length
                          }
                        </p>
                        
                        <p style={{ marginTop: '0.5rem' }}>
                          Evening entries: {
                            reportData.journal.filter(entry => entry.time === 'evening').length
                          }
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
