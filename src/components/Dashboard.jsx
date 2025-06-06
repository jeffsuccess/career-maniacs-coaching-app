import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
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

  // Helper function to get today's date in YYYY-MM-DD format with timezone handling
  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate overall goal progress
  const calculateOverallGoalProgress = () => {
    if (!applicationData.goals || applicationData.goals.length === 0) return 0;
    const totalProgress = applicationData.goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
    return Math.round(totalProgress / applicationData.goals.length);
  };

  // Get upcoming tasks (due in the next 7 days)
  const getUpcomingTasks = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return applicationData.tasks
      .filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate + 'T00:00:00');
        return dueDate >= today && dueDate <= nextWeek && !task.completed;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  // Get recent journal entries (last 3)
  const getRecentJournalEntries = () => {
    return [...applicationData.journalEntries]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  };

  // Get recent mindset practices (last 3)
  const getRecentMindsetPractices = () => {
    return [...applicationData.mindsetPractices]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  };

  // Get recent story practices (last 3)
  const getRecentStoryPractices = () => {
    const storiesWithPractice = applicationData.stories
      .filter(story => story.practiceHistory && story.practiceHistory.length > 0)
      .map(story => {
        const latestPractice = [...story.practiceHistory]
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        return {
          storyTitle: story.title,
          ...latestPractice
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
    
    return storiesWithPractice;
  };

  // Get companies with recent activity
  const getActiveCompanies = () => {
    return applicationData.targetCompanies
      .filter(company => company.status !== 'Not Interested' && company.status !== 'Rejected')
      .sort((a, b) => {
        // Sort by status priority
        const statusPriority = {
          'Interview Scheduled': 1,
          'Applied': 2,
          'Offer Received': 3,
          'Interview Completed': 4,
          'Researching': 5
        };
        return (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
      })
      .slice(0, 3);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Offer Received':
        return '#28a745';
      case 'Interview Scheduled':
      case 'Interview Completed':
        return '#17a2b8';
      case 'Applied':
        return '#ffc107';
      case 'Rejected':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  // Format time (seconds) to MM:SS
  const formatTime = (seconds) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
        Dashboard
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <p>Welcome to your Career Maniacs dashboard. Here's an overview of your progress and upcoming activities.</p>
      </div>
      
      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {/* Goals Progress */}
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          borderRadius: '10px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Goals Progress</h2>
            <Link 
              to="/goals"
              style={{
                color: '#16B3F7',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              View All
            </Link>
          </div>
          
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            padding: '1rem', 
            borderRadius: '5px',
            marginBottom: '1rem'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <span>Overall Progress</span>
              <span>{calculateOverallGoalProgress()}%</span>
            </div>
            <div style={{ 
              width: '100%', 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              borderRadius: '10px',
              height: '8px',
              marginBottom: '0.5rem'
            }}>
              <div style={{ 
                width: `${calculateOverallGoalProgress()}%`, 
                backgroundColor: '#0AB196',
                borderRadius: '10px',
                height: '100%'
              }} />
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>
              {applicationData.goals.length} goal{applicationData.goals.length !== 1 ? 's' : ''} in progress
            </p>
          </div>
          
          {applicationData.goals.length > 0 ? (
            applicationData.goals.slice(0, 3).map(goal => (
              <div 
                key={goal.id}
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)', 
                  padding: '1rem', 
                  borderRadius: '5px',
                  marginBottom: '0.5rem'
                }}
              >
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>{goal.title}</strong>
                  {goal.deadline && (
                    <span style={{ fontSize: '0.8rem', opacity: 0.7, marginLeft: '0.5rem' }}>
                      Due: {formatDate(goal.deadline)}
                    </span>
                  )}
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '0.25rem',
                  fontSize: '0.9rem'
                }}>
                  <span>Progress</span>
                  <span>{goal.progress || 0}%</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '10px',
                  height: '6px'
                }}>
                  <div style={{ 
                    width: `${goal.progress || 0}%`, 
                    backgroundColor: '#0AB196',
                    borderRadius: '10px',
                    height: '100%'
                  }} />
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', opacity: 0.7 }}>No goals created yet</p>
          )}
        </div>
        
        {/* Upcoming Tasks */}
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          borderRadius: '10px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Upcoming Tasks</h2>
            <Link 
              to="/action-plan"
              style={{
                color: '#16B3F7',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              View All
            </Link>
          </div>
          
          {getUpcomingTasks().length > 0 ? (
            getUpcomingTasks().map(task => (
              <div 
                key={task.id}
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)', 
                  padding: '1rem', 
                  borderRadius: '5px',
                  marginBottom: '0.5rem'
                }}
              >
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>{task.title}</strong>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '0.9rem',
                  opacity: 0.7
                }}>
                  <span>Due: {formatDate(task.dueDate)}</span>
                  <span>{task.priority || 'Medium'} Priority</span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', opacity: 0.7 }}>No upcoming tasks</p>
          )}
          
          <div style={{ marginTop: '1rem' }}>
            <Link 
              to="/action-plan"
              style={{
                display: 'block',
                backgroundColor: 'rgba(10,177,150,0.2)',
                color: '#0AB196',
                padding: '0.75rem',
                borderRadius: '5px',
                textDecoration: 'none',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            >
              Add New Task
            </Link>
          </div>
        </div>
        
        {/* Recent Journal Entries */}
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          borderRadius: '10px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Recent Journal</h2>
            <Link 
              to="/journal"
              style={{
                color: '#16B3F7',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              View All
            </Link>
          </div>
          
          {getRecentJournalEntries().length > 0 ? (
            getRecentJournalEntries().map((entry, index) => (
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
                  marginBottom: '0.5rem'
                }}>
                  <strong>{entry.title || formatDate(entry.date)}</strong>
                  <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    {entry.time || 'Morning'}
                  </span>
                </div>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.9rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {entry.content}
                </p>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', opacity: 0.7 }}>No journal entries yet</p>
          )}
          
          <div style={{ marginTop: '1rem' }}>
            <Link 
              to="/journal"
              style={{
                display: 'block',
                backgroundColor: 'rgba(10,177,150,0.2)',
                color: '#0AB196',
                padding: '0.75rem',
                borderRadius: '5px',
                textDecoration: 'none',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            >
              Add Journal Entry
            </Link>
          </div>
        </div>
        
        {/* Recent Mindset Practices */}
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          borderRadius: '10px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Mindset Practices</h2>
            <Link 
              to="/mindset"
              style={{
                color: '#16B3F7',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              View All
            </Link>
          </div>
          
          {getRecentMindsetPractices().length > 0 ? (
            getRecentMindsetPractices().map((practice, index) => (
              <div 
                key={index}
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)', 
                  padding: '1rem', 
                  borderRadius: '5px',
                  marginBottom: '0.5rem'
                }}
              >
                <div style={{ marginBottom: '0.25rem' }}>
                  <strong>{practice.technique}</strong>
                </div>
                <div style={{ 
                  fontSize: '0.9rem',
                  opacity: 0.7
                }}>
                  <span>{formatDate(practice.date)}</span>
                </div>
                {practice.notes && (
                  <p style={{ 
                    margin: '0.5rem 0 0 0', 
                    fontSize: '0.9rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {practice.notes}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', opacity: 0.7 }}>No mindset practices recorded yet</p>
          )}
          
          <div style={{ marginTop: '1rem' }}>
            <Link 
              to="/mindset"
              style={{
                display: 'block',
                backgroundColor: 'rgba(10,177,150,0.2)',
                color: '#0AB196',
                padding: '0.75rem',
                borderRadius: '5px',
                textDecoration: 'none',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            >
              Practice Mindset Technique
            </Link>
          </div>
        </div>
        
        {/* Recent Story Practices */}
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          borderRadius: '10px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Storytelling Practice</h2>
            <Link 
              to="/storytelling"
              style={{
                color: '#16B3F7',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              View All
            </Link>
          </div>
          
          {getRecentStoryPractices().length > 0 ? (
            getRecentStoryPractices().map((practice, index) => (
              <div 
                key={index}
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)', 
                  padding: '1rem', 
                  borderRadius: '5px',
                  marginBottom: '0.5rem'
                }}
              >
                <div style={{ marginBottom: '0.25rem' }}>
                  <strong>{practice.storyTitle}</strong>
                </div>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.9rem',
                  opacity: 0.7
                }}>
                  <span>{formatDate(practice.date)}</span>
                  <span>Duration: {formatTime(practice.duration)}</span>
                </div>
                {practice.feedback && (
                  <div style={{ 
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '3px',
                    display: 'inline-block',
                    fontSize: '0.8rem',
                    backgroundColor: practice.feedback === 'excellent' ? 'rgba(40,167,69,0.2)' : 
                                    practice.feedback === 'good' ? 'rgba(23,162,184,0.2)' : 
                                    'rgba(255,193,7,0.2)',
                    color: practice.feedback === 'excellent' ? '#28a745' : 
                           practice.feedback === 'good' ? '#17a2b8' : 
                           '#ffc107'
                  }}>
                    {practice.feedback === 'excellent' ? 'Excellent' : 
                     practice.feedback === 'good' ? 'Good' : 
                     'Needs Work'}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', opacity: 0.7 }}>No story practices recorded yet</p>
          )}
          
          <div style={{ marginTop: '1rem' }}>
            <Link 
              to="/storytelling"
              style={{
                display: 'block',
                backgroundColor: 'rgba(10,177,150,0.2)',
                color: '#0AB196',
                padding: '0.75rem',
                borderRadius: '5px',
                textDecoration: 'none',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            >
              Practice Storytelling
            </Link>
          </div>
        </div>
        
        {/* Target Companies */}
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          borderRadius: '10px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Target Companies</h2>
            <Link 
              to="/companies"
              style={{
                color: '#16B3F7',
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              View All
            </Link>
          </div>
          
          {getActiveCompanies().length > 0 ? (
            getActiveCompanies().map((company, index) => (
              <div 
                key={index}
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.05)', 
                  padding: '1rem', 
                  borderRadius: '5px',
                  marginBottom: '0.5rem'
                }}
              >
                <div style={{ marginBottom: '0.25rem' }}>
                  <strong>{company.name}</strong>
                </div>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.9rem'
                }}>
                  <span style={{ opacity: 0.7 }}>
                    {company.jobDescription ? company.jobDescription.substring(0, 30) + (company.jobDescription.length > 30 ? '...' : '') : 'No job description'}
                  </span>
                  <span style={{ 
                    backgroundColor: `${getStatusColor(company.status)}20`,
                    color: getStatusColor(company.status),
                    padding: '0.1rem 0.5rem',
                    borderRadius: '3px',
                    fontSize: '0.8rem'
                  }}>
                    {company.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', opacity: 0.7 }}>No target companies added yet</p>
          )}
          
          <div style={{ marginTop: '1rem' }}>
            <Link 
              to="/companies"
              style={{
                display: 'block',
                backgroundColor: 'rgba(10,177,150,0.2)',
                color: '#0AB196',
                padding: '0.75rem',
                borderRadius: '5px',
                textDecoration: 'none',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            >
              Add Target Company
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
