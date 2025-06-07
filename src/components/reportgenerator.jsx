import React, { useState, useEffect } from 'react';
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
  
  // Load data from localStorage on component mount
  useEffect(() => {
    // Load current data
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    const actionPlan = JSON.parse(localStorage.getItem('actionPlan') || '[]');
    const targetCompanies = JSON.parse(localStorage.getItem('targetCompanies') || '[]');
    const stories = JSON.parse(localStorage.getItem('stories') || '[]');
    const mindsetTechniques = JSON.parse(localStorage.getItem('mindsetTechniques') || '[]');
    const journal = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    
    setReportData({
      goals,
      actionPlan,
      targetCompanies,
      stories,
      mindsetTechniques,
      journal
    });
    
    // Load previous report data if available
    const savedPreviousReport = localStorage.getItem('previousReportData');
    if (savedPreviousReport) {
      setPreviousReportData(JSON.parse(savedPreviousReport));
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
    localStorage.setItem('previousReportData', JSON.stringify(reportData));
    
    // Show preview
    setShowPreview(true);
  };
  
  // Download PDF report
  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(10, 177, 150);
      doc.text('Career Maniacs Progress Report', 105, 15, { align: 'center' });
      
      // Add date range
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Report Period: ${formatDate(reportOptions.startDate)} to ${formatDate(reportOptions.endDate)}`, 105, 25, { align: 'center' });
      
      // Add generation date
      doc.text(`Generated on: ${formatDate(new Date().toISOString().split('T')[0])}`, 105, 30, { align: 'center' });
      
      let yPosition = 40;
      
      // Add overall progress
      const overallProgress = calculateOverallProgress();
      doc.setFontSize(16);
      doc.setTextColor(10, 177, 150);
      doc.text('Overall Progress', 14, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`${overallProgress}%`, 14, yPosition);
      
      // Add progress bar
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(200, 200, 200);
      doc.rect(14, yPosition + 5, 180, 5, 'F');
      
      doc.setDrawColor(10, 177, 150);
      doc.setFillColor(10, 177, 150);
      doc.rect(14, yPosition + 5, 180 * (overallProgress / 100), 5, 'F');
      
      yPosition += 15;
      
      // Add improvement from previous report
      if (previousReportData) {
        const previousOverallProgress = calculatePreviousOverallProgress();
        const improvement = overallProgress - previousOverallProgress;
        
        doc.setFontSize(14);
        doc.setTextColor(10, 177, 150);
        doc.text('Improvement from Previous Report', 14, yPosition);
        yPosition += 10;
        
        doc.setFontSize(12);
        if (improvement > 0) {
          doc.setTextColor(10, 177, 150);
          doc.text(`+${improvement.toFixed(1)}%`, 14, yPosition);
        } else if (improvement < 0) {
          doc.setTextColor(255, 100, 100);
          doc.text(`${improvement.toFixed(1)}%`, 14, yPosition);
        } else {
          doc.setTextColor(100, 100, 100);
          doc.text('No change (0%)', 14, yPosition);
        }
        
        yPosition += 15;
      }
      
      // Add sections based on options
      if (reportOptions.includeGoals) {
        yPosition = addGoalsSection(doc, yPosition);
      }
      
      if (reportOptions.includeActionPlan) {
        yPosition = addActionPlanSection(doc, yPosition);
      }
      
      if (reportOptions.includeTargetCompanies) {
        yPosition = addTargetCompaniesSection(doc, yPosition);
      }
      
      if (reportOptions.includeStories) {
        yPosition = addStoriesSection(doc, yPosition);
      }
      
      if (reportOptions.includeMindsetTechniques) {
        yPosition = addMindsetTechniquesSection(doc, yPosition);
      }
      
      if (reportOptions.includeJournal) {
        yPosition = addJournalSection(doc, yPosition);
      }
      
      // Save the PDF
      doc.save('career_maniacs_report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    }
  };
  
  // Add Goals section to PDF
  const addGoalsSection = (doc, yPosition) => {
    // Check if we need to add a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(10, 177, 150);
    doc.text('Goals', 14, yPosition);
    yPosition += 10;
    
    if (reportData.goals.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('No goals have been set yet.', 14, yPosition);
      return yPosition + 15;
    }
    
    if (reportOptions.includeDetails) {
      // Detailed goals information
      reportData.goals.forEach((goal, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${goal.title}`, 14, yPosition);
        yPosition += 7;
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        
        if (goal.deadline) {
          doc.text(`Deadline: ${formatDate(goal.deadline)}`, 20, yPosition);
          yPosition += 7;
        }
        
        doc.text(`Progress: ${goal.progress || 0}%`, 20, yPosition);
        yPosition += 7;
        
        if (goal.description) {
          doc.setTextColor(0, 0, 0);
          const descLines = doc.splitTextToSize(goal.description, 170);
          doc.text(descLines, 20, yPosition);
          yPosition += descLines.length * 7;
        }
        
        if (goal.why) {
          doc.setTextColor(0, 0, 0);
          doc.text('Why:', 20, yPosition);
          yPosition += 7;
          
          doc.setTextColor(100, 100, 100);
          const whyLines = doc.splitTextToSize(goal.why, 170);
          doc.text(whyLines, 25, yPosition);
          yPosition += whyLines.length * 7;
        }
        
        if (goal.implications) {
          doc.setTextColor(0, 0, 0);
          doc.text('Implications:', 20, yPosition);
          yPosition += 7;
          
          doc.setTextColor(100, 100, 100);
          const impLines = doc.splitTextToSize(goal.implications, 170);
          doc.text(impLines, 25, yPosition);
          yPosition += impLines.length * 7;
        }
        
        // Mini Action Plan
        if (goal.miniActionPlan && goal.miniActionPlan.length > 0) {
          doc.setTextColor(0, 0, 0);
          doc.text('Mini Action Plan:', 20, yPosition);
          yPosition += 7;
          
          goal.miniActionPlan.forEach((step, i) => {
            const checkmark = step.completed ? '✓ ' : '□ ';
            const stepText = `${checkmark}${step.text}`;
            const stepLines = doc.splitTextToSize(stepText, 165);
            doc.text(stepLines, 25, yPosition);
            yPosition += stepLines.length * 7;
          });
        }
        
        // Milestones
        if (goal.milestones && goal.milestones.length > 0) {
          doc.setTextColor(0, 0, 0);
          doc.text('Milestones:', 20, yPosition);
          yPosition += 7;
          
          goal.milestones.forEach((milestone, i) => {
            const checkmark = milestone.completed ? '✓ ' : '□ ';
            const milestoneText = `${checkmark}${milestone.title}${milestone.dueDate ? ` (Due: ${formatDate(milestone.dueDate)})` : ''}`;
            const milestoneLines = doc.splitTextToSize(milestoneText, 165);
            doc.text(milestoneLines, 25, yPosition);
            yPosition += milestoneLines.length * 7;
          });
        }
        
        yPosition += 5;
      });
    } else {
      // Summary goals information
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`You have ${reportData.goals.length} goals set.`, 14, yPosition);
      yPosition += 7;
      
      // Calculate average progress
      const totalProgress = reportData.goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
      const avgProgress = reportData.goals.length > 0 ? Math.round(totalProgress / reportData.goals.length) : 0;
      
      doc.text(`Average progress: ${avgProgress}%`, 14, yPosition);
      yPosition += 7;
      
      // Count completed milestones
      const totalMilestones = reportData.goals.reduce((sum, goal) => sum + (goal.milestones?.length || 0), 0);
      const completedMilestones = reportData.goals.reduce((sum, goal) => {
        return sum + (goal.milestones?.filter(m => m.completed)?.length || 0);
      }, 0);
      
      doc.text(`Milestones: ${completedMilestones} completed out of ${totalMilestones} total`, 14, yPosition);
    }
    
    return yPosition + 15;
  };
  
  // Add Action Plan section to PDF
  const addActionPlanSection = (doc, yPosition) => {
    // Check if we need to add a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(10, 177, 150);
    doc.text('Action Plan', 14, yPosition);
    yPosition += 10;
    
    if (reportData.actionPlan.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('No action plan items have been created yet.', 14, yPosition);
      return yPosition + 15;
    }
    
    if (reportOptions.includeDetails) {
      // Detailed action plan information
      const completedTasks = reportData.actionPlan.filter(task => task.completed);
      const pendingTasks = reportData.actionPlan.filter(task => !task.completed);
      
      // Pending tasks
      if (pendingTasks.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Pending Tasks', 14, yPosition);
        yPosition += 7;
        
        pendingTasks.forEach((task, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          
          const taskText = `□ ${task.text}`;
          const taskLines = doc.splitTextToSize(taskText, 180);
          doc.text(taskLines, 14, yPosition);
          yPosition += taskLines.length * 7;
          
          if (task.dueDate) {
            doc.setTextColor(100, 100, 100);
            doc.text(`Due: ${formatDate(task.dueDate)}`, 20, yPosition);
            yPosition += 7;
          }
          
          if (task.notes) {
            doc.setTextColor(100, 100, 100);
            const noteLines = doc.splitTextToSize(task.notes, 170);
            doc.text(noteLines, 20, yPosition);
            yPosition += noteLines.length * 7;
          }
          
          yPosition += 3;
        });
      }
      
      // Completed tasks
      if (completedTasks.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Completed Tasks', 14, yPosition);
        yPosition += 7;
        
        completedTasks.forEach((task, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(12);
          doc.setTextColor(100, 100, 100);
          
          const taskText = `✓ ${task.text}`;
          const taskLines = doc.splitTextToSize(taskText, 180);
          doc.text(taskLines, 14, yPosition);
          yPosition += taskLines.length * 7;
          
          if (task.completedDate) {
            doc.text(`Completed: ${formatDate(task.completedDate)}`, 20, yPosition);
            yPosition += 7;
          }
          
          yPosition += 3;
        });
      }
    } else {
      // Summary action plan information
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      
      const completedTasks = reportData.actionPlan.filter(task => task.completed);
      const pendingTasks = reportData.actionPlan.filter(task => !task.completed);
      
      doc.text(`Total tasks: ${reportData.actionPlan.length}`, 14, yPosition);
      yPosition += 7;
      
      doc.text(`Completed: ${completedTasks.length}`, 14, yPosition);
      yPosition += 7;
      
      doc.text(`Pending: ${pendingTasks.length}`, 14, yPosition);
    }
    
    return yPosition + 15;
  };
  
  // Add Target Companies section to PDF
  const addTargetCompaniesSection = (doc, yPosition) => {
    // Check if we need to add a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(10, 177, 150);
    doc.text('Target Companies', 14, yPosition);
    yPosition += 10;
    
    if (reportData.targetCompanies.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('No target companies have been added yet.', 14, yPosition);
      return yPosition + 15;
    }
    
    if (reportOptions.includeDetails) {
      // Detailed target companies information
      reportData.targetCompanies.forEach((company, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${company.name}`, 14, yPosition);
        yPosition += 7;
        
        doc.setFontSize(12);
        
        if (company.position) {
          doc.text(`Position: ${company.position}`, 20, yPosition);
          yPosition += 7;
        }
        
        if (company.status) {
          doc.text(`Status: ${company.status}`, 20, yPosition);
          yPosition += 7;
        }
        
        if (company.hiringManager) {
          doc.text(`Hiring Manager: ${company.hiringManager}`, 20, yPosition);
          yPosition += 7;
        }
        
        if (company.datePosted) {
          doc.text(`Date Posted: ${formatDate(company.datePosted)}`, 20, yPosition);
          yPosition += 7;
        }
        
        if (company.notes) {
          doc.setTextColor(100, 100, 100);
          const noteLines = doc.splitTextToSize(company.notes, 170);
          doc.text(noteLines, 20, yPosition);
          yPosition += noteLines.length * 7;
        }
        
        if (company.requirements && company.requirements.length > 0) {
          doc.setTextColor(0, 0, 0);
          doc.text('Requirements:', 20, yPosition);
          yPosition += 7;
          
          doc.setTextColor(100, 100, 100);
          company.requirements.forEach((req, i) => {
            const reqLines = doc.splitTextToSize(`• ${req}`, 170);
            doc.text(reqLines, 25, yPosition);
            yPosition += reqLines.length * 7;
          });
        }
        
        yPosition += 5;
      });
    } else {
      // Summary target companies information
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`You are targeting ${reportData.targetCompanies.length} companies.`, 14, yPosition);
      yPosition += 7;
      
      // Count by status
      const statusCounts = {};
      reportData.targetCompanies.forEach(company => {
        if (company.status) {
          statusCounts[company.status] = (statusCounts[company.status] || 0) + 1;
        }
      });
      
      Object.entries(statusCounts).forEach(([status, count]) => {
        doc.text(`${status}: ${count}`, 20, yPosition);
        yPosition += 7;
      });
    }
    
    return yPosition + 15;
  };
  
  // Add Stories section to PDF
  const addStoriesSection = (doc, yPosition) => {
    // Check if we need to add a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(10, 177, 150);
    doc.text('Stories', 14, yPosition);
    yPosition += 10;
    
    if (reportData.stories.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('No stories have been created yet.', 14, yPosition);
      return yPosition + 15;
    }
    
    if (reportOptions.includeDetails) {
      // Detailed stories information
      reportData.stories.forEach((story, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${story.title}`, 14, yPosition);
        yPosition += 7;
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Category: ${story.category}`, 20, yPosition);
        yPosition += 7;
        
        if (story.practiceCount) {
          doc.text(`Practiced: ${story.practiceCount} times`, 20, yPosition);
          yPosition += 7;
        }
        
        if (story.lastPracticed) {
          doc.text(`Last practiced: ${formatDate(story.lastPracticed)}`, 20, yPosition);
          yPosition += 7;
        }
        
        if (story.content) {
          doc.setTextColor(0, 0, 0);
          doc.text('Content:', 20, yPosition);
          yPosition += 7;
          
          doc.setTextColor(100, 100, 100);
          const contentLines = doc.splitTextToSize(story.content, 170);
          doc.text(contentLines, 25, yPosition);
          yPosition += contentLines.length * 7;
        }
        
        yPosition += 5;
      });
    } else {
      // Summary stories information
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`You have created ${reportData.stories.length} stories.`, 14, yPosition);
      yPosition += 7;
      
      // Count by category
      const categoryCounts = {};
      reportData.stories.forEach(story => {
        if (story.category) {
          categoryCounts[story.category] = (categoryCounts[story.category] || 0) + 1;
        }
      });
      
      Object.entries(categoryCounts).forEach(([category, count]) => {
        doc.text(`${category}: ${count}`, 20, yPosition);
        yPosition += 7;
      });
      
      // Total practice count
      const totalPracticeCount = reportData.stories.reduce((sum, story) => sum + (story.practiceCount || 0), 0);
      doc.text(`Total practice sessions: ${totalPracticeCount}`, 14, yPosition);
    }
    
    return yPosition + 15;
  };
  
  // Add Mindset Techniques section to PDF
  const addMindsetTechniquesSection = (doc, yPosition) => {
    // Check if we need to add a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(10, 177, 150);
    doc.text('Mindset Techniques', 14, yPosition);
    yPosition += 10;
    
    if (reportData.mindsetTechniques.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('No mindset techniques have been practiced yet.', 14, yPosition);
      return yPosition + 15;
    }
    
    if (reportOptions.includeDetails) {
      // Detailed mindset techniques information
      reportData.mindsetTechniques.forEach((technique, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${technique.name}`, 14, yPosition);
        yPosition += 7;
        
        doc.setFontSize(12);
        
        if (technique.practices && technique.practices.length > 0) {
          doc.text(`Practice sessions: ${technique.practices.length}`, 20, yPosition);
          yPosition += 7;
          
          technique.practices.forEach((practice, i) => {
            if (yPosition > 250) {
              doc.addPage();
              yPosition = 20;
            }
            
            doc.setTextColor(100, 100, 100);
            doc.text(`Session ${i + 1}: ${formatDate(practice.date)}`, 25, yPosition);
            yPosition += 7;
            
            if (practice.notes) {
              const noteLines = doc.splitTextToSize(practice.notes, 165);
              doc.text(noteLines, 30, yPosition);
              yPosition += noteLines.length * 7;
            }
          });
        }
        
        yPosition += 5;
      });
    } else {
      // Summary mindset techniques information
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`You have practiced ${reportData.mindsetTechniques.length} mindset techniques.`, 14, yPosition);
      yPosition += 7;
      
      // Total practice sessions
      const totalPracticeSessions = reportData.mindsetTechniques.reduce((sum, technique) => {
        return sum + (technique.practices?.length || 0);
      }, 0);
      
      doc.text(`Total practice sessions: ${totalPracticeSessions}`, 14, yPosition);
    }
    
    return yPosition + 15;
  };
  
  // Add Journal section to PDF
  const addJournalSection = (doc, yPosition) => {
    // Check if we need to add a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(10, 177, 150);
    doc.text('Journal', 14, yPosition);
    yPosition += 10;
    
    if (reportData.journal.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('No journal entries have been created yet.', 14, yPosition);
      return yPosition + 15;
    }
    
    // Filter journal entries by date range
    const filteredEntries = reportData.journal.filter(entry => {
      if (!entry.date) return false;
      
      const entryDate = new Date(entry.date);
      const startDate = new Date(reportOptions.startDate);
      const endDate = new Date(reportOptions.endDate);
      
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    if (filteredEntries.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('No journal entries found in the selected date range.', 14, yPosition);
      return yPosition + 15;
    }
    
    if (reportOptions.includeDetails) {
      // Detailed journal information
      filteredEntries.forEach((entry, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`${formatDate(entry.date)} - ${entry.title}`, 14, yPosition);
        yPosition += 7;
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Time of day: ${entry.time}`, 20, yPosition);
        yPosition += 7;
        
        if (entry.content) {
          doc.setTextColor(0, 0, 0);
          doc.text('Entry:', 20, yPosition);
          yPosition += 7;
          
          doc.setTextColor(100, 100, 100);
          const contentLines = doc.splitTextToSize(entry.content, 170);
          doc.text(contentLines, 25, yPosition);
          yPosition += contentLines.length * 7;
        }
        
        if (entry.insights) {
          doc.setTextColor(0, 0, 0);
          doc.text('Insights:', 20, yPosition);
          yPosition += 7;
          
          doc.setTextColor(100, 100, 100);
          const insightLines = doc.splitTextToSize(entry.insights, 170);
          doc.text(insightLines, 25, yPosition);
          yPosition += insightLines.length * 7;
        }
        
        yPosition += 5;
      });
    } else {
      // Summary journal information
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`You have ${filteredEntries.length} journal entries in the selected date range.`, 14, yPosition);
      yPosition += 7;
      
      // Count by time of day
      const timeCounts = {
        morning: 0,
        afternoon: 0,
        evening: 0
      };
      
      filteredEntries.forEach(entry => {
        if (entry.time) {
          timeCounts[entry.time] = (timeCounts[entry.time] || 0) + 1;
        }
      });
      
      Object.entries(timeCounts).forEach(([time, count]) => {
        if (count > 0) {
          doc.text(`${time}: ${count}`, 20, yPosition);
          yPosition += 7;
        }
      });
    }
    
    return yPosition + 15;
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
    
    // Action plan progress
    if (reportData.actionPlan.length > 0) {
      const completedTasks = reportData.actionPlan.filter(task => task.completed).length;
      const actionPlanProgress = (completedTasks / reportData.actionPlan.length) * 100;
      totalProgress += actionPlanProgress;
      totalItems += 1;
    }
    
    // Target companies progress
    if (reportData.targetCompanies.length > 0) {
      const appliedCompanies = reportData.targetCompanies.filter(company => 
        company.status === 'Applied' || 
        company.status === 'Interviewing' || 
        company.status === 'Offer'
      ).length;
      
      const targetCompaniesProgress = (appliedCompanies / reportData.targetCompanies.length) * 100;
      totalProgress += targetCompaniesProgress;
      totalItems += 1;
    }
    
    // Stories progress
    if (reportData.stories.length > 0) {
      const practicedStories = reportData.stories.filter(story => story.practiceCount > 0).length;
      const storiesProgress = (practicedStories / reportData.stories.length) * 100;
      totalProgress += storiesProgress;
      totalItems += 1;
    }
    
    return totalItems > 0 ? Math.round(totalProgress / totalItems) : 0;
  };
  
  // Calculate previous overall progress
  const calculatePreviousOverallProgress = () => {
    if (!previousReportData) return 0;
    
    let totalProgress = 0;
    let totalItems = 0;
    
    // Goals progress
    if (previousReportData.goals.length > 0) {
      const goalsProgress = previousReportData.goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
      totalProgress += goalsProgress;
      totalItems += previousReportData.goals.length;
    }
    
    // Action plan progress
    if (previousReportData.actionPlan.length > 0) {
      const completedTasks = previousReportData.actionPlan.filter(task => task.completed).length;
      const actionPlanProgress = (completedTasks / previousReportData.actionPlan.length) * 100;
      totalProgress += actionPlanProgress;
      totalItems += 1;
    }
    
    // Target companies progress
    if (previousReportData.targetCompanies.length > 0) {
      const appliedCompanies = previousReportData.targetCompanies.filter(company => 
        company.status === 'Applied' || 
        company.status === 'Interviewing' || 
        company.status === 'Offer'
      ).length;
      
      const targetCompaniesProgress = (appliedCompanies / previousReportData.targetCompanies.length) * 100;
      totalProgress += targetCompaniesProgress;
      totalItems += 1;
    }
    
    // Stories progress
    if (previousReportData.stories.length > 0) {
      const practicedStories = previousReportData.stories.filter(story => story.practiceCount > 0).length;
      const storiesProgress = (practicedStories / previousReportData.stories.length) * 100;
      totalProgress += storiesProgress;
      totalItems += 1;
    }
    
    return totalItems > 0 ? Math.round(totalProgress / totalItems) : 0;
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ 
        background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: 'bold',
        marginBottom: '1rem'
      }}>
        Report Generator
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <p>Generate comprehensive reports on your career progress and activities.</p>
      </div>
      
      {!showPreview ? (
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px'
        }}>
          <h2>Report Options</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h3>Date Range</h3>
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
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h3>Include Sections</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
          
          <div style={{ marginBottom: '1.5rem' }}>
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
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
              When checked, the report will include detailed information for each section. Otherwise, only summary information will be included.
            </p>
          </div>
          
          <button 
            onClick={generateReport}
            style={{
              background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
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
            marginBottom: '1rem'
          }}>
            <h2>Report Preview</h2>
            <div>
              <button 
                onClick={() => setShowPreview(false)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginRight: '1rem'
                }}
              >
                Back to Options
              </button>
              <button 
                onClick={downloadPDF}
                style={{
                  background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Download PDF
              </button>
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: '1.5rem', 
            borderRadius: '10px',
            marginBottom: '2rem'
          }}>
            <h1 style={{ 
              color: '#0AB196',
              marginBottom: '1rem'
            }}>
              Career Maniacs Progress Report
            </h1>
            
            <div style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.6)' }}>
              <p>Report Period: {formatDate(reportOptions.startDate)} to {formatDate(reportOptions.endDate)}</p>
              <p>Generated on: {formatDate(new Date().toISOString().split('T')[0])}</p>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h2>Overall Progress</h2>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                {calculateOverallProgress()}%
              </div>
              <div style={{ 
                width: '100%', 
                height: '10px', 
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '5px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${calculateOverallProgress()}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                  borderRadius: '5px'
                }} />
              </div>
            </div>
            
            {previousReportData && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h2>Improvement from Previous Report</h2>
                <div style={{ fontSize: '1.2rem' }}>
                  {(() => {
                    const currentProgress = calculateOverallProgress();
                    const previousProgress = calculatePreviousOverallProgress();
                    const improvement = currentProgress - previousProgress;
                    
                    if (improvement > 0) {
                      return <span style={{ color: '#0AB196' }}>+{improvement.toFixed(1)}%</span>;
                    } else if (improvement < 0) {
                      return <span style={{ color: '#FF6464' }}>{improvement.toFixed(1)}%</span>;
                    } else {
                      return <span>No change (0%)</span>;
                    }
                  })()}
                </div>
              </div>
            )}
            
            {/* Section Previews */}
            {reportOptions.includeGoals && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h2>Goals</h2>
                {reportData.goals.length === 0 ? (
                  <p>No goals have been set yet.</p>
                ) : (
                  <div>
                    <p>You have {reportData.goals.length} goals set.</p>
                    {reportOptions.includeDetails && (
                      <div style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)', 
                        padding: '1rem', 
                        borderRadius: '5px',
                        marginTop: '0.5rem'
                      }}>
                        <p>Detailed information will be included in the PDF.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {reportOptions.includeActionPlan && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h2>Action Plan</h2>
                {reportData.actionPlan.length === 0 ? (
                  <p>No action plan items have been created yet.</p>
                ) : (
                  <div>
                    <p>Total tasks: {reportData.actionPlan.length}</p>
                    <p>Completed: {reportData.actionPlan.filter(task => task.completed).length}</p>
                    <p>Pending: {reportData.actionPlan.filter(task => !task.completed).length}</p>
                    {reportOptions.includeDetails && (
                      <div style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)', 
                        padding: '1rem', 
                        borderRadius: '5px',
                        marginTop: '0.5rem'
                      }}>
                        <p>Detailed information will be included in the PDF.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Additional sections would be previewed here */}
            
            <p style={{ marginTop: '2rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.6)' }}>
              Click "Download PDF" to get the complete report with all selected sections.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
