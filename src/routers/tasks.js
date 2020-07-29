const express = require('express');
const router = new express.Router();
const Task = require('../model/task');
const User = require('../model/user');
const auth = require('../middleware/auth');
const { runInNewContext } = require('vm');

// /tasks?completed=true
// /tasks?limit=2&skip=2
// /tasks?sortBy=createdAt:asc/desc
router.get('/tasks', auth, async (req, res) => {
    try {
        const match = {};
        const sort = {};
        // req.query.completed is a string
        if (req.query.completed) {
            match.completed = req.query.completed === 'true'
        }

        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        }
        const user = req.user;
        await user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
                // sort: {
                //     createdAt: req.param.createdAt === 'asc' ? -1 : 1,
                //    //  completed: -1
                // }
            }
        }).execPopulate();
        res.send(user.tasks);
    } catch (error) {
        res.status(500).send(error);
    }
})

router.get('/task/:id', auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const task = await Task.findOne({_id, owner: req.user._id});
        if (!task) {
            res.status(404).send('task not found')
        }
        res.send(task)
    } catch (error) {
        res.status(500).send(error);
    }
})


router.post('/task', auth, async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            owner: req.user._id
        });
        const data = await task.save();
        res.status(201).send(data)
    } catch (error) {
        res.status(400).send(error);
    }
})

router.patch('/task/:id', auth, async (req, res) => {
    const _id = req.params.id;
    const allowedParams = ['description', 'completed'];
    const fetchedKeys = Object.keys(req.body);

    const isNotAllowed = fetchedKeys.find((key) => !allowedParams.includes(key))

    if(isNotAllowed) {
        return res.status(400).send({error: 'invalid key'})
    }

    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});

        if(!task) {
            return res.status(404).send();
        }

        fetchedKeys.forEach(key => task[key] = req.body[key]);
        await task.save()
        // const task = await Task.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true});

        

        res.send(task);
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/task/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        if(!task) {
            return res.status(404).send();
        }

        res.send(task)
    } catch (error) {
        res.status(400).send();
    }
})

module.exports = router;
