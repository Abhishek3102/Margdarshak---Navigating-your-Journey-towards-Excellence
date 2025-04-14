import React, { useState, useEffect } from 'react';
import { fetchRecommendations } from '../services/apiService';

const Recommendations = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchRecommendations(userId)
      .then(response => setRecommendations(response.data.recommendations))
      .catch(error => console.error(error));
  }, [userId]);

  return (
    <div>
      <h2>Recommended Learning Paths</h2>
      <ul>
        {recommendations.map((rec, index) => (
          <li key={index}>{rec.title} - {rec.description}</li>
        ))}
      </ul>
    </div>
  );
};

export default Recommendations;
