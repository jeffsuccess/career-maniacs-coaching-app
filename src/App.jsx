import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';

// Import components
import Dashboard from './components/Dashboard';
import Journal from './components/Journal';
import MindsetTechniques from './components/MindsetTechniques';
import StoryVault from './components/StoryVault';
import StorytellingPractice from './components/StorytellingPractice';
import TargetCompanies from './components/TargetCompanies';
import ActionPlan from './components/ActionPlan';
import Goals from './components/Goals';
import ReportGenerator from './components/ReportGenerator';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  
  // Navigation items
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/journal', label: 'Journal' },
    { path: '/mindset', label: 'Mindset' },
    { path: '/story-vault', label: 'Story Vault' },
    { path: '/storytelling-practice', label: 'Storytelling Practice' },
    { path: '/target-companies', label: 'Target Companies' },
    { path: '/action-plan', label: 'Action Plan' },
    { path: '/goals', label: 'Goals' },
    { path: '/reports', label: 'Reports' }
  ];
  
  // Active link component
  const NavLink = ({ to, children, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    
    return (
      <Link 
        to={to} 
        onClick={onClick}
        style={{
          color: isActive ? '#16B3F7' : 'white',
          textDecoration: 'none',
          fontWeight: isActive ? 'bold' : 'normal',
          position: 'relative',
          padding: '0.5rem 0',
          transition: 'color 0.3s ease'
        }}
      >
        {children}
        {isActive && (
          <span style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, #0AB196, #00C2C7, #16B3F7)',
            borderRadius: '2px'
          }} />
        )}
      </Link>
    );
  };
  
  return (
    <BrowserRouter>
      <div className="App">
        {/* Navigation */}
        <nav style={{
          background: '#1e2130',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img 
                src="./assets/logo.png" 
                alt="Career Maniacs Logo" 
                style={{ 
                  height: '50px',
                  marginRight: '1rem'
                }} 
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div style={{ 
            display: 'flex', 
            gap: '2rem',
            alignItems: 'center',
            '@media (max-width: 768px)': {
              display: 'none'
            }
          }} className="desktop-nav">
            {navItems.map(item => (
              <NavLink key={item.path} to={item.path}>
                {item.label}
              </NavLink>
            ))}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'none',
              '@media (max-width: 768px)': {
                display: 'block'
              }
            }}
            className="mobile-menu-button"
          >
            {mobileMenuOpen ? '×' : '☰'}
          </button>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div style={{
              position: 'fixed',
              top: '70px',
              left: 0,
              right: 0,
              bottom: 0,
              background: '#1e2130',
              display: 'flex',
              flexDirection: 'column',
              padding: '1rem',
              zIndex: 99
            }} className="mobile-nav">
              {navItems.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path}
                  onClick={closeMobileMenu}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </nav>
        
        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/mindset" element={<MindsetTechniques />} />
            <Route path="/story-vault" element={<StoryVault />} />
            <Route path="/storytelling-practice" element={<StorytellingPractice />} />
            <Route path="/target-companies" element={<TargetCompanies />} />
            <Route path="/action-plan" element={<ActionPlan />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/reports" element={<ReportGenerator />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
