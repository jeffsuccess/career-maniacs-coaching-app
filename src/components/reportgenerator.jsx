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
  
  // Download PDF report using html2canvas and jsPDF
  const downloadPDF = async () => {
    if (!reportRef.current) {
      alert('Please generate a report preview first');
      return;
    }
    
    try {
      // Set generating state
      setPdfGenerating(true);
      setPdfError(null);
      setPdfSuccess(false);
      
      // Create overlay with loading message
      const overlay = document.createElement('div');
      overlay.id = 'pdf-generation-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      overlay.style.zIndex = '9999';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      overlay.style.color = 'white';
      overlay.style.fontSize = '20px';
      overlay.style.fontWeight = 'bold';
      overlay.innerHTML = '<div>Generating PDF... Please wait.</div>';
      document.body.appendChild(overlay);
      
      // Wait a moment to ensure the overlay is displayed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create a new jsPDF instance
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Get the report element
      const reportElement = reportRef.current;
      
      // Get the width and height of the report element
      const reportWidth = reportElement.offsetWidth;
      const reportHeight = reportElement.offsetHeight;
      
      // Calculate the number of pages needed
      const a4Width = 210; // mm
      const a4Height = 297; // mm
      const margin = 10; // mm
      const contentWidth = a4Width - (margin * 2);
      const contentHeight = a4Height - (margin * 2);
      
      // Scale factor to fit content width to PDF width
      const scaleFactor = contentWidth / reportWidth;
      
      // Calculate the scaled height
      const scaledHeight = reportHeight * scaleFactor;
      
      // Calculate the number of pages needed
      const pageCount = Math.ceil(scaledHeight / contentHeight);
      
      // Update overlay with progress information
      overlay.innerHTML = `<div>Generating PDF... Page 1 of ${pageCount}</div>`;
      
      // Function to capture a specific part of the report
      const captureSection = async (startY, endY) => {
        // Create a clone of the report element to avoid modifying the original
        const clone = reportElement.cloneNode(true);
        document.body.appendChild(clone);
        
        // Set the clone's position to absolute and hide overflow
        clone.style.position = 'absolute';
        clone.style.top = '0';
        clone.style.left = '0';
        clone.style.width = `${reportWidth}px`;
        clone.style.height = `${reportHeight}px`;
        clone.style.overflow = 'hidden';
        clone.style.zIndex = '-9999';
        clone.style.opacity = '0';
        
        // Create a container div to clip the content
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = `${reportWidth}px`;
        container.style.height = `${endY - startY}px`;
        container.style.overflow = 'hidden';
        
        // Clone the report element again for the container
        const innerClone = reportElement.cloneNode(true);
        innerClone.style.position = 'absolute';
        innerClone.style.top = `${-startY}px`;
        innerClone.style.left = '0';
        
        // Append the inner clone to the container
        container.appendChild(innerClone);
        
        // Append the container to the body
        document.body.appendChild(container);
        
        // Capture the container as an image
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        });
        
        // Remove the clones from the DOM
        document.body.removeChild(clone);
        document.body.removeChild(container);
        
        return canvas;
      };
      
      // Process each page
      for (let i = 0; i < pageCount; i++) {
        // Calculate the start and end positions for this page
        const startY = i * (contentHeight / scaleFactor);
        const endY = Math.min((i + 1) * (contentHeight / scaleFactor), reportHeight);
        
        // Update overlay with progress information
        overlay.innerHTML = `<div>Generating PDF... Page ${i + 1} of ${pageCount}</div>`;
        
        // Capture this section of the report
        const canvas = await captureSection(startY, endY);
        
        // Convert the canvas to an image
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        // Add a new page if this is not the first page
        if (i > 0) {
          pdf.addPage();
        }
        
        // Add the image to the PDF
        pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, (endY - startY) * scaleFactor);
        
        // Give the browser a moment to breathe
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Update overlay with completion message
      overlay.innerHTML = '<div>PDF generated successfully! Downloading...</div>';
      
      // Save the PDF
      pdf.save('career_maniacs_report.pdf');
      
      // Remove the overlay after a short delay
      setTimeout(() => {
        document.body.removeChild(overlay);
        setPdfGenerating(false);
        setPdfSuccess(true);
        
        // Reset success message after a few seconds
        setTimeout(() => {
          setPdfSuccess(false);
        }, 3000);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Remove the overlay if it exists
      const overlay = document.getElementById('pdf-generation-overlay');
      if (overlay) {
        document.body.removeChild(overlay);
      }
      
      setPdfError(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
      setPdfGenerating(false);
      
      // Show a more detailed error message to the user
      alert(`There was an error generating the PDF: ${error.message || 'Unknown error'}. Please try again or contact support if the issue persists.`);
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
        <div className="report-preview-container">
          <div className="report-actions" style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
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
            
            <button 
              onClick={downloadPDF}
              disabled={pdfGenerating}
              style={{
                background: pdfGenerating ? 'rgba(255,255,255,0.1)' : 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                border: 'none',
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
              {pdfGenerating ? 'Generating PDF...' : 'Download PDF'}
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
            className="report-preview" 
            style={{ 
              backgroundColor: 'white', 
              color: '#333',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="report-header" style={{ marginBottom: '2rem' }}>
              <h1 style={{ 
                color: '#0AB196',
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}>
                Career Maniacs Progress Report
              </h1>
              
              <p style={{ 
                textAlign: 'center',
                color: '#666',
                marginBottom: '1rem'
              }}>
                {formatDate(reportOptions.startDate)} - {formatDate(reportOptions.endDate)}
              </p>
              
              <div style={{ 
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <div style={{ 
                  width: '150px',
                  height: '150px',
                  position: 'relative',
                  borderRadius: '50%',
                  background: `conic-gradient(#0AB196 ${calculateOverallProgress()}%, #f0f0f0 0)`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <div style={{ 
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column'
                  }}>
                    <div style={{ 
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#0AB196'
                    }}>
                      {calculateOverallProgress()}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      Overall Progress
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Improvement from Previous Report */}
              {shouldShowImprovement() && (
                <div style={{ 
                  backgroundColor: calculateImprovement() > 0 ? 'rgba(40,167,69,0.1)' : 
                                  calculateImprovement() < 0 ? 'rgba(220,53,69,0.1)' : 
                                  'rgba(108,117,125,0.1)',
                  padding: '1rem',
                  borderRadius: '5px',
                  marginBottom: '1.5rem',
                  textAlign: 'center'
                }}>
                  <h3 style={{ 
                    color: calculateImprovement() > 0 ? '#28a745' : 
                           calculateImprovement() < 0 ? '#dc3545' : 
                           '#6c757d',
                    marginBottom: '0.5rem'
                  }}>
                    Improvement from Previous Report: {getImprovementText()}
                  </h3>
                  <p>{getImprovementDescription()}</p>
                </div>
              )}
            </div>
            
            {/* Goals Section */}
            {reportOptions.includeGoals && reportData.goals.length > 0 && (
              <div className="report-section" style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  color: '#0AB196',
                  borderBottom: '2px solid #0AB196',
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  Goals
                </h2>
                
                <div className="goals-list">
                  {reportData.goals.map((goal, index) => (
                    <div 
                      key={goal.id || index}
                      style={{ 
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '5px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <h3 style={{ margin: 0 }}>{goal.title}</h3>
                        <div style={{ 
                          backgroundColor: '#0AB196',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem'
                        }}>
                          {goal.progress || 0}%
                        </div>
                      </div>
                      
                      <div style={{ 
                        height: '8px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{ 
                          height: '100%',
                          width: `${goal.progress || 0}%`,
                          backgroundColor: '#0AB196',
                          borderRadius: '4px'
                        }}></div>
                      </div>
                      
                      {reportOptions.includeDetails && (
                        <>
                          <p style={{ marginBottom: '0.5rem' }}>{goal.description}</p>
                          <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.8rem',
                            color: '#666'
                          }}>
                            <span>Target Date: {formatDate(goal.targetDate)}</span>
                            <span>Priority: {goal.priority}</span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Action Plan Section */}
            {reportOptions.includeActionPlan && reportData.actionPlan.length > 0 && (
              <div className="report-section" style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  color: '#0AB196',
                  borderBottom: '2px solid #0AB196',
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  Action Plan
                </h2>
                
                <div className="action-plan-list">
                  <table style={{ 
                    width: '100%',
                    borderCollapse: 'collapse'
                  }}>
                    <thead>
                      <tr style={{ 
                        backgroundColor: '#f0f0f0',
                        textAlign: 'left'
                      }}>
                        <th style={{ padding: '0.75rem' }}>Task</th>
                        <th style={{ padding: '0.75rem' }}>Due Date</th>
                        <th style={{ padding: '0.75rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.actionPlan.map((task, index) => (
                        <tr 
                          key={task.id || index}
                          style={{ 
                            borderBottom: '1px solid #e9ecef'
                          }}
                        >
                          <td style={{ 
                            padding: '0.75rem',
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? '#6c757d' : 'inherit'
                          }}>
                            {task.title}
                            {reportOptions.includeDetails && task.description && (
                              <div style={{ 
                                fontSize: '0.8rem',
                                color: '#666',
                                marginTop: '0.25rem'
                              }}>
                                {task.description}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem' }}>{formatDate(task.dueDate)}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{ 
                              backgroundColor: task.completed ? '#28a745' : '#ffc107',
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '20px',
                              fontSize: '0.8rem'
                            }}>
                              {task.completed ? 'Completed' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Target Companies Section */}
            {reportOptions.includeTargetCompanies && reportData.targetCompanies.length > 0 && (
              <div className="report-section" style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  color: '#0AB196',
                  borderBottom: '2px solid #0AB196',
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  Target Companies
                </h2>
                
                <div className="companies-list">
                  <table style={{ 
                    width: '100%',
                    borderCollapse: 'collapse'
                  }}>
                    <thead>
                      <tr style={{ 
                        backgroundColor: '#f0f0f0',
                        textAlign: 'left'
                      }}>
                        <th style={{ padding: '0.75rem' }}>Company</th>
                        <th style={{ padding: '0.75rem' }}>Position</th>
                        <th style={{ padding: '0.75rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.targetCompanies.map((company, index) => (
                        <tr 
                          key={company.id || index}
                          style={{ 
                            borderBottom: '1px solid #e9ecef'
                          }}
                        >
                          <td style={{ padding: '0.75rem' }}>
                            {company.name}
                            {reportOptions.includeDetails && company.notes && (
                              <div style={{ 
                                fontSize: '0.8rem',
                                color: '#666',
                                marginTop: '0.25rem'
                              }}>
                                {company.notes}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem' }}>{company.position}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{ 
                              backgroundColor: 
                                company.status === 'Accepted' ? '#28a745' :
                                company.status === 'Offer Received' ? '#20c997' :
                                company.status === 'Interview Completed' ? '#17a2b8' :
                                company.status === 'Interview Scheduled' ? '#6f42c1' :
                                company.status === 'Applied' ? '#fd7e14' :
                                company.status === 'Rejected' ? '#dc3545' :
                                '#6c757d',
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '20px',
                              fontSize: '0.8rem'
                            }}>
                              {company.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Stories Section */}
            {reportOptions.includeStories && reportData.stories.length > 0 && (
              <div className="report-section" style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  color: '#0AB196',
                  borderBottom: '2px solid #0AB196',
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  Stories
                </h2>
                
                <div className="stories-list">
                  {reportData.stories.map((story, index) => (
                    <div 
                      key={story.id || index}
                      style={{ 
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '5px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <h3 style={{ margin: 0 }}>{story.title}</h3>
                        <div style={{ 
                          backgroundColor: '#0AB196',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem'
                        }}>
                          {story.category}
                        </div>
                      </div>
                      
                      {reportOptions.includeDetails && (
                        <>
                          <p style={{ marginBottom: '0.5rem' }}>{story.content}</p>
                          <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.8rem',
                            color: '#666'
                          }}>
                            <span>Created: {formatDate(story.createdAt)}</span>
                            <span>Practice Count: {story.practiceCount || 0}</span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Mindset Techniques Section */}
            {reportOptions.includeMindsetTechniques && reportData.mindsetTechniques.length > 0 && (
              <div className="report-section" style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  color: '#0AB196',
                  borderBottom: '2px solid #0AB196',
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  Mindset Techniques
                </h2>
                
                <div className="techniques-list">
                  {reportData.mindsetTechniques.map((technique, index) => (
                    <div 
                      key={technique.id || index}
                      style={{ 
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '5px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <h3 style={{ margin: 0 }}>{technique.title}</h3>
                        <div style={{ 
                          backgroundColor: '#0AB196',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem'
                        }}>
                          {technique.category}
                        </div>
                      </div>
                      
                      {reportOptions.includeDetails && (
                        <p style={{ marginBottom: '0.5rem' }}>{technique.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Journal Section */}
            {reportOptions.includeJournal && reportData.journal.length > 0 && (
              <div className="report-section" style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  color: '#0AB196',
                  borderBottom: '2px solid #0AB196',
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  Journal
                </h2>
                
                <div className="journal-list">
                  {reportData.journal
                    .filter(entry => {
                      // Filter entries by date range
                      const entryDate = new Date(entry.date);
                      const startDate = new Date(reportOptions.startDate);
                      const endDate = new Date(reportOptions.endDate);
                      return entryDate >= startDate && entryDate <= endDate;
                    })
                    .map((entry, index) => (
                      <div 
                        key={entry.id || index}
                        style={{ 
                          marginBottom: '1.5rem',
                          padding: '1rem',
                          backgroundColor: '#f9f9f9',
                          borderRadius: '5px',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.5rem'
                        }}>
                          <h3 style={{ margin: 0 }}>{formatDate(entry.date)}</h3>
                          <div style={{ 
                            backgroundColor: '#0AB196',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem'
                          }}>
                            Mood: {entry.mood || 'N/A'}
                          </div>
                        </div>
                        
                        {reportOptions.includeDetails && (
                          <p style={{ marginBottom: '0.5rem' }}>{entry.content}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            <div className="report-footer" style={{ 
              marginTop: '2rem',
              textAlign: 'center',
              color: '#666',
              fontSize: '0.8rem'
            }}>
              <p>Generated on {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              <p>Career Maniacs Coaching Platform</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
