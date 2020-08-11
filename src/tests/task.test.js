const request = require('supertest');
const app = require('../app');
const Task = require('../model/task');
const { response } = require('../app');
const {userId, userOne, setUpDb, task2 } = require('../tests/fixtures/db')

beforeEach( async () => {
    await setUpDb();
});

test('task create', async () => {
    const response = await request(app)
    .post('/task')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
       description: 'Test the test case',
    })
    .expect(201)

    const task = await Task.findById(response.body._id);
    expect(task.description).toBe('Test the test case')
    expect(task.completed).toBeFalsy()
})

test('task fetch', async () => {
    const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200)

    expect(response.body[0].description).toBe('Test mock dada')
    
})

test('should not delete other user task', async () => {
    const response = await request(app)
    .delete(`/task/${task2._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(404)
})
