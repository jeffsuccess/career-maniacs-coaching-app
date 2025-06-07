import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [stories, setStories] = useState([]);
  const [mindsetPractices, setMindsetPractices] = useState([]);
  const [targetCompanies, setTargetCompanies] = useState([]);
  const [expandedGoalId, setExpandedGoalId] = useState(null);

  useEffect(() => {
    // Load data from localStorage
    const loadedGoals = JSON.parse(localStorage.getItem('goals') || '[]');
    const loadedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const loadedJournalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const loadedStories = JSON.parse(localStorage.getItem('storytellingPracticeStories') || '[]');
    const loadedMindsetPractices = JSON.parse(localStorage.getItem('mindsetTechniques') || '[]');
    const loadedTargetCompanies = JSON.parse(localStorage.getItem('targetCompanies') || '[]');
    
    setGoals(loadedGoals);
    setTasks(loadedTasks);
    setJournalEntries(loadedJournalEntries);
    setStories(loadedStories);
    setMindsetPractices(loadedMindsetPractices);
    setTargetCompanies(loadedTargetCompanies);
  }, []);

  const calculateOverallProgress = () => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
    return Math.round(totalProgress / goals.length);
  };

  const getRecentActivity = () => {
    const allActivities = [
      ...goals.map(goal => ({
        type: 'goal',
        title: goal.title,
        date: goal.updatedAt || goal.createdAt || '',
        action: 'Updated'
      })),
      ...tasks.map(task => ({
        type: 'task',
        title: task.title,
        date: task.updatedAt || task.createdAt || '',
        action: task.status === 'completed' ? 'Completed' : 'Updated'
      })),
      ...journalEntries.map(entry => ({
        type: 'journal',
        title: entry.title || 'Journal Entry',
        date: entry.date || '',
        action: 'Added'
      })),
      ...stories.filter(story => story.practiceHistory && story.practiceHistory.length > 0).map(story => ({
        type: 'story',
        title: story.title,
        date: story.practiceHistory[story.practiceHistory.length - 1].date || '',
        action: 'Practiced'
      }))
    ];
    
    return allActivities
      .filter(activity => activity.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  const getUpcomingDeadlines = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allDeadlines = [
      ...goals.map(goal => ({
        type: 'goal',
        title: goal.title,
        deadline: goal.deadline || '',
        progress: goal.progress || 0
      })),
      ...tasks.map(task => ({
        type: 'task',
        title: task.title,
        deadline: task.deadline || '',
        progress: task.progress || 0
      }))
    ];
    
    return allDeadlines
      .filter(item => {
        if (!item.deadline) return false;
        const deadlineDate = new Date(item.deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        return deadlineDate >= today && item.progress < 100;
      })
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (deadline, progress) => {
    if (progress === 100) return '#28a745';
    const daysRemaining = getDaysRemaining(deadline);
    if (daysRemaining === null) return '#6c757d';
    if (daysRemaining < 0) return '#dc3545';
    if (daysRemaining < 7) return '#ffc107';
    return '#17a2b8';
  };

  const toggleMiniActionPlan = (goalId) => {
    setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#0AB196', marginBottom: '2rem' }}>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Overall Progress Card */}
        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          <h3 style={{ marginTop: 0, color: '#0AB196' }}>Overall Progress</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ position: 'relative', width: '150px', height: '150px' }}>
              <svg width="150" height="150" viewBox="0 0 150 150">
                <circle
                  cx="75"
                  cy="75"
                  r="65"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="10"
                />
                <circle
                  cx="75"
                  cy="75"
                  r="65"
                  fill="none"
                  stroke="#0AB196"
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 65 * calculateOverallProgress() / 100} ${2 * Math.PI * 65}`}
                  strokeDashoffset={2 * Math.PI * 65 * 0.25}
                  transform="rotate(-90 75 75)"
                />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '2rem', fontWeight: 'bold' }}>
                {calculateOverallProgress()}%
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigateTo('/goals')} 
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              backgroundColor: 'rgba(10,177,150,0.2)', 
              color: '#0AB196', 
              border: '1px solid #0AB196', 
              borderRadius: '5px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            View All Goals
          </button>
        </div>
        
        {/* Recent Activity Card */}
        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          <h3 style={{ marginTop: 0, color: '#0AB196' }}>Recent Activity</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {getRecentActivity().map((activity, index) => (
              <li key={index} style={{ marginBottom: '0.75rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold' }}>{activity.action} {activity.type}</span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{formatDate(activity.date)}</span>
                </div>
                <div style={{ marginTop: '0.25rem', opacity: 0.9 }}>{activity.title}</div>
              </li>
            ))}
            {getRecentActivity().length === 0 && (
              <li style={{ textAlign: 'center', opacity: 0.7 }}>No recent activity</li>
            )}
          </ul>
        </div>
        
        {/* Upcoming Deadlines Card */}
        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          <h3 style={{ marginTop: 0, color: '#0AB196' }}>Upcoming Deadlines</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {getUpcomingDeadlines().map((item, index) => (
              <li key={index} style={{ marginBottom: '0.75rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: getStatusColor(item.deadline, item.progress) }}>{item.title}</span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{formatDate(item.deadline)}</span>
                </div>
                <div style={{ marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, marginRight: '0.5rem' }}>
                    <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.progress}%`, backgroundColor: getStatusColor(item.deadline, item.progress), height: '6px', borderRadius: '5px 0 0 5px' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8rem' }}>
                    {getDaysRemaining(item.deadline) !== null ? 
                      `${getDaysRemaining(item.deadline)} days left` : 
                      'No deadline'
                    }
                  </span>
                </div>
              </li>
            ))}
            {getUpcomingDeadlines().length === 0 && (
              <li style={{ textAlign: 'center', opacity: 0.7 }}>No upcoming deadlines</li>
            )}
          </ul>
        </div>
      </div>
      
      {/* Goals Section */}
      <h2 style={{ color: '#0AB196', marginBottom: '1rem' }}>Your Goals</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {goals.slice(0, 4).map(goal => (
          <div key={goal.id} style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: getStatusColor(goal.deadline, goal.progress) }}>{goal.title}</h3>
              <span style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.25rem 0.5rem', borderRadius: '15px', fontSize: '0.8rem' }}>{goal.category}</span>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>Why:</strong> <span style={{ opacity: 0.9 }}>{goal.why}</span>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>Implications:</strong> <span style={{ opacity: 0.9 }}>{goal.implications}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span>Progress: {goal.progress}%</span>
              {goal.deadline && (
                <span style={{ opacity: 0.8 }}>
                  Due: {formatDate(goal.deadline)}
                </span>
              )}
            </div>
            
            <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '5px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ width: `${goal.progress}%`, backgroundColor: getStatusColor(goal.deadline, goal.progress), height: '10px', borderRadius: '5px 0 0 5px', transition: 'width 0.5s ease' }} />
            </div>
            
            {goal.miniActionPlan && goal.miniActionPlan.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <button 
                  onClick={() => toggleMiniActionPlan(goal.id)} 
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    backgroundColor: 'rgba(255,255,255,0.05)', 
                    color: 'white', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    borderRadius: '5px', 
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>Mini Action Plan</span>
                  <span>{expandedGoalId === goal.id ? '▲' : '▼'}</span>
                </button>
                
                {expandedGoalId === goal.id && (
                  <ul style={{ listStyle: 'none', padding: '0.5rem 0 0 1rem', marginTop: '0.5rem', borderLeft: '2px solid rgba(10,177,150,0.3)' }}>
                    {goal.miniActionPlan.map(item => (
                      <li key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <input type="checkbox" checked={item.completed} readOnly disabled style={{ marginRight: '0.5rem', accentColor: '#0AB196' }} />
                        <span style={{ textDecoration: item.completed ? 'line-through' : 'none', opacity: item.completed ? 0.7 : 1 }}>
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            <button 
              onClick={() => navigateTo('/goals')} 
              style={{ 
                width: '100%', 
                padding: '0.5rem', 
                backgroundColor: 'rgba(10,177,150,0.2)', 
                color: '#0AB196', 
                border: '1px solid #0AB196', 
                borderRadius: '5px', 
                cursor: 'pointer' 
              }}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
      
      {/* Quick Actions */}
      <h2 style={{ color: '#0AB196', marginBottom: '1rem' }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigateTo('/journal')} 
          style={{ 
            padding: '1rem', 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '10px', 
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>📝</span>
          <span>Write Journal Entry</span>
        </button>
        
        <button 
          onClick={() => navigateTo('/storytelling-practice')} 
          style={{ 
            padding: '1rem', 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '10px', 
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>🎭</span>
          <span>Practice Storytelling</span>
        </button>
        
        <button 
          onClick={() => navigateTo('/mindset-techniques')} 
          style={{ 
            padding: '1rem', 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '10px', 
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>🧠</span>
          <span>Mindset Techniques</span>
        </button>
        
        <button 
          onClick={() => navigateTo('/report-generator')} 
          style={{ 
            padding: '1rem', 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '10px', 
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>📊</span>
          <span>Generate Report</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
