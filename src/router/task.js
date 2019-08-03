const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');



router.post('/tasks', auth, async (req, res) => {

    try {
        const task = new Task({
            ...req.body,
            owner: req.user._id
        });
        
        await task.save()
        await task.populate('owner').execPopulate()
        res.status(201).send(task)

    } catch (error) {
        res.status(400).send(error.errors)
    }

})

router.get('/tasks', auth, async (req, res) => {

    const match = {
        owner: req.user._id
    }

    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === "true"
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1
    }

    try {
        const tasks = await Task.find(match, null, {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort
        })

      

        res.send(tasks)
    } catch (error) {
        res.status(500).send(error)
    }

})




router.get('/tasks/:id', auth, async (req, res) => {

    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        res.send(task)
        


    } catch (error) {
        res.status(500).send(error)
    }

})


router.patch('/tasks/:id', auth, async (req, res) => {

    const updates = Object.keys(req.body);
    const allowedUpdatedItems = ['description', 'completed'];
    const isValidOperation = updates.every((update) => {
        return allowedUpdatedItems.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send('Not Found')
        }
        updates.forEach((update) => {
            return task[update] = req.body[update]
        })

        await task.save()

        res.send(task)
    } catch (error) {
        res.status(500).send()
    }

})

router.delete('/tasks/:id', auth, async (req, res) => {

    try {

        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send('Not Found')
        }

        res.send(task)

    } catch (error) {
        res.status(500).send()
    }

})


module.exports = router;