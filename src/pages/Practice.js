import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { evaluationAPI } from '../services/api';
import ReferenceBox from '../components/ReferenceBox';
import './Practice.css';

const Practice = () => {
  const { letter } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateItemProgress } = useProgress();
  
  const type = searchParams.get('type') || 'alphabet';
  const item = letter;
  const itemType = type === 'alphabet' ? 'letter' : type === 'numbers' ? 'number' : 'character';
  
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showGuide, setShowGuide] = useState(true);
  const [drawingData, setDrawingData] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#2196f3';
    
    clearCanvas();
  }, [item, type]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (showGuide) {
      ctx.fillStyle = '#e0e0e0';
      ctx.font = type === 'hindi' ? 'bold 100px Arial' : 'bold 120px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item, canvas.width / 2, canvas.height / 2);
    }
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    
    if (showGuide) {
      setShowGuide(false);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#2196f3';
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveDrawingData();
    }
  };

  const saveDrawingData = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
    setDrawingData(imageData);
  };

  const handleSubmit = async () => {
    if (!drawingData) {
      setFeedback({
        type: 'error',
        message: 'Please draw something first!'
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await evaluationAPI.evaluateDrawing(item, drawingData, type);
      const { isCorrect, confidence, feedback: evaluationFeedback } = response.data;
      
      await updateItemProgress(item, isCorrect, type);
      
      setFeedback({
        type: isCorrect ? 'success' : 'warning',
        message: evaluationFeedback,
        confidence,
        isCorrect
      });
      
      if (isCorrect) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: 'Oops! Something went wrong. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    clearCanvas();
    setFeedback(null);
    setDrawingData(null);
    setShowGuide(true);
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="practice-container">
      <header className="practice-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>
        <div className="header-content">
          <h1>Practice {itemType}: {item}</h1>
          <p>Draw the {itemType} {item} in the canvas below!</p>
        </div>
      </header>

      <main className="practice-main">
        <ReferenceBox type={type} item={item} />
        <div className="practice-content">
          <div className="canvas-section">
            <div className="canvas-container">
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="drawing-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent('mousedown', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                  });
                  canvasRef.current.dispatchEvent(mouseEvent);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                  });
                  canvasRef.current.dispatchEvent(mouseEvent);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  const mouseEvent = new MouseEvent('mouseup', {});
                  canvasRef.current.dispatchEvent(mouseEvent);
                }}
              />
              
              {showGuide && (
                <div className="canvas-guide">
                  <p>Start drawing here!</p>
                </div>
              )}
            </div>

            <div className="canvas-controls">
              <button onClick={handleReset} className="control-button secondary">
                Clear
              </button>
              <button onClick={handleSkip} className="control-button secondary">
                Skip
              </button>
            </div>
          </div>

          <div className="feedback-section">
            {feedback && (
              <div className={`feedback-card ${feedback.type}`}>
                <div className="feedback-icon">
                  {feedback.type === 'success' && '✓'}
                  {feedback.type === 'warning' && '→'}
                  {feedback.type === 'error' && '✗'}
                </div>
                <div className="feedback-content">
                  <div className="result-indicator">
                    <span className={`result-badge ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
                      {feedback.isCorrect ? 'CORRECT' : 'INCORRECT'}
                    </span>
                    {feedback.confidence && (
                      <span className="confidence-badge">
                        {feedback.confidence}% Confidence
                      </span>
                    )}
                  </div>
                  <h3>
                    {feedback.type === 'success' && 'Excellent!'}
                    {feedback.type === 'warning' && 'Almost there!'}
                    {feedback.type === 'error' && 'Try again!'}
                  </h3>
                  <p>{feedback.message}</p>
                  {feedback.isCorrect && (
                    <p className="redirect-info">
                      Redirecting to dashboard in 3 seconds...
                    </p>
                  )}
                </div>
              </div>
            )}

            {!feedback && (
              <div className="tips-card">
                <h3>Tips for Drawing</h3>
                <ul>
                  <li>Draw slowly and carefully</li>
                  <li>Follow the guide shape</li>
                  <li>Take your time - no rush!</li>
                  <li>Have fun while learning!</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="submit-section">
          <button
            onClick={handleSubmit}
            className="submit-button"
            disabled={isSubmitting || !drawingData}
          >
            {isSubmitting ? (
              <>
                <div className="button-spinner"></div>
                Checking your drawing...
              </>
            ) : (
              'Submit Drawing'
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Practice;
