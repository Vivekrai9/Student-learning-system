import React from 'react';
import { getLearningData } from '../utils/learningData';
import './ReferenceBox.css';

const ReferenceBox = ({ type, item }) => {
  const learningData = getLearningData(type, item);
  
  // Generate emoji-based image representation
  const getEmojiDisplay = (emoji) => {
    const emojiMap = {
      'apple': '',
      'ball': '',
      'cat': '',
      'dog': '',
      'elephant': '',
      'fish': '',
      'grapes': '',
      'house': '',
      'icecream': '',
      'juice': '',
      'kite': '',
      'lion': '',
      'moon': '',
      'nest': '',
      'orange': '',
      'pencil': '',
      'queen': '',
      'rose': '',
      'sun': '',
      'tree': '',
      'umbrella': '',
      'van': '',
      'water': '',
      'xylophone': '',
      'yacht': '',
      'zebra': '',
      'zero': '0',
      'one': '1',
      'two': '2',
      'three': '3',
      'four': '4',
      'five': '5',
      'six': '6',
      'seven': '7',
      'eight': '8',
      'nine': '9'
    };
    
    return emojiMap[emoji] || '?';
  };

  const getEmojiImage = (emoji) => {
    // For now, use text-based representation
    // In a real app, you would use actual image URLs
    return getEmojiDisplay(emoji);
  };

  return (
    <div className="reference-box">
      <div className="reference-header">
        <h3>Reference</h3>
      </div>
      <div className="reference-content">
        <div className="character-display">
          <div className="character-large">{item}</div>
        </div>
        <div className="example-display">
          <div className="image-container">
            <div className="emoji-image">
              {getEmojiImage(learningData.emoji)}
            </div>
          </div>
          <div className="text-content">
            <div className="example-word">
              {item} for {learningData.word}
            </div>
            <div className="description">
              {learningData.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferenceBox;
