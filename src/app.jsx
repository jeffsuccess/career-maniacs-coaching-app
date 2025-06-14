import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Goals from './components/Goals';
import ActionPlan from './components/ActionPlan';
import TargetCompanies from './components/targetcompanies';
import StoryVault from './components/StoryVault';
import StorytellingPractice from './components/StorytellingPractice';
import MindsetTechniques from './components/mindsettechniques';
import Journal from './components/Journal';
import ReportGenerator from './components/ReportGenerator';

function App() {
  const [darkMode, setDarkMode] = React.useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });
  
  React.useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);
  
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-brand">
            {/* Removed padding from logo */}
            <img src="/logo.png" alt="Career Maniacs" className="logo" style={{ padding: 0, marginRight: '10px' }} />
            <span>Career Maniacs</span>
          </div>
          
          {/* Improved navigation layout - single line with better spacing */}
          <div className="navbar-menu" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
            <Link to="/" className="navbar-item">Dashboard</Link>
            <Link to="/goals" className="navbar-item">Goals</Link>
            <Link to="/action-plan" className="navbar-item">Action Plan</Link>
            <Link to="/target-companies" className="navbar-item">Target Companies</Link>
            <Link to="/story-vault" className="navbar-item">Story Vault</Link>
            <Link to="/storytelling-practice" className="navbar-item">Storytelling Practice</Link>
            <Link to="/mindset-techniques" className="navbar-item">Mindset Techniques</Link>
            <Link to="/journal" className="navbar-item">Journal</Link>
            <Link to="/report-generator" className="navbar-item">Report Generator</Link>
          </div>
          
          <div className="navbar-end">
            <button 
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/action-plan" element={<ActionPlan />} />
            <Route path="/target-companies" element={<TargetCompanies />} />
            <Route path="/story-vault" element={<StoryVault />} />
            <Route path="/storytelling-practice" element={<StorytellingPractice />} />
            <Route path="/mindset-techniques" element={<MindsetTechniques />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/report-generator" element={<ReportGenerator />} />
          </Routes>
        </main>
        
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} Career Maniacs. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
