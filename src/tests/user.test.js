const request = require('supertest');
const app = require('../app');
const User = require('../model/user');
const { response } = require('../app');
const {userId, userOne, setUpDb} = require('../tests/fixtures/db')


beforeEach( async () => {
  await setUpDb();
});

test('user create', async () => {
    const response = await request(app)
      .post('/user')
      .send({
         name: "Test Minato Namakaze",
         email: "testminato@konoha.com",
         password: "MoonSky",
         age: 43
      })
      .expect(201)

      const user = await User.findById(response.body.user._id);
      expect(user).not.toBeNull();
      expect(response.body).toMatchObject({
          user: {
            name: "Test Minato Namakaze",
            email: "testminato@konoha.com",
          },
          //tokens: user.tokens[0].token
      })
      expect(user.password).not.toBe('MoonSky')
})

test('user create', async () => {
    const response = await request(app)
      .post('/user/login')
      .send({
         email: userOne.email,
         password: userOne.password,
      })
      .expect(200)

      const user = await User.findById(response.body.user._id);
      expect(response.body.token).toBe(user.tokens[1].token)
})


test('get user profile', async () => {
    await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)
})

test('delete user profile', async () => {
    const response = await request(app)
      .delete('/user/me')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send()
      .expect(200)

      const user = await User.findById(userId);
      expect(user).toBeNull();
})

test('upload avater', async() => {
  await request(app)
    .post('/user/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('upload', 'src/tests/fixtures/prof.png')
    .expect(200)

    const user = await User.findById(userId);
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('update user', async () => {
  const modName = 'Test Itachi mod';
  const response = await request(app)
    .patch('/user/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Test Itachi mod'
    })
    .expect(200)

    const user = await User.findById(userId);
    expect(user.name).toBe(modName)
})