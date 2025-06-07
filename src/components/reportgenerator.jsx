import React, { useState, useEffect, useRef } from 'react';
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
  const reportRef = useRef(null);
  
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
  
  // FIXED: Download PDF report using a simpler, more direct approach
  const downloadPDF = () => {
    console.log("Download PDF button clicked");
    
    if (!reportRef.current) {
      alert('Please generate a report preview first');
      return;
    }
    
    // Set generating state
    setPdfGenerating(true);
    setPdfError(null);
    setPdfSuccess(false);
    
    // Create a simple PDF directly
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title
      pdf.setFontSize(18);
      pdf.text("Career Maniacs Report", 105, 15, { align: 'center' });
      
      // Add date
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 25, { align: 'center' });
      
      // Add overall progress
      const overallProgress = calculateOverallProgress();
      pdf.text(`Overall Progress: ${overallProgress}%`, 20, 40);
      
      // Add improvement if available
      if (shouldShowImprovement()) {
        const improvement = calculateImprovement();
        const improvementText = improvement > 0 ? `+${improvement}%` : `${improvement}%`;
        pdf.text(`Improvement from previous report: ${improvementText}`, 20, 50);
      }
      
      // Add sections
      let yPosition = 60;
      
      // Goals section
      if (reportOptions.includeGoals && reportData.goals.length > 0) {
        pdf.setFontSize(14);
        pdf.text("Goals", 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        reportData.goals.forEach(goal => {
          pdf.text(`• ${goal.title} - Progress: ${goal.progress}%`, 25, yPosition);
          yPosition += 7;
          
          if (reportOptions.includeDetails && goal.description) {
            pdf.text(`  ${goal.description}`, 30, yPosition);
            yPosition += 7;
          }
          
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
        });
        
        yPosition += 5;
      }
      
      // Action Plan section
      if (reportOptions.includeActionPlan && reportData.actionPlan.length > 0) {
        pdf.setFontSize(14);
        pdf.text("Action Plan", 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        reportData.actionPlan.forEach(task => {
          const status = task.completed ? "✓" : "○";
          pdf.text(`• ${status} ${task.title}`, 25, yPosition);
          yPosition += 7;
          
          if (reportOptions.includeDetails && task.description) {
            pdf.text(`  ${task.description}`, 30, yPosition);
            yPosition += 7;
          }
          
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
        });
        
        yPosition += 5;
      }
      
      // Target Companies section
      if (reportOptions.includeTargetCompanies && reportData.targetCompanies.length > 0) {
        pdf.setFontSize(14);
        pdf.text("Target Companies", 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        reportData.targetCompanies.forEach(company => {
          pdf.text(`• ${company.name} - Status: ${company.status}`, 25, yPosition);
          yPosition += 7;
          
          if (reportOptions.includeDetails && company.notes) {
            pdf.text(`  ${company.notes}`, 30, yPosition);
            yPosition += 7;
          }
          
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
        });
        
        yPosition += 5;
      }
      
      // Stories section
      if (reportOptions.includeStories && reportData.stories.length > 0) {
        pdf.setFontSize(14);
        pdf.text("Stories", 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        reportData.stories.forEach(story => {
          pdf.text(`• ${story.title} - Category: ${story.category}`, 25, yPosition);
          yPosition += 7;
          
          if (reportOptions.includeDetails && story.content) {
            // Split long content into multiple lines
            const contentLines = pdf.splitTextToSize(story.content, 160);
            contentLines.forEach(line => {
              pdf.text(`  ${line}`, 30, yPosition);
              yPosition += 5;
              
              if (yPosition > 270) {
                pdf.addPage();
                yPosition = 20;
              }
            });
          }
          
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
        });
        
        yPosition += 5;
      }
      
      // Save the PDF
      pdf.save('career_maniacs_report.pdf');
      
      // Update states
      setPdfGenerating(false);
      setPdfSuccess(true);
      
      // Reset success message after a few seconds
      setTimeout(() => {
        setPdfSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setPdfError(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
      setPdfGenerating(false);
      alert(`There was an error generating the PDF: ${error.message || 'Unknown error'}. Please try again.`);
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
              fontWeight: 'bold'
            }}
          >
            Generate Report
          </button>
        </div>
      ) : (
        <div>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <button 
              onClick={() => setShowPreview(false)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Back to Options
            </button>
            
            {/* FIXED: Download PDF button with direct onClick handler and visual feedback */}
            <button 
              onClick={downloadPDF}
              disabled={pdfGenerating}
              style={{
                background: pdfGenerating ? 'rgba(255,255,255,0.1)' : 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                border: pdfGenerating ? '1px solid rgba(255,255,255,0.2)' : 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: pdfGenerating ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {pdfGenerating ? (
                <>
                  <span style={{ display: 'inline-block', width: '1em', height: '1em', borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></span>
                  Generating PDF...
                </>
              ) : (
                <>
                  <span style={{ fontSize: '1.2em' }}>↓</span>
                  Download PDF
                </>
              )}
            </button>
          </div>
          
          {/* PDF Status Messages */}
          {pdfError && (
            <div style={{ 
              backgroundColor: 'rgba(220,53,69,0.2)',
              color: '#dc3545',
              padding: '1rem',
              borderRadius: '5px',
              marginBottom: '1.5rem'
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
              marginBottom: '1.5rem'
            }}>
              PDF generated and downloaded successfully!
            </div>
          )}
          
          {/* Report Preview */}
          <div 
            ref={reportRef}
            style={{ 
              backgroundColor: 'white',
              color: 'black',
              padding: '2rem',
              borderRadius: '10px',
              marginBottom: '2rem'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{ 
                color: '#0AB196',
                marginBottom: '0.5rem'
              }}>
                Career Maniacs Report
              </h1>
              
              <p style={{ color: '#666' }}>
                {formatDate(reportOptions.startDate)} - {formatDate(reportOptions.endDate)}
              </p>
            </div>
            
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '10px'
            }}>
              <div>
                <h2 style={{ marginBottom: '0.5rem' }}>Overall Progress</h2>
                <div style={{ 
                  width: '100px',
                  height: '100px',
                  position: 'relative',
                  borderRadius: '50%',
                  background: `conic-gradient(#0AB196 ${calculateOverallProgress()}%, #f0f0f0 0)`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <div style={{ 
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>{calculateOverallProgress()}%</span>
                  </div>
                </div>
              </div>
              
              {/* Improvement from Previous Report */}
              {shouldShowImprovement() && (
                <div style={{ 
                  padding: '1rem',
                  backgroundColor: calculateImprovement() > 0 ? 'rgba(40,167,69,0.1)' : calculateImprovement() < 0 ? 'rgba(220,53,69,0.1)' : 'rgba(255,193,7,0.1)',
                  borderRadius: '10px',
                  maxWidth: '60%'
                }}>
                  <h3 style={{ 
                    marginBottom: '0.5rem',
                    color: calculateImprovement() > 0 ? '#28a745' : calculateImprovement() < 0 ? '#dc3545' : '#ffc107'
                  }}>
                    Improvement from Previous Report
                  </h3>
                  
                  <div style={{ 
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: calculateImprovement() > 0 ? '#28a745' : calculateImprovement() < 0 ? '#dc3545' : '#ffc107',
                    marginBottom: '0.5rem'
                  }}>
                    {getImprovementText()}
                  </div>
                  
                  <p>{getImprovementDescription()}</p>
                </div>
              )}
            </div>
            
            {/* Goals Section */}
            {reportOptions.includeGoals && reportData.goals.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  color: '#0AB196',
                  marginBottom: '1rem',
                  borderBottom: '2px solid #0AB196',
                  paddingBottom: '0.5rem'
                }}>
                  Goals
                </h2>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1rem'
                }}>
                  {reportData.goals.map(goal => (
                    <div 
                      key={goal.id}
                      style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        padding: '1rem',
                        border: '1px solid #e9ecef'
                      }}
                    >
                      <h3 style={{ marginBottom: '0.5rem' }}>{goal.title}</h3>
                      
                      {reportOptions.includeDetails && goal.description && (
                        <p style={{ marginBottom: '1rem', color: '#666' }}>{goal.description}</p>
                      )}
                      
                      <div style={{ 
                        height: '10px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '5px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          height: '100%',
                          width: `${goal.progress || 0}%`,
                          backgroundColor: '#0AB196',
                          borderRadius: '5px'
                        }}></div>
                      </div>
                      
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '0.5rem',
                        color: '#666'
                      }}>
                        <span>Progress</span>
                        <span>{goal.progress || 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Action Plan Section */}
            {reportOptions.includeActionPlan && reportData.actionPlan.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  color: '#0AB196',
                  marginBottom: '1rem',
                  borderBottom: '2px solid #0AB196',
                  paddingBottom: '0.5rem'
                }}>
                  Action Plan
                </h2>
                
                <div style={{ 
                  backgroundColor: '#f8f9fa',
                  borderRadius: '10px',
                  padding: '1rem',
                  border: '1px solid #e9ecef'
                }}>
                  {reportData.actionPlan.map(task => (
                    <div 
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        marginBottom: '1rem',
                        padding: '0.5rem',
                        backgroundColor: task.completed ? 'rgba(40,167,69,0.1)' : 'transparent',
                        borderRadius: '5px'
                      }}
                    >
                      <div style={{ 
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: task.completed ? '#28a745' : '#adb5bd',
                        backgroundColor: task.completed ? '#28a745' : 'transparent',
                        marginRight: '1rem',
                        position: 'relative'
                      }}>
                        {task.completed && (
                          <span style={{ 
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: 'white',
                            fontSize: '0.8rem'
                          }}>✓</span>
                        )}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          marginBottom: reportOptions.includeDetails && task.description ? '0.5rem' : 0,
                          textDecoration: task.completed ? 'line-through' : 'none',
                          color: task.completed ? '#28a745' : 'inherit'
                        }}>
                          {task.title}
                        </h3>
                        
                        {reportOptions.includeDetails && task.description && (
                          <p style={{ 
                            color: '#666',
                            textDecoration: task.completed ? 'line-through' : 'none'
                          }}>
                            {task.description}
                          </p>
                        )}
                      </div>
                      
                      {task.dueDate && (
                        <div style={{ 
                          color: '#666',
                          fontSize: '0.9rem'
                        }}>
                          Due: {formatDate(task.dueDate)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Target Companies Section */}
            {reportOptions.includeTargetCompanies && reportData.targetCompanies.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  color: '#0AB196',
                  marginBottom: '1rem',
                  borderBottom: '2px solid #0AB196',
                  paddingBottom: '0.5rem'
                }}>
                  Target Companies
                </h2>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1rem'
                }}>
                  {reportData.targetCompanies.map(company => (
                    <div 
                      key={company.id}
                      style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        padding: '1rem',
                        border: '1px solid #e9ecef'
                      }}
                    >
                      <h3 style={{ marginBottom: '0.5rem' }}>{company.name}</h3>
                      
                      <div style={{ 
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: 
                          company.status === 'Accepted' ? 'rgba(40,167,69,0.2)' :
                          company.status === 'Offer Received' ? 'rgba(40,167,69,0.1)' :
                          company.status === 'Interview Completed' ? 'rgba(0,123,255,0.2)' :
                          company.status === 'Interview Scheduled' ? 'rgba(0,123,255,0.1)' :
                          company.status === 'Applied' ? 'rgba(255,193,7,0.2)' :
                          company.status === 'Researching' ? 'rgba(255,193,7,0.1)' :
                          'rgba(220,53,69,0.1)',
                        color: 
                          company.status === 'Accepted' ? '#28a745' :
                          company.status === 'Offer Received' ? '#28a745' :
                          company.status === 'Interview Completed' ? '#007bff' :
                          company.status === 'Interview Scheduled' ? '#007bff' :
                          company.status === 'Applied' ? '#ffc107' :
                          company.status === 'Researching' ? '#ffc107' :
                          '#dc3545',
                        borderRadius: '5px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                      }}>
                        {company.status}
                      </div>
                      
                      {reportOptions.includeDetails && company.notes && (
                        <p style={{ color: '#666' }}>{company.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Stories Section */}
            {reportOptions.includeStories && reportData.stories.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  color: '#0AB196',
                  marginBottom: '1rem',
                  borderBottom: '2px solid #0AB196',
                  paddingBottom: '0.5rem'
                }}>
                  Stories
                </h2>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1rem'
                }}>
                  {reportData.stories.map(story => (
                    <div 
                      key={story.id}
                      style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        padding: '1rem',
                        border: '1px solid #e9ecef'
                      }}
                    >
                      <h3 style={{ marginBottom: '0.5rem' }}>{story.title}</h3>
                      
                      <div style={{ 
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: 'rgba(0,123,255,0.1)',
                        color: '#007bff',
                        borderRadius: '5px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                      }}>
                        {story.category}
                      </div>
                      
                      {reportOptions.includeDetails && story.content && (
                        <p style={{ color: '#666' }}>{story.content}</p>
                      )}
                      
                      {story.practiceCount > 0 && (
                        <div style={{ 
                          marginTop: '1rem',
                          fontSize: '0.9rem',
                          color: '#666'
                        }}>
                          Practiced: {story.practiceCount} {story.practiceCount === 1 ? 'time' : 'times'}
                          {story.lastPracticed && (
                            <span> (Last: {formatDate(story.lastPracticed)})</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Mindset Techniques Section */}
            {reportOptions.includeMindsetTechniques && reportData.mindsetTechniques.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  color: '#0AB196',
                  marginBottom: '1rem',
                  borderBottom: '2px solid #0AB196',
                  paddingBottom: '0.5rem'
                }}>
                  Mindset Techniques
                </h2>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1rem'
                }}>
                  {reportData.mindsetTechniques.map(technique => (
                    <div 
                      key={technique.id}
                      style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        padding: '1rem',
                        border: '1px solid #e9ecef'
                      }}
                    >
                      <h3 style={{ marginBottom: '0.5rem' }}>{technique.title}</h3>
                      
                      {reportOptions.includeDetails && technique.description && (
                        <p style={{ color: '#666' }}>{technique.description}</p>
                      )}
                      
                      <div style={{ 
                        marginTop: '1rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <div style={{ 
                          width: '100px',
                          height: '10px',
                          backgroundColor: '#e9ecef',
                          borderRadius: '5px',
                          overflow: 'hidden',
                          marginRight: '1rem'
                        }}>
                          <div style={{ 
                            height: '100%',
                            width: `${technique.progress || 0}%`,
                            backgroundColor: '#0AB196',
                            borderRadius: '5px'
                          }}></div>
                        </div>
                        
                        <span style={{ color: '#666' }}>{technique.progress || 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Journal Section */}
            {reportOptions.includeJournal && reportData.journal.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  color: '#0AB196',
                  marginBottom: '1rem',
                  borderBottom: '2px solid #0AB196',
                  paddingBottom: '0.5rem'
                }}>
                  Journal
                </h2>
                
                <div style={{ 
                  backgroundColor: '#f8f9fa',
                  borderRadius: '10px',
                  padding: '1rem',
                  border: '1px solid #e9ecef'
                }}>
                  {reportData.journal
                    .filter(entry => {
                      // Filter entries by date range
                      const entryDate = new Date(entry.date);
                      const startDate = new Date(reportOptions.startDate);
                      const endDate = new Date(reportOptions.endDate);
                      return entryDate >= startDate && entryDate <= endDate;
                    })
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map(entry => (
                      <div 
                        key={entry.id}
                        style={{
                          marginBottom: '1.5rem',
                          padding: '1rem',
                          backgroundColor: 'white',
                          borderRadius: '5px',
                          border: '1px solid #e9ecef'
                        }}
                      >
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.5rem'
                        }}>
                          <h3>{entry.title}</h3>
                          <div style={{ color: '#666' }}>{formatDate(entry.date)}</div>
                        </div>
                        
                        {reportOptions.includeDetails && entry.content && (
                          <p style={{ color: '#666' }}>{entry.content}</p>
                        )}
                        
                        {entry.mood && (
                          <div style={{ 
                            marginTop: '0.5rem',
                            color: '#666',
                            fontSize: '0.9rem'
                          }}>
                            Mood: {entry.mood}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
