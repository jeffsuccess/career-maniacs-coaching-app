import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';

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
  
  // Download PDF report - COMPLETELY REWRITTEN FOR RELIABILITY
  const downloadPDF = () => {
    console.log("Download PDF button clicked");
    
    // Show visual feedback immediately
    setPdfGenerating(true);
    setPdfError(null);
    setPdfSuccess(false);
    
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Set title
      doc.setFontSize(22);
      doc.setTextColor(10, 177, 150);
      doc.text("Career Maniacs Report", 105, 20, { align: "center" });
      
      // Set date range
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Report Period: ${formatDate(reportOptions.startDate)} to ${formatDate(reportOptions.endDate)}`, 105, 30, { align: "center" });
      doc.text(`Generated on: ${formatDate(new Date().toISOString())}`, 105, 37, { align: "center" });
      
      // Add overall progress
      doc.setFontSize(16);
      doc.text("Overall Progress", 20, 50);
      
      const overallProgress = calculateOverallProgress();
      
      // Draw progress bar
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(10, 177, 150);
      doc.roundedRect(20, 55, 170, 10, 2, 2, 'S');
      doc.roundedRect(20, 55, 170 * (overallProgress / 100), 10, 2, 2, 'F');
      
      // Add progress percentage
      doc.setFontSize(12);
      doc.text(`${overallProgress}%`, 105, 62, { align: "center" });
      
      // Add improvement section if previous data exists
      let yPosition = 75;
      if (previousReportData) {
        const improvement = calculateImprovement();
        
        doc.setFontSize(16);
        doc.text("Progress Since Last Report", 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(14);
        if (improvement > 0) {
          doc.setTextColor(0, 150, 0);
          doc.text(`▲ +${improvement}%`, 20, yPosition);
        } else if (improvement < 0) {
          doc.setTextColor(200, 0, 0);
          doc.text(`▼ ${improvement}%`, 20, yPosition);
        } else {
          doc.setTextColor(100, 100, 100);
          doc.text(`No change (0%)`, 20, yPosition);
        }
        
        yPosition += 10;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(getImprovementDescription(), 20, yPosition);
        
        yPosition += 15;
      }
      
      // Add sections based on options
      if (reportOptions.includeGoals && reportData.goals.length > 0) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(16);
        doc.text("Goals", 20, yPosition);
        yPosition += 10;
        
        reportData.goals.forEach(goal => {
          // Check if we need a new page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(14);
          doc.text(goal.title, 25, yPosition);
          yPosition += 7;
          
          // Progress bar
          doc.setDrawColor(200, 200, 200);
          doc.setFillColor(10, 177, 150);
          doc.roundedRect(25, yPosition, 100, 5, 1, 1, 'S');
          doc.roundedRect(25, yPosition, 100 * ((goal.progress || 0) / 100), 5, 1, 1, 'F');
          
          // Progress percentage
          doc.setFontSize(10);
          doc.text(`${goal.progress || 0}%`, 130, yPosition + 4);
          
          yPosition += 10;
          
          // Description if includeDetails is true
          if (reportOptions.includeDetails && goal.description) {
            doc.setFontSize(10);
            
            // Split long text into multiple lines
            const splitText = doc.splitTextToSize(goal.description, 160);
            doc.text(splitText, 25, yPosition);
            
            yPosition += splitText.length * 5 + 5;
          }
        });
        
        yPosition += 10;
      }
      
      if (reportOptions.includeActionPlan && reportData.actionPlan.length > 0) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(16);
        doc.text("Action Plan", 20, yPosition);
        yPosition += 10;
        
        reportData.actionPlan.forEach(task => {
          // Check if we need a new page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(12);
          const status = task.completed ? "✓" : "○";
          doc.text(`${status} ${task.title}`, 25, yPosition);
          yPosition += 7;
          
          // Due date if available
          if (task.dueDate) {
            doc.setFontSize(10);
            doc.text(`Due: ${formatDate(task.dueDate)}`, 30, yPosition);
            yPosition += 5;
          }
          
          // Description if includeDetails is true
          if (reportOptions.includeDetails && task.description) {
            doc.setFontSize(10);
            
            // Split long text into multiple lines
            const splitText = doc.splitTextToSize(task.description, 160);
            doc.text(splitText, 30, yPosition);
            
            yPosition += splitText.length * 5 + 5;
          } else {
            yPosition += 5;
          }
        });
        
        yPosition += 10;
      }
      
      if (reportOptions.includeTargetCompanies && reportData.targetCompanies.length > 0) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(16);
        doc.text("Target Companies", 20, yPosition);
        yPosition += 10;
        
        reportData.targetCompanies.forEach(company => {
          // Check if we need a new page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(12);
          doc.text(company.name, 25, yPosition);
          yPosition += 7;
          
          // Status with color
          doc.setFontSize(10);
          switch (company.status) {
            case 'Researching':
              doc.setTextColor(255, 193, 7);
              break;
            case 'Applied':
              doc.setTextColor(13, 110, 253);
              break;
            case 'Interview Scheduled':
              doc.setTextColor(32, 201, 151);
              break;
            case 'Interview Completed':
              doc.setTextColor(111, 66, 193);
              break;
            case 'Offer Received':
              doc.setTextColor(25, 135, 84);
              break;
            case 'Accepted':
              doc.setTextColor(20, 200, 150);
              break;
            case 'Rejected':
              doc.setTextColor(220, 53, 69);
              break;
            default:
              doc.setTextColor(108, 117, 125);
          }
          
          doc.text(`Status: ${company.status}`, 30, yPosition);
          doc.setTextColor(0, 0, 0); // Reset to black
          yPosition += 7;
          
          // Notes if includeDetails is true
          if (reportOptions.includeDetails && company.notes) {
            doc.setFontSize(10);
            
            // Split long text into multiple lines
            const splitText = doc.splitTextToSize(company.notes, 160);
            doc.text(splitText, 30, yPosition);
            
            yPosition += splitText.length * 5 + 5;
          } else {
            yPosition += 5;
          }
        });
        
        yPosition += 10;
      }
      
      if (reportOptions.includeStories && reportData.stories.length > 0) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(16);
        doc.text("Stories", 20, yPosition);
        yPosition += 10;
        
        reportData.stories.forEach(story => {
          // Check if we need a new page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(12);
          doc.text(story.title, 25, yPosition);
          yPosition += 7;
          
          // Category
          doc.setFontSize(10);
          doc.text(`Category: ${story.category}`, 30, yPosition);
          yPosition += 7;
          
          // Practice count if available
          if (story.practiceCount) {
            doc.text(`Practiced: ${story.practiceCount} times`, 30, yPosition);
            yPosition += 7;
          }
          
          // Transcript if includeDetails is true
          if (reportOptions.includeDetails && story.transcript) {
            doc.setFontSize(10);
            
            // Split long text into multiple lines
            const splitText = doc.splitTextToSize(story.transcript, 160);
            doc.text(splitText, 30, yPosition);
            
            yPosition += splitText.length * 5 + 5;
          } else {
            yPosition += 5;
          }
        });
        
        yPosition += 10;
      }
      
      if (reportOptions.includeMindsetTechniques && reportData.mindsetTechniques.length > 0) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(16);
        doc.text("Mindset Techniques", 20, yPosition);
        yPosition += 10;
        
        reportData.mindsetTechniques.forEach(technique => {
          // Check if we need a new page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(12);
          doc.text(technique.title, 25, yPosition);
          yPosition += 7;
          
          // Description if includeDetails is true
          if (reportOptions.includeDetails && technique.description) {
            doc.setFontSize(10);
            
            // Split long text into multiple lines
            const splitText = doc.splitTextToSize(technique.description, 160);
            doc.text(splitText, 30, yPosition);
            
            yPosition += splitText.length * 5 + 5;
          } else {
            yPosition += 5;
          }
        });
        
        yPosition += 10;
      }
      
      if (reportOptions.includeJournal && reportData.journal.length > 0) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(16);
        doc.text("Journal Entries", 20, yPosition);
        yPosition += 10;
        
        // Filter journal entries by date range
        const filteredEntries = reportData.journal.filter(entry => {
          if (!entry.date) return false;
          
          const entryDate = new Date(entry.date);
          const startDate = new Date(reportOptions.startDate);
          const endDate = new Date(reportOptions.endDate);
          
          return entryDate >= startDate && entryDate <= endDate;
        });
        
        // Sort by date (newest first)
        filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        filteredEntries.forEach(entry => {
          // Check if we need a new page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(12);
          doc.text(formatDate(entry.date), 25, yPosition);
          yPosition += 7;
          
          // Content
          if (entry.content) {
            doc.setFontSize(10);
            
            // Split long text into multiple lines
            const splitText = doc.splitTextToSize(entry.content, 160);
            doc.text(splitText, 30, yPosition);
            
            yPosition += splitText.length * 5 + 5;
          } else {
            yPosition += 5;
          }
        });
      }
      
      // Save the PDF
      doc.save("career_maniacs_report.pdf");
      
      // Update states
      setPdfGenerating(false);
      setPdfSuccess(true);
      
      // Reset success message after a few seconds
      setTimeout(() => {
        setPdfSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      setPdfGenerating(false);
      setPdfError(`Error: ${error.message || "Unknown error"}`);
      alert(`Failed to generate PDF: ${error.message || "Unknown error"}. Please try again.`);
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
          
          <div className="include-sections" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Include Sections</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={reportOptions.includeGoals}
                    onChange={(e) => handleOptionChange('includeGoals', e.target.checked)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Goals
                </label>
              </div>
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={reportOptions.includeActionPlan}
                    onChange={(e) => handleOptionChange('includeActionPlan', e.target.checked)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Action Plan
                </label>
              </div>
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={reportOptions.includeTargetCompanies}
                    onChange={(e) => handleOptionChange('includeTargetCompanies', e.target.checked)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Target Companies
                </label>
              </div>
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={reportOptions.includeStories}
                    onChange={(e) => handleOptionChange('includeStories', e.target.checked)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Stories
                </label>
              </div>
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={reportOptions.includeMindsetTechniques}
                    onChange={(e) => handleOptionChange('includeMindsetTechniques', e.target.checked)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Mindset Techniques
                </label>
              </div>
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={reportOptions.includeJournal}
                    onChange={(e) => handleOptionChange('includeJournal', e.target.checked)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Journal Entries
                </label>
              </div>
            </div>
          </div>
          
          <div className="include-details" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={reportOptions.includeDetails}
                onChange={(e) => handleOptionChange('includeDetails', e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              Include Details (descriptions, notes, etc.)
            </label>
          </div>
          
          <button
            onClick={generateReport}
            style={{
              backgroundColor: 'rgba(10,177,150,0.2)',
              border: '1px solid rgba(10,177,150,0.5)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            Generate Report
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
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
              ← Back to Options
            </button>
            
            <button
              onClick={downloadPDF}
              disabled={pdfGenerating}
              style={{
                backgroundColor: pdfGenerating ? 'rgba(153,102,255,0.1)' : 'rgba(153,102,255,0.2)',
                border: '1px solid rgba(153,102,255,0.5)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: pdfGenerating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {pdfGenerating ? (
                <>
                  <span className="spinner" style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  Generating PDF...
                </>
              ) : (
                <>
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
          
          {pdfError && (
            <div style={{
              backgroundColor: 'rgba(220,53,69,0.1)',
              border: '1px solid rgba(220,53,69,0.3)',
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
              backgroundColor: 'rgba(25,135,84,0.1)',
              border: '1px solid rgba(25,135,84,0.3)',
              color: '#198754',
              padding: '1rem',
              borderRadius: '5px',
              marginBottom: '1.5rem'
            }}>
              PDF downloaded successfully!
            </div>
          )}
          
          <div
            ref={reportRef}
            className="report-preview"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '2rem',
              borderRadius: '10px'
            }}
          >
            <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Career Maniacs Report</h2>
            <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
              {formatDate(reportOptions.startDate)} to {formatDate(reportOptions.endDate)}
            </p>
            
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Overall Progress</h3>
              <div style={{ 
                width: '100%', 
                height: '20px', 
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
                overflow: 'hidden',
                marginBottom: '0.5rem'
              }}>
                <div style={{ 
                  width: `${calculateOverallProgress()}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                  borderRadius: '10px'
                }} />
              </div>
              <div style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                {calculateOverallProgress()}%
              </div>
            </div>
            
            {/* Progress since last report section - ALWAYS VISIBLE IF PREVIOUS DATA EXISTS */}
            {shouldShowImprovement() && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Progress Since Last Report</h3>
                <div className={getImprovementClass()} style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: calculateImprovement() > 0 ? '#0AB196' : 
                         calculateImprovement() < 0 ? '#dc3545' : 
                         '#6c757d'
                }}>
                  {calculateImprovement() > 0 && <span>▲</span>}
                  {calculateImprovement() < 0 && <span>▼</span>}
                  <span>{getImprovementText()}</span>
                </div>
                <p>{getImprovementDescription()}</p>
              </div>
            )}
            
            {reportOptions.includeGoals && reportData.goals.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Goals</h3>
                {reportData.goals.map((goal, index) => (
                  <div key={index} style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>{goal.title}</h4>
                    <div style={{ 
                      width: '100%', 
                      height: '10px', 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '5px',
                      overflow: 'hidden',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{ 
                        width: `${goal.progress || 0}%`, 
                        height: '100%', 
                        backgroundColor: '#0AB196',
                        borderRadius: '5px'
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Progress: {goal.progress || 0}%</span>
                      {goal.dueDate && <span>Due: {formatDate(goal.dueDate)}</span>}
                    </div>
                    {reportOptions.includeDetails && goal.description && (
                      <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                        {goal.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {reportOptions.includeActionPlan && reportData.actionPlan.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Action Plan</h3>
                {reportData.actionPlan.map((task, index) => (
                  <div key={index} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ 
                        display: 'inline-block',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: task.completed ? '#0AB196' : 'rgba(255,255,255,0.5)',
                        backgroundColor: task.completed ? '#0AB196' : 'transparent',
                        textAlign: 'center',
                        lineHeight: '16px',
                        fontSize: '12px',
                        color: 'white'
                      }}>
                        {task.completed && '✓'}
                      </span>
                      <span style={{ 
                        textDecoration: task.completed ? 'line-through' : 'none',
                        opacity: task.completed ? 0.7 : 1
                      }}>
                        {task.title}
                      </span>
                    </div>
                    {task.dueDate && (
                      <div style={{ marginLeft: '25px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                        Due: {formatDate(task.dueDate)}
                      </div>
                    )}
                    {reportOptions.includeDetails && task.description && (
                      <p style={{ 
                        marginLeft: '25px', 
                        marginTop: '0.5rem', 
                        fontSize: '0.9rem', 
                        color: 'rgba(255,255,255,0.7)',
                        opacity: task.completed ? 0.7 : 1
                      }}>
                        {task.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {reportOptions.includeTargetCompanies && reportData.targetCompanies.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Target Companies</h3>
                {reportData.targetCompanies.map((company, index) => (
                  <div key={index} style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>{company.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        backgroundColor: 
                          company.status === 'Researching' ? 'rgba(255,193,7,0.2)' :
                          company.status === 'Applied' ? 'rgba(13,110,253,0.2)' :
                          company.status === 'Interview Scheduled' ? 'rgba(32,201,151,0.2)' :
                          company.status === 'Interview Completed' ? 'rgba(111,66,193,0.2)' :
                          company.status === 'Offer Received' ? 'rgba(25,135,84,0.2)' :
                          company.status === 'Accepted' ? 'rgba(20,200,150,0.2)' :
                          company.status === 'Rejected' ? 'rgba(220,53,69,0.2)' :
                          'rgba(108,117,125,0.2)',
                        color:
                          company.status === 'Researching' ? '#ffc107' :
                          company.status === 'Applied' ? '#0d6efd' :
                          company.status === 'Interview Scheduled' ? '#20c997' :
                          company.status === 'Interview Completed' ? '#6f42c1' :
                          company.status === 'Offer Received' ? '#198754' :
                          company.status === 'Accepted' ? '#14c896' :
                          company.status === 'Rejected' ? '#dc3545' :
                          '#6c757d'
                      }}>
                        {company.status}
                      </span>
                      {company.lastUpdated && (
                        <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                          Updated: {formatDate(company.lastUpdated)}
                        </span>
                      )}
                    </div>
                    {reportOptions.includeDetails && company.notes && (
                      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                        {company.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {reportOptions.includeStories && reportData.stories.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Stories</h3>
                {reportData.stories.map((story, index) => (
                  <div key={index} style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>{story.title}</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        backgroundColor: 'rgba(153,102,255,0.2)',
                        color: '#9966ff'
                      }}>
                        {story.category}
                      </span>
                      {story.practiceCount > 0 && (
                        <span style={{ 
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                          backgroundColor: 'rgba(10,177,150,0.2)',
                          color: '#0AB196'
                        }}>
                          Practiced {story.practiceCount} times
                        </span>
                      )}
                      {story.lastPracticed && (
                        <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                          Last practiced: {formatDate(story.lastPracticed)}
                        </span>
                      )}
                    </div>
                    {reportOptions.includeDetails && story.transcript && (
                      <div style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        padding: '1rem',
                        borderRadius: '5px',
                        fontSize: '0.9rem',
                        color: 'rgba(255,255,255,0.9)',
                        maxHeight: '200px',
                        overflow: 'auto'
                      }}>
                        {story.transcript}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {reportOptions.includeMindsetTechniques && reportData.mindsetTechniques.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Mindset Techniques</h3>
                {reportData.mindsetTechniques.map((technique, index) => (
                  <div key={index} style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>{technique.title}</h4>
                    {reportOptions.includeDetails && technique.description && (
                      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                        {technique.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {reportOptions.includeJournal && reportData.journal.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Journal Entries</h3>
                {reportData.journal
                  .filter(entry => {
                    if (!entry.date) return false;
                    
                    const entryDate = new Date(entry.date);
                    const startDate = new Date(reportOptions.startDate);
                    const endDate = new Date(reportOptions.endDate);
                    
                    return entryDate >= startDate && entryDate <= endDate;
                  })
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((entry, index) => (
                    <div key={index} style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ marginBottom: '0.5rem' }}>{formatDate(entry.date)}</h4>
                      <div style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        padding: '1rem',
                        borderRadius: '5px',
                        fontSize: '0.9rem',
                        color: 'rgba(255,255,255,0.9)'
                      }}>
                        {entry.content}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ReportGenerator;
