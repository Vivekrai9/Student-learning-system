import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const AlphabetCard = memo(({ letter, accuracy, attempts, getLetterColor, getLetterEmoji, index }) => {
  return (
    <Link
      to={`/practice/${letter}`}
      className="alphabet-card"
      style={{
        backgroundColor: getLetterColor(letter),
        animationDelay: `${index * 0.05}s`
      }}
    >
      <div className="card-content">
        <div className="letter-emoji">
          {getLetterEmoji(letter)}
        </div>
        <div className="letter-display">
          <span className="letter">{letter}</span>
        </div>
        <div className="letter-stats">
          {attempts > 0 && (
            <>
              <span className="accuracy">{accuracy}%</span>
              <span className="attempts">{attempts} tries</span>
            </>
          )}
          {attempts === 0 && (
            <span className="not-attempted">Not started</span>
          )}
        </div>
      </div>
    </Link>
  );
});

AlphabetCard.displayName = 'AlphabetCard';

export default AlphabetCard;
