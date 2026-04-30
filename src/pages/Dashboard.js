import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import AlphabetCard from '../components/AlphabetCard';
import TabNavigation from '../components/TabNavigation';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { progress, overallProgress, fetchProgress, loading, currentType, setCurrentType } = useProgress();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetchAllProgress();
  }, []);

  useEffect(() => {
    fetchProgress(currentType);
  }, [currentType, fetchProgress]);

  const fetchAllProgress = async () => {
    // This will be handled by the context
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getItemsForType = useCallback((type) => {
    switch (type) {
      case 'alphabet':
        return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      case 'numbers':
        return '0123456789'.split('');
      case 'hindi':
        return 'अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह'.split('');
      default:
        return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    }
  }, []);

  const items = useMemo(() => getItemsForType(currentType), [currentType, getItemsForType]);
  const currentProgress = useMemo(() => progress[currentType] || {}, [progress, currentType]);

  const getItemColor = useCallback((item) => {
    if (!currentProgress[item]) return '#f0f0f0';
    
    const accuracy = currentProgress[item].accuracy;
    if (accuracy >= 80) return '#4caf50';
    if (accuracy >= 60) return '#ff9800';
    if (accuracy >= 40) return '#ff5722';
    return '#f44336';
  }, [currentProgress]);

  const getItemStatus = useCallback((item) => {
    if (!currentProgress[item]) return 'New';
    
    const accuracy = currentProgress[item].accuracy;
    if (accuracy >= 80) return 'Mastered';
    if (accuracy >= 60) return 'Good';
    if (accuracy >= 40) return 'Learning';
    return 'Practice';
  }, [currentProgress]);

  const stats = useMemo(() => {
    const progressValues = Object.values(currentProgress);
    return {
      masteredItems: progressValues.filter(p => p.accuracy >= 80).length,
      inProgressItems: progressValues.filter(p => p.accuracy > 0 && p.accuracy < 80).length,
      totalAttempts: progressValues.reduce((sum, p) => sum + (p.attempts || 0), 0)
    };
  }, [currentProgress]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your learning progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <h1>Welcome back, {user?.name || 'Learner'}!</h1>
            <p>Ready to continue your learning adventure?</p>
          </div>
          <div className="header-actions">
            <div className="progress-badge">
              <span className="progress-number">{overallProgress}%</span>
              <span className="progress-label">Complete</span>
            </div>
            <button 
              onClick={handleLogout}
              className="logout-button"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout 🚪'}
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">%</div>
              <div className="stat-content">
                <h3>{overallProgress}%</h3>
                <p>Overall Progress</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✓</div>
              <div className="stat-content">
                <h3>{stats.masteredItems}</h3>
                <p>Mastered</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">→</div>
              <div className="stat-content">
                <h3>{stats.inProgressItems}</h3>
                <p>In Progress</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">#</div>
              <div className="stat-content">
                <h3>{stats.totalAttempts}</h3>
                <p>Total Attempts</p>
              </div>
            </div>
          </div>
        </section>

        <TabNavigation currentType={currentType} setCurrentType={setCurrentType} />
        
        <section className="learning-section">
          <div className="section-header">
            <h2>{currentType === 'alphabet' ? 'Alphabet' : currentType === 'numbers' ? 'Numbers' : 'Hindi'} Practice</h2>
            <p>Click on any item to start practicing!</p>
          </div>
          
          <div className="alphabet-grid">
            {items.map((item, index) => {
              const itemProgress = currentProgress[item];
              const accuracy = itemProgress?.accuracy || 0;
              const attempts = itemProgress?.attempts || 0;
              
              return (
                <AlphabetCard
                  key={item}
                  letter={item}
                  accuracy={accuracy}
                  attempts={attempts}
                  getLetterColor={getItemColor}
                  getLetterEmoji={getItemStatus}
                  index={index}
                />
              );
            })}
          </div>
        </section>

        <section className="quick-actions">
          <div className="action-buttons">
            <Link to="/progress" className="action-button primary">
              <span className="button-icon">📈</span>
              <span className="button-text">View Progress</span>
            </Link>
            <button 
              onClick={() => navigate('/practice/' + items[Math.floor(Math.random() * items.length)] + '?type=' + currentType)}
              className="action-button secondary"
            >
              <span className="button-icon">?</span>
              <span className="button-text">Random</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
