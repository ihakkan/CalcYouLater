'use client';

import React from 'react';

interface FlipContainerProps {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped: boolean;
}

const FlipContainer: React.FC<FlipContainerProps> = ({ front, back, isFlipped }) => {
  return (
    <div className={`flip-container ${isFlipped ? 'flipped' : ''}`}>
      <div className="flipper">
        <div className="front">{front}</div>
        <div className="back">{back}</div>
      </div>
    </div>
  );
};

export default FlipContainer;
