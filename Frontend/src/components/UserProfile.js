import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../services/apiService';

const UserProfile = ({ userId }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        getUserProfile(userId)
            .then(response => setUser(response.data))
            .catch(error => console.error('Error fetching user profile:', error));
    }, [userId]);

    if (!user) return <div>Loading...</div>;

    return (
        <div>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
            {/* Display other user details here */}
        </div>
    );
};

export default UserProfile;
