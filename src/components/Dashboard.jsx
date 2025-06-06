import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Sample data - in a real app, this would come from a database or API
  const [missionStatement, setMissionStatement] = useState(
    "To help professionals transform their careers through strategic storytelling and mindset techniques."
  );
  
  const [dailyTasks, setDailyTasks] = useState([
    { id: 1, text: "Update LinkedIn profile", completed: true },
    { id: 2, text: "Practice storytelling - Leadership example", completed: true },
    { id: 3, text: "Journal entry for today", completed: true },
    { id: 4, text: "Research target company: Acme Corp", completed: false },
    { id: 5, text: "Complete mindset exercise", completed: false }
  ]);
  
  const [upcomingEvents, setUpcomingEvents] = useState([
    { id: 1, title: "Mock Interview Practice", date: "Today 3:00 PM" },
    { id: 2, title: "Coaching Session", date: "Tomorrow 10:00 AM" },
    { id: 3, title: "Networking Event", date: "Friday 2:00 PM" }
  ]);
  
  // Sample goals data with status
  const [goals, setGoals] = useState([
    { 
      id: 1, 
      title: "Land a Senior Product Manager role", 
      category: "Career",
      progress: 65,
      status: "On Track",
      dueDate: "August 15, 2025"
    },
    { 
      id: 2, 
      title: "Master the ABT storytelling framework", 
      category: "Skills",
      progress: 80,
      status: "Ahead",
      dueDate: "July 1, 2025"
    },
    { 
      id: 3, 
      title: "Build network in target industry", 
      category: "Networking",
      progress: 40,
      status: "Behind",
      dueDate: "September 30, 2025"
    }
  ]);
  
  // Calculate progress percentage
  const completedTasks = dailyTasks.filter(task => task.completed).length;
  const totalTasks = dailyTasks.length;
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);
  
  // Function to toggle task completion
  const toggleTaskCompletion = (taskId) => {
    setDailyTasks(dailyTasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };
  
  // Function to edit mission statement
  const handleMissionStatementChange = (e) => {
    setMissionStatement(e.target.value);
  };
  
  // Function to save mission statement
  const saveMissionStatement = () => {
    // In a real app, this would save to a database
    alert("Mission statement saved!");
  };
  
  // Function to generate report
  const generateReport = () => {
    // Navigate to reports page
    window.location.href = '/reports';
  };
  
  // Function to view all tasks
  const viewAllTasks = () => {
    // Navigate to action plan page
    window.location.href = '/action-plan';
  };
  
  // Function to view calendar
  const viewCalendar = () => {
    // In a real app, this would navigate to a calendar view
    alert("Calendar view would open here");
  };
  
  // Function to view all goals
  const viewAllGoals = () => {
    // Navigate to goals page
    window.location.href = '/goals';
  };
  
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ 
        background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: 'bold',
        marginBottom: '2rem'
      }}>
        Dashboard
      </h1>
      
      {/* Mission Statement Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Mission Statement</h2>
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          backdropFilter: 'blur(5px)'
        }}>
          <textarea
            value={missionStatement}
            onChange={handleMissionStatementChange}
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '1rem',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '5px',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: '1rem'
            }}
          />
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={saveMissionStatement}
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
              Save
            </button>
          </div>
        </div>
      </div>
      
      {/* Goals Status Section - NEW */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Goals Status</h2>
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            {goals.map(goal => (
              <div 
                key={goal.id}
                style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0 }}>{goal.title}</h3>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.8rem',
                    backgroundColor: goal.status === 'On Track' ? 'rgba(10, 177, 150, 0.2)' : 
                                    goal.status === 'Ahead' ? 'rgba(22, 179, 247, 0.2)' : 
                                    'rgba(255, 100, 100, 0.2)',
                    color: goal.status === 'On Track' ? '#0AB196' : 
                           goal.status === 'Ahead' ? '#16B3F7' : 
                           '#FF6464'
                  }}>
                    {goal.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span style={{ marginRight: '1rem' }}>Category: {goal.category}</span>
                  <span>Due: {goal.dueDate}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      width: '100%', 
                      backgroundColor: 'rgba(255,255,255,0.1)', 
                      borderRadius: '10px',
                      height: '8px'
                    }}>
                      <div style={{ 
                        width: `${goal.progress}%`, 
                        backgroundColor: goal.status === 'On Track' ? '#0AB196' : 
                                        goal.status === 'Ahead' ? '#16B3F7' : 
                                        '#FF6464',
                        borderRadius: '10px',
                        height: '100%'
                      }} />
                    </div>
                  </div>
                  <span style={{ fontWeight: 'bold' }}>{goal.progress}%</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/goals">
              <button 
                onClick={viewAllGoals}
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
                View All Goals
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Dashboard Cards Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        {/* Progress Card */}
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          backdropFilter: 'blur(5px)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}>
          <h3>Daily Progress</h3>
          <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ 
              width: '150px', 
              height: '150px', 
              borderRadius: '50%', 
              background: `conic-gradient(#0AB196 ${progressPercentage}%, rgba(255,255,255,0.2) 0%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ 
                width: '130px', 
                height: '130px', 
                borderRadius: '50%', 
                backgroundColor: '#262833',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                {progressPercentage}%
              </div>
            </div>
          </div>
          <p>{completedTasks} of {totalTasks} daily tasks completed</p>
          <Link to="/reports">
            <button 
              onClick={generateReport}
              style={{
                background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
                border: 'none',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '1rem',
                width: '100%'
              }}
            >
              Generate Report
            </button>
          </Link>
        </div>
        
        {/* Tasks Card */}
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          backdropFilter: 'blur(5px)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}>
          <h3>Tasks</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {dailyTasks.map(task => (
              <li 
                key={task.id} 
                style={{ 
                  padding: '0.5rem 0', 
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span 
                  style={{ 
                    marginRight: '10px',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleTaskCompletion(task.id)}
                >
                  {task.completed ? '✓' : '□'}
                </span>
                <span style={{ 
                  textDecoration: task.completed ? 'line-through' : 'none',
                  opacity: task.completed ? 0.7 : 1
                }}>
                  {task.text}
                </span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/action-plan">
              <button 
                onClick={viewAllTasks}
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
                View All Tasks
              </button>
            </Link>
          </div>
        </div>
        
        {/* Calendar Card */}
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          backdropFilter: 'blur(5px)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}>
          <h3>Calendar</h3>
          <p>Your upcoming events and appointments</p>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {upcomingEvents.map(event => (
              <li key={event.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <strong>{event.date}</strong><br />
                {event.title}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={viewCalendar}
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
              View Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
