const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../model/user');
const Task = require('../../model/task');

const userId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userId,
    name: 'Test Itachi',
    email: 'testitachi@konoha.com',
    password: 'Pass1234!!',
    tokens: [{
        token: jwt.sign({_id: userId}, process.env.TOKEN_SIGNAMURE)
    }]
}

const userIdtwo = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userIdtwo,
    name: 'Test Minato55',
    email: 'testminato877@konoha.com',
    password: 'Pass1234!!',
    tokens: [{
        token: jwt.sign({_id: userIdtwo}, process.env.TOKEN_SIGNAMURE)
    }]
}

const task1 = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test mock dada',
    completed: false,
    owner: userId
}

const task2 = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test mock dada data',
    completed: false,
    owner: userIdtwo
}

const setUpDb = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(task1).save()
    await new Task(task2).save()
}

module.exports = {
    userId,
    userOne,
    setUpDb,
    task2
}