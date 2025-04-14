import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Recommendations from '../../Frontend/src/components/Recommendations';
import { FetchRecommendations } from '../../Frontend/src/services/apiService';

jest.mock('../../frontend/src/services/apiService');

test('displays recommendations', async () => {
    fetchRecommendations.mockResolvedValue({ data: { recommendations: [{ title: 'Course 1', description: 'Description 1' }] } });
    
    render(<Recommendations userId="user-id" />);
    
    await waitFor(() => {
        expect(screen.getByText('Course 1')).toBeInTheDocument();
    });
});
