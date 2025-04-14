import React from 'react';
import Recommendations from '../components/Recommendations';
import FeedbackForm from '../components/FeedbackForm';
import UserProfile from '../components/UserProfile';

const Home = () => {
  const userId = 'user-id-placeholder'; // Replace with actual user ID logic

  return (
    <div>
      <h1>Welcome to My Learning Path App</h1>
      <UserProfile userId={userId} />
      <Recommendations userId={userId} />
      <FeedbackForm userId={userId} />
    </div>
  );
};

export default Home;
