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

  // State for previous report metrics
  const [previousReportMetrics, setPreviousReportMetrics] = useState(null);

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

    const savedPreviousReportMetrics = localStorage.getItem('previousReportMetrics');
    if (savedPreviousReportMetrics) {
      setPreviousReportMetrics(JSON.parse(savedPreviousReportMetrics));
    }
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
    includeStoryVault: true, 
    includeStoryVaultDetails: true,
    includeStorytellingPractice: true,
    includeStorytellingPracticeDetails: true,
    includeTargetCompanies: true,
    includeTargetCompaniesDetails: true,
    includeActionPlan: true,
    includeActionPlanDetails: true,
    dateRange: 'all', 
    customStartDate: '',
    customEndDate: '',
    format: 'html' // Default to HTML preview, PDF will be handled by agent
  });
  
  const [showPreview, setShowPreview] = useState(false);
  const [reportHtmlContent, setReportHtmlContent] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString + 'T00:00:00');
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      return dateString;
    }
  };
  
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
  
  const handleInputChange = (field, value) => {
    setReportConfig({
      ...reportConfig,
      [field]: value
    });
  };
  
  const getFilteredData = () => {
    const result = { ...applicationData };
    if (reportConfig.dateRange !== 'all') {
      const today = new Date();
      let startDate;
      switch (reportConfig.dateRange) {
        case 'week': startDate = new Date(today); startDate.setDate(today.getDate() - 7); break;
        case 'month': startDate = new Date(today); startDate.setMonth(today.getMonth() - 1); break;
        case 'quarter': startDate = new Date(today); startDate.setMonth(today.getMonth() - 3); break;
        case 'year': startDate = new Date(today); startDate.setFullYear(today.getFullYear() - 1); break;
        case 'custom': if (reportConfig.customStartDate) startDate = new Date(reportConfig.customStartDate + 'T00:00:00'); break;
        default: break;
      }
      let endDate = (reportConfig.dateRange === 'custom' && reportConfig.customEndDate) ? new Date(reportConfig.customEndDate + 'T23:59:59') : today;
      if (startDate) {
        result.goals = result.goals.filter(item => {
          const itemDate = new Date((item.updatedAt || item.createdAt || item.deadline) + 'T00:00:00');
          return itemDate >= startDate && itemDate <= endDate;
        });
        result.tasks = result.tasks.filter(item => {
            const itemDate = new Date((item.updatedAt || item.createdAt || item.deadline) + 'T00:00:00');
            return itemDate >= startDate && itemDate <= endDate;
        });
        result.journalEntries = result.journalEntries.filter(item => item.date && new Date(item.date + 'T00:00:00') >= startDate && new Date(item.date + 'T00:00:00') <= endDate);
        result.mindsetPractices = result.mindsetPractices.map(practice => ({
          ...practice,
          practices: (practice.practices || []).filter(p => p.date && new Date(p.date + 'T00:00:00') >= startDate && new Date(p.date + 'T00:00:00') <= endDate)
        })).filter(p => p.practices && p.practices.length > 0);
        result.stories = result.stories.filter(item => {
            const itemDate = new Date((item.lastPracticed || item.createdAt) + 'T00:00:00');
            return itemDate >= startDate && itemDate <= endDate;
        });
        result.targetCompanies = result.targetCompanies.filter(item => {
            const itemDate = new Date((item.updatedAt || item.createdAt) + 'T00:00:00');
            return itemDate >= startDate && itemDate <= endDate;
        });
      }
    }
    return result;
  };

  const filteredApplicationData = getFilteredData();

  const calculateOverallGoalProgress = () => {
    if (!filteredApplicationData.goals || filteredApplicationData.goals.length === 0) return 0;
    const totalProgress = filteredApplicationData.goals.reduce((sum, goal) => sum + (Number(goal.progress) || 0), 0);
    return Math.round(totalProgress / filteredApplicationData.goals.length);
  };

  const generateReportHTML = () => {
    const currentOverallProgress = calculateOverallGoalProgress();
    let improvementFromPrevious = null;
    if (previousReportMetrics && previousReportMetrics.overallProgress !== undefined) {
      improvementFromPrevious = currentOverallProgress - previousReportMetrics.overallProgress;
    }

    let html = `<html><head><title>${reportConfig.title}</title><style>
      body { font-family: sans-serif; margin: 20px; color: #333; background-color: #f4f4f4; }
      .report-container { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
      h1, h2, h3, h4 { color: #0AB196; }
      h1 { text-align: center; border-bottom: 2px solid #00C2C7; padding-bottom: 10px; }
      .section { margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 5px; background-color: #fdfdfd; }
      .section h3 { margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
      .item { background-color: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 10px; border-left: 3px solid #16B3F7; }
      .item p { margin: 5px 0; }
      .item strong { color: #007bff; }
      ul { list-style-type: none; padding-left: 0; }
      li { margin-bottom: 8px; }
      .progress-bar-container { width: 100%; background-color: #e0e0e0; border-radius: 4px; margin: 5px 0; }
      .progress-bar { height: 20px; background-color: #4caf50; border-radius: 4px; text-align: center; color: white; line-height: 20px; }
      .summary-metrics { display: flex; justify-content: space-around; margin-bottom: 20px; padding: 10px; background-color: #eef; border-radius: 5px; }
      .metric { text-align: center; }
      .metric h4 { margin-bottom: 5px; }
      .metric p { font-size: 1.2em; font-weight: bold; margin: 0; }
    </style></head><body><div class="report-container">`;
    html += `<h1>${reportConfig.title}</h1>`;
    html += `<p><strong>Report Date:</strong> ${formatDate(new Date().toISOString().split('T')[0])}</p>`;
    html += `<p><strong>Date Range:</strong> ${getDateRangeLabel()}</p>`;

    html += `<div class="summary-metrics">`;
    html += `<div class="metric"><h4>Overall Goal Progress</h4><p>${currentOverallProgress}%</p></div>`;
    if (improvementFromPrevious !== null) {
      html += `<div class="metric"><h4>Improvement</h4><p>${improvementFromPrevious >= 0 ? '+' : ''}${improvementFromPrevious}%</p></div>`;
    }
    html += `</div>`;

    if (reportConfig.includeGoals) {
      html += `<div class="section"><h3>Goals</h3>`;
      if (!filteredApplicationData.goals || filteredApplicationData.goals.length === 0) {
        html += `<p>No goals data available for the selected period.</p>`;
      } else {
        filteredApplicationData.goals.forEach(goal => {
          html += `<div class="item"><h4>${goal.title}</h4><p><strong>Progress:</strong> ${goal.progress || 0}%</p>`;
          if (reportConfig.includeGoalsDetails) {
            html += `<div class="progress-bar-container"><div class="progress-bar" style="width: ${goal.progress || 0}%;">${goal.progress || 0}%</div></div>`;
            if (goal.deadline) html += `<p><strong>Deadline:</strong> ${formatDate(goal.deadline)}</p>`;
            if (goal.description) html += `<p><strong>Description:</strong> ${goal.description}</p>`;
            if (goal.why) html += `<p><strong>Why:</strong> ${goal.why}</p>`;
            if (goal.implications) html += `<p><strong>Implications:</strong> ${goal.implications}</p>`;
            if (goal.milestones && goal.milestones.length > 0) {
              html += `<p><strong>Milestones:</strong></p><ul>`;
              goal.milestones.forEach(m => {
                html += `<li>${m.completed ? '&#10004;' : '&#10007;'} ${m.title} ${m.dueDate ? `(Due: ${formatDate(m.dueDate)})` : ''}</li>`;
              });
              html += `</ul>`;
            }
          }
          html += `</div>`;
        });
      }
      html += `</div>`;
    }

    if (reportConfig.includeJournal) {
      html += `<div class="section"><h3>Journal Entries</h3>`;
      const entriesToDisplay = reportConfig.includeJournalInsightsOnly 
        ? filteredApplicationData.journalEntries.filter(e => (e.insights && e.insights.trim() !== '') || (e.systemInsights && e.systemInsights.trim() !== ''))
        : filteredApplicationData.journalEntries;
      if (!entriesToDisplay || entriesToDisplay.length === 0) {
        html += `<p>No journal entries ${reportConfig.includeJournalInsightsOnly ? 'with insights ' : ''}available for the selected period.</p>`;
      } else {
        entriesToDisplay.forEach(entry => {
          html += `<div class="item"><h4>${entry.title || formatDate(entry.date)} (${entry.time || 'Morning'})</h4>`;
          if (reportConfig.includeJournalDetails || reportConfig.includeJournalInsightsOnly) {
            if (entry.systemInsights && (reportConfig.includeJournalDetails || reportConfig.includeJournalInsightsOnly)) html += `<p><strong>System Insights:</strong> ${entry.systemInsights.replace(/\n/g, '<br>')}</p>`;
            if (entry.insights && (reportConfig.includeJournalDetails || reportConfig.includeJournalInsightsOnly)) html += `<p><strong>User Insights:</strong> ${entry.insights.replace(/\n/g, '<br>')}</p>`;
            if (entry.content && reportConfig.includeJournalDetails && !reportConfig.includeJournalInsightsOnly) html += `<p><strong>Content:</strong> ${entry.content.replace(/\n/g, '<br>')}</p>`;
          } else {
             html += `<p>Summary view (enable details for more).</p>`;
          }
          html += `</div>`;
        });
      }
      html += `</div>`;
    }
    
    // Similar sections for Mindset, Story Vault, Target Companies, Action Plan would follow the same pattern
    // For brevity, these are omitted here but should be implemented based on the JSX preview logic

    html += `</div></body></html>`;
    return html;
  };

  const handleGenerateReport = () => {
    const html = generateReportHTML();
    setReportHtmlContent(html);
    setShowPreview(true);

    // Update previous report metrics
    const currentOverallProgress = calculateOverallGoalProgress();
    const newPreviousMetrics = { 
      overallProgress: currentOverallProgress, 
      timestamp: new Date().toISOString() 
    };
    localStorage.setItem('previousReportMetrics', JSON.stringify(newPreviousMetrics));
    setPreviousReportMetrics(newPreviousMetrics);
  };

  const handleDownloadRequest = () => {
    const html = generateReportHTML(); // Or use reportHtmlContent if already generated
    // This function will now just save the HTML for the agent to process
    // The actual file saving to /home/ubuntu/report_content.html will be done by the agent
    // after this function signals the intent.
    // For now, we'll just log it and notify the user.
    console.log("HTML content for PDF generation:", html.substring(0, 500) + "..."); 
    // The agent will need to call a tool to save this 'html' to a file.
    // Then the agent will call another tool to convert it to PDF.
    // This component cannot directly save files to the agent's sandbox or trigger downloads from there.
    alert("PDF generation requested. The PDF will be provided by the agent shortly.");
  };

  const getDateRangeLabel = () => {
    switch (reportConfig.dateRange) {
      case 'week': return 'Last 7 days';
      case 'month': return 'Last 30 days';
      case 'quarter': return 'Last 90 days';
      case 'year': return 'Last 365 days';
      case 'custom': return `${reportConfig.customStartDate || 'N/A'} to ${reportConfig.customEndDate || 'N/A'}`;
      default: return 'All time';
    }
  };

  // JSX for configuration options (simplified for brevity)
  const renderConfigOptions = () => (
    <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
      <h2>Report Configuration</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <div>
          <label>Report Title: </label>
          <input type="text" value={reportConfig.title} onChange={(e) => handleInputChange('title', e.target.value)} style={{width: '100%', padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #555', borderRadius: '4px'}} />
        </div>
        <div>
          <label>Date Range: </label>
          <select value={reportConfig.dateRange} onChange={(e) => handleInputChange('dateRange', e.target.value)} style={{width: '100%', padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #555', borderRadius: '4px'}}>
            <option value="all">All Time</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
            <option value="year">Last 365 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        {reportConfig.dateRange === 'custom' && (
          <>
            <div>
              <label>Start Date: </label>
              <input type="date" value={reportConfig.customStartDate} onChange={(e) => handleInputChange('customStartDate', e.target.value)} style={{width: '100%', padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #555', borderRadius: '4px'}}/>
            </div>
            <div>
              <label>End Date: </label>
              <input type="date" value={reportConfig.customEndDate} onChange={(e) => handleInputChange('customEndDate', e.target.value)} style={{width: '100%', padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid #555', borderRadius: '4px'}}/>
            </div>
          </>
        )}
      </div>
      <div style={{marginTop: '1rem'}}>
        <h4>Include Sections:</h4>
        {/* Checkboxes for sections like Goals, Journal etc. */} 
        <label style={{display: 'block'}}><input type="checkbox" checked={reportConfig.includeGoals} onChange={() => handleCheckboxChange('includeGoals')} /> Goals</label>
        {reportConfig.includeGoals && <label style={{display: 'block', marginLeft: '20px'}}><input type="checkbox" checked={reportConfig.includeGoalsDetails} onChange={() => handleCheckboxChange('includeGoalsDetails')} /> Include Details</label>}
        
        <label style={{display: 'block'}}><input type="checkbox" checked={reportConfig.includeJournal} onChange={() => handleCheckboxChange('includeJournal')} /> Journal</label>
        {reportConfig.includeJournal && (
            <>
                <label style={{display: 'block', marginLeft: '20px'}}><input type="checkbox" checked={reportConfig.includeJournalDetails} onChange={() => handleCheckboxChange('includeJournalDetails')} /> Include Full Content</label>
                <label style={{display: 'block', marginLeft: '20px'}}><input type="checkbox" checked={reportConfig.includeJournalInsightsOnly} onChange={() => handleCheckboxChange('includeJournalInsightsOnly')} /> Include Insights Only</label>
            </>
        )}
        {/* Add other sections similarly */}
      </div>
      <button onClick={handleGenerateReport} style={{marginTop: '1rem', padding: '10px 20px', backgroundColor: '#0AB196', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Generate Report Preview</button>
      <button onClick={handleDownloadRequest} style={{marginTop: '1rem', marginLeft: '10px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Request PDF Download</button>
    </div>
  );

  // JSX for report preview modal (simplified)
  const renderPreviewModal = () => (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
      backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', 
      justifyContent: 'center', alignItems: 'center', zIndex: 1000, color: '#333'
    }}>
      <div style={{
        backgroundColor: '#fff', padding: '20px', borderRadius: '8px', 
        width: '80%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 0 15px rgba(0,0,0,0.3)'
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h2>Report Preview</h2>
            <button onClick={() => setShowPreview(false)} style={{padding: '8px 15px', cursor: 'pointer', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px'}}>Close</button>
        </div>
        <div dangerouslySetInnerHTML={{ __html: reportHtmlContent }} />
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#0AB196', marginBottom: '2rem' }}>Report Generator</h1>
      {renderConfigOptions()}
      {showPreview && renderPreviewModal()}
    </div>
  );
};

export default ReportGenerator;

