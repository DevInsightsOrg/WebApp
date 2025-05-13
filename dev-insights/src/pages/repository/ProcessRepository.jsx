// ProcessingRepository.jsx
import React, { useState } from 'react';

const ProcessingRepository = ({ onComplete }) => {
  const [working, setWorking] = useState(false);

  const start = () => {
    setWorking(true);
    onComplete();   // kicks off the POST to process
  };

  return (
    <div>
      <h2>Your repo is not processed yet.</h2>
      <button onClick={start} disabled={working}>
        {working ? 'Processing…' : 'Start Processing'}
      </button>
    </div>
  );
};

export default ProcessingRepository;
