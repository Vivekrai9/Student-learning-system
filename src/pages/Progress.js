import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import './Progress.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

const Progress = () => {
  const navigate = useNavigate();
  const { progress, overallProgress, fetchProgress, loading } = useProgress();
  const [selectedView, setSelectedView] = useState('bar');

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const getBarChartData = () => {
    const letters = Object.keys(progress).sort();
    const accuracies = letters.map(letter => progress[letter]?.accuracy || 0);
    const attempts = letters.map(letter => progress[letter]?.attempts || 0);

    return {
      labels: letters,
      datasets: [
        {
          label: 'Accuracy %',
          data: accuracies,
          backgroundColor: accuracies.map(acc => {
            if (acc >= 80) return 'rgba(76, 175, 80, 0.8)';
            if (acc >= 60) return 'rgba(255, 152, 0, 0.8)';
            if (acc >= 40) return 'rgba(255, 87, 34, 0.8)';
            return 'rgba(244, 67, 54, 0.8)';
          }),
          borderColor: accuracies.map(acc => {
            if (acc >= 80) return 'rgba(76, 175, 80, 1)';
            if (acc >= 60) return 'rgba(255, 152, 0, 1)';
            if (acc >= 40) return 'rgba(255, 87, 34, 1)';
            return 'rgba(244, 67, 54, 1)';
          }),
          borderWidth: 2,
        },
        {
          label: 'Attempts',
          data: attempts,
          backgroundColor: 'rgba(33, 150, 243, 0.6)',
          borderColor: 'rgba(33, 150, 243, 1)',
          borderWidth: 2,
          yAxisID: 'y1',
        }
      ]
    };
  };

  const getLineChartData = () => {
    const letters = Object.keys(progress).sort();
    const accuracies = letters.map(letter => progress[letter]?.accuracy || 0);

    return {
      labels: letters,
      datasets: [
        {
          label: 'Learning Progress',
          data: accuracies,
          borderColor: 'rgba(156, 39, 176, 1)',
          backgroundColor: 'rgba(156, 39, 176, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(156, 39, 176, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        }
      ]
    };
  };

  const getDoughnutData = () => {
    const mastered = Object.values(progress).filter(p => p.accuracy >= 80).length;
    const inProgress = Object.values(progress).filter(p => p.accuracy > 0 && p.accuracy < 80).length;
    const notStarted = Object.values(progress).filter(p => p.accuracy === 0).length;

    return {
      labels: ['Mastered (80%+)', 'In Progress', 'Not Started'],
      datasets: [
        {
          data: [mastered, inProgress, notStarted],
          backgroundColor: [
            'rgba(76, 175, 80, 0.8)',
            'rgba(255, 152, 0, 0.8)',
            'rgba(224, 224, 224, 0.8)'
          ],
          borderColor: [
            'rgba(76, 175, 80, 1)',
            'rgba(255, 152, 0, 1)',
            'rgba(224, 224, 224, 1)'
          ],
          borderWidth: 2,
        }
      ]
    };
  };

  const getWeakLetters = () => {
    return Object.entries(progress)
      .filter(([letter, data]) => data.accuracy > 0 && data.accuracy < 60)
      .sort((a, b) => a[1].accuracy - b[1].accuracy)
      .slice(0, 5);
  };

  const getStrongLetters = () => {
    return Object.entries(progress)
      .filter(([letter, data]) => data.accuracy >= 80)
      .sort((a, b) => b[1].accuracy - a[1].accuracy)
      .slice(0, 5);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: 'Arial, sans-serif'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + '%';
            }
            return label;
          }
        }
      }
    },
    scales: selectedView === 'bar' ? {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Accuracy (%)'
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        title: {
          display: true,
          text: 'Attempts'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    } : {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Accuracy (%)'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12,
            family: 'Arial, sans-serif'
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="progress-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your progress data...</p>
        </div>
      </div>
    );
  }

  const weakLetters = getWeakLetters();
  const strongLetters = getStrongLetters();

  return (
    <div className="progress-container">
      <header className="progress-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>
        <div className="header-content">
          <h1>📈 Your Learning Progress</h1>
          <p>Track your alphabet learning journey!</p>
        </div>
      </header>

      <main className="progress-main">
        <section className="overview-section">
          <div className="overview-cards">
            <div className="overview-card primary">
              <div className="card-icon">🎯</div>
              <div className="card-content">
                <h3>{overallProgress}%</h3>
                <p>Overall Progress</p>
              </div>
            </div>
            <div className="overview-card success">
              <div className="card-icon">⭐</div>
              <div className="card-content">
                <h3>{strongLetters.length}</h3>
                <p>Mastered Letters</p>
              </div>
            </div>
            <div className="overview-card warning">
              <div className="card-icon">📚</div>
              <div className="card-content">
                <h3>{weakLetters.length}</h3>
                <p>Need Practice</p>
              </div>
            </div>
            <div className="overview-card info">
              <div className="card-icon">🔥</div>
              <div className="card-content">
                <h3>{Object.values(progress).reduce((sum, p) => sum + (p.attempts || 0), 0)}</h3>
                <p>Total Attempts</p>
              </div>
            </div>
          </div>
        </section>

        <section className="charts-section">
          <div className="chart-controls">
            <div className="view-toggle">
              <button
                className={`toggle-button ${selectedView === 'bar' ? 'active' : ''}`}
                onClick={() => setSelectedView('bar')}
              >
                📊 Bar Chart
              </button>
              <button
                className={`toggle-button ${selectedView === 'line' ? 'active' : ''}`}
                onClick={() => setSelectedView('line')}
              >
                📈 Line Chart
              </button>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-container main-chart">
              <h3>Letter Performance</h3>
              <div className="chart-wrapper">
                {selectedView === 'bar' ? (
                  <Bar data={getBarChartData()} options={chartOptions} />
                ) : (
                  <Line data={getLineChartData()} options={chartOptions} />
                )}
              </div>
            </div>

            <div className="chart-container doughnut-chart">
              <h3>Learning Distribution</h3>
              <div className="chart-wrapper">
                <Doughnut data={getDoughnutData()} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </section>

        <section className="details-section">
          <div className="details-grid">
            <div className="detail-card">
              <h3>💪 Letters That Need Practice</h3>
              {weakLetters.length > 0 ? (
                <div className="letter-list">
                  {weakLetters.map(([letter, data]) => (
                    <Link
                      key={letter}
                      to={`/practice/${letter}`}
                      className="letter-item weak"
                    >
                      <span className="letter">{letter}</span>
                      <div className="letter-stats">
                        <span className="accuracy">{data.accuracy}%</span>
                        <span className="attempts">{data.attempts} tries</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="no-data">Great job! All letters are doing well! 🎉</p>
              )}
            </div>

            <div className="detail-card">
              <h3>⭐ Mastered Letters</h3>
              {strongLetters.length > 0 ? (
                <div className="letter-list">
                  {strongLetters.map(([letter, data]) => (
                    <div key={letter} className="letter-item mastered">
                      <span className="letter">{letter}</span>
                      <div className="letter-stats">
                        <span className="accuracy">{data.accuracy}%</span>
                        <span className="attempts">{data.attempts} tries</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">Keep practicing to master letters! 📚</p>
              )}
            </div>
          </div>
        </section>

        <section className="action-section">
          <div className="action-buttons">
            <Link to="/dashboard" className="action-button primary">
              🏠 Back to Dashboard
            </Link>
            {weakLetters.length > 0 && (
              <Link to={`/practice/${weakLetters[0][0]}`} className="action-button secondary">
                🎯 Practice Weakest Letter
              </Link>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Progress;
