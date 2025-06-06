import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/dashboard';
import Goals from './components/goals';
import ActionPlan from './components/actionplan';
import Journal from './components/journal';
import MindsetTechniques from './components/mindsettechniques';
import StoryVault from './components/storyvault';
import StorytellingPractice from './components/storytellingpractice';
import TargetCompanies from './components/targetcompanies';
import ReportGenerator from './components/reportgenerator';

function App() {
  // State for shared data
  const [userData, setUserData] = useState({
    goals: [],
    tasks: [],
    journalEntries: [],
    mindsetPractices: [],
    stories: [],
    targetCompanies: []
  });
  
  // State for task management
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Update resume with latest experience',
      description: 'Add recent project achievements and update skills section.',
      priority: 'high',
      deadline: '2025-06-10',
      status: 'in-progress',
      progress: 60,
      dependencies: [],
      subtasks: [
        { id: 1, title: 'Update work experience section', completed: true },
        { id: 2, title: 'Add new skills', completed: true },
        { id: 3, title: 'Update project portfolio', completed: false },
        { id: 4, title: 'Proofread and finalize', completed: false }
      ]
    },
    {
      id: 2,
      title: 'Research target companies',
      description: 'Identify 5 companies that align with career goals and values.',
      priority: 'medium',
      deadline: '2025-06-15',
      status: 'not-started',
      progress: 0,
      dependencies: [],
      subtasks: [
        { id: 1, title: 'Create criteria for ideal companies', completed: false },
        { id: 2, title: 'Research company cultures', completed: false },
        { id: 3, title: 'Identify key decision makers', completed: false }
      ]
    }
  ]);
  
  // Function to add task from milestone
  const addTaskFromMilestone = (taskData) => {
    const newTask = {
      id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
      ...taskData,
      status: 'not-started',
      progress: 0
    };
    
    setTasks([...tasks, newTask]);
    
    // Show notification
    alert(`Task added to Action Plan: ${taskData.title}`);
  };
  
  // Function to update goal progress when mindset technique is practiced
  const updateProgressFromMindsetPractice = (techniqueId, practiceData) => {
    // In a real app, this would update related goals or action plan items
    // For now, we'll just show a notification
    alert(`Mindset practice recorded for ${techniqueId}. This would update related goals and action plan items in a production app.`);
  };
  
  // Navigation component with active link highlighting
  const Navigation = () => {
    const location = useLocation();
    
    return (
      <nav style={{ 
        backgroundColor: '#1e2130', 
        padding: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/assets/logo.png" 
              alt="Career Maniacs Logo" 
              style={{ 
                height: '40px',
                marginRight: '1rem'
              }}
            />
            <h1 style={{ 
              margin: 0,
              fontSize: '1.5rem',
              background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Career Maniacs
            </h1>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { path: '/', label: 'Dashboard' },
              { path: '/goals', label: 'Goals' },
              { path: '/action-plan', label: 'Action Plan' },
              { path: '/journal', label: 'Journal' },
              { path: '/mindset', label: 'Mindset' },
              { path: '/story-vault', label: 'Story Vault' },
              { path: '/storytelling', label: 'Storytelling' },
              { path: '/companies', label: 'Companies' },
              { path: '/reports', label: 'Reports' }
            ].map(item => (
              <Link 
                key={item.path}
                to={item.path}
                style={{ 
                  color: location.pathname === item.path ? '#16B3F7' : 'white',
                  textDecoration: 'none',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                  padding: '0.5rem',
                  borderBottom: location.pathname === item.path ? '2px solid #16B3F7' : '2px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    );
  };
  
  return (
    <Router>
      <div style={{ 
        backgroundColor: '#1a1d2b', 
        color: 'white',
        minHeight: '100vh'
      }}>
        <Navigation />
        
        <Routes>
          <Route path="/" element={<Dashboard userData={userData} />} />
          <Route path="/goals" element={<Goals addTaskToActionPlan={addTaskFromMilestone} />} />
          <Route path="/action-plan" element={<ActionPlan />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/mindset" element={<MindsetTechniques updateProgressFromPractice={updateProgressFromMindsetPractice} />} />
          <Route path="/story-vault" element={<StoryVault />} />
          <Route path="/storytelling" element={<StorytellingPractice />} />
          <Route path="/companies" element={<TargetCompanies />} />
          <Route path="/reports" element={<ReportGenerator userData={userData} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
