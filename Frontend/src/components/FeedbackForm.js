import React, { useState } from 'react';
import { submitFeedback } from '../services/apiService';

const FeedbackForm = ({ userId }) => {
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    submitFeedback(userId, feedback)
      .then(response => {
        setStatus('Feedback submitted successfully');
        setFeedback('');
      })
      .catch(error => {
        setStatus('Failed to submit feedback');
        console.error(error);
      });
  };

  return (
    <div>
      <h2>Submit Feedback</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Enter your feedback"
          rows="4"
          cols="50"
        />
        <br />
        <button type="submit">Submit</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
};

export default FeedbackForm;
