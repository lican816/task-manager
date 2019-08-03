const express = require('express');
const multer = require('multer');
const router = express.Router();
const sharp = require('sharp')
const User = require('../models/User')
const auth = require('../middleware/auth')
const sendEmail = require('../emails/account')


const upload = multer({
    
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
            return cb(new Error('Please upload a pic file'))
        }

        cb(undefined, true)
    }
});



router.post('/users', async (req, res) => {
    
    try {
        const user = new User(req.body);
        
        await user.save()

        sendEmail.sendWelcomeEmail(user.email, user.name)

        const token = await user.generateAuthToken()

        res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }

})



router.post('/users/login', async (req, res) => {

    try {
        let user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        user = user.getPublicProfile()
        res.send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
   

    
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })

        await req.user.save()

        res.send('Logged out')

    } catch (error) {
        res.status(500).send()
    }
})


router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []

        await req.user.save()

        res.send('Logged all out')

    } catch (error) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {

    try {
        const users = req.user
        
        res.send(users)
    } catch (error) {
        res.status(500).send(error)
    }

})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

    const buffer = await sharp(req.file.buffer).resize(250).toBuffer()
    req.user.avatar = buffer

    await req.user.save()


    res.send('File uploaded')
}, (error, req, res, next) => {
    res.status(400).send({
        error: error.message
    })
})

router.delete('/users/me/avatar', auth, async (req, res) => {

    req.user.avatar = undefined

    await req.user.save()

    res.send('Avatar deleted')
})

router.get('/users/:id/avatar', async (req, res) => {
    
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error('No user found')
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)

    } catch (error) {
        res.send(error)
    }
})


router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body);
    const allowedUpdatedItems = ['name', 'age', 'password', 'email'];
    const isValidOperation = updates.every((update) => {
        return allowedUpdatedItems.includes(update)
    })

    if (!isValidOperation) {
        return res.status(404).send({ error: 'Invalid updates!' })
    }

    try {

        const user = req.user

        updates.forEach((update) => {
            return user[update] = req.body[update]
        })

        const updatedUser = await user.save()

        if (!updatedUser) {
            return res.status(404).send('Not Found!')
        }
        res.send(updatedUser)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/users/me', auth, async (req, res) => {

    try {

        sendEmail.sendCancelEmail(req.user.email, req.user.name)

        await req.user.remove()

        res.send(req.user)

    } catch (error) {
        res.status(500).send()
    }

})


module.exports = router;
