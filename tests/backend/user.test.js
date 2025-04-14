const request = require('supertest');
const app = require('../../Backend/app');
const mongoose = require('mongoose');

beforeAll(async () => {
    await mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.connection.close();
});

test('GET /api/users/:id', async () => {
    const response = await request(app).get('/api/users/123');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name');
});
