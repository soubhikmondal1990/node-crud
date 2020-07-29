const express = require('express');
const router = new express.Router();
const User = require('../model/user');
const auth = require('../middleware/auth')
const malter = require('multer');
const sharp = require('sharp');
const { sendMail } = require('../email/send-mail')

const upload = malter({
    // dest: 'images',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|bmp|jpeg)$/gm)) {
            return cb(new Error('Not supported'))
        }
        cb(undefined, true);
    }
})

router.post('/user/me/avatar', auth, upload.single('upload'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({height: 250, width:250}).png().toBuffer();
    //req.user.avatar = req.file.buffer;
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send(error.message);
})

router.delete('/user/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send()
    } catch (error) {
        res.status(400).send('Not deleted')
    }
})

// http://localhost:3000/user/5f1a46ca63cfa27720d881cf/avatar
router.get('/user/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if(!user || !user.avatar) {
            return new Error();
        }

        res.set('Content-Type', 'image/png').send(user.avatar);

    } catch (error) {
        res.status(400).send()
    }
})

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.getAuthToken();
        res.send({user, token});
    } catch (error) {
        res.status(400).send(error);
    }
})

router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        const user = await req.user.save();
        res.send('Logged out')
    } catch (error) {
        res.status(500).send(error);
    }
})

router.post('/user/logout-all', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send('Logged out from all')
    } catch (error) {
        res.status(500).send(error);
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
})

// ADMIN USE ONLY
router.get('/users', async (req, res) => {
    try {
        const user = await User.find({})
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
})

router.get('/user/:id', async (req, res) => {
    try {
        const _id = req.params.id;
        const data = await User.findById(_id);
        if (!data) {
            return res.status(404).send()
        }
        res.send(data)
    } catch (error) {
        res.status(500).send(error);
    }
})

router.post('/user', async (req, res) => {
    try {
        const user = new User(req.body);
        const token = await user.getAuthToken();
        const data = await user.save();
        sendMail(user.email, user.name)
        res.status(201).send({user: data, token})
    } catch (error) {
        res.status(400).send(error);   
    }
})

// USE BY ADMIN ONLY
// router.delete('/user/:id', async (req, res) => {
//     try {
//         const user = await User.findByIdAndDelete(req.params.id);
//         if(!user) {
//             return res.status(404).send();
//         }

//         res.send(user)
//     } catch (error) {
//         res.status(400).send();
//     }
// })

router.delete('/user/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    } catch (error) {
        res.status(400).send();
    }
})

router.patch('/user/me', auth, async (req, res) => {
    const allowedKeys = ['name', 'email', 'password', 'age'];
    const fetchedKeys = Object.keys(req.body);

    const isNotAllowed = Boolean(fetchedKeys.find((key) => !allowedKeys.includes(key)))

    if(isNotAllowed) {
      return res.status(400).send({ error: 'invalid keys'})
    }

    try {
        const user = req.user;
        fetchedKeys.forEach(key => user[key] = req.body[key]);
        await user.save()
        // const user = await User.findByIdAndUpdate(_id, req.body, {runValidators: true, new: true});
        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
})

// router.patch('/user/:id', async (req, res) => {
//     const _id = req.params.id;
//     const allowedKeys = ['name', 'email', 'password', 'age'];
//     const fetchedKeys = Object.keys(req.body);

//     const isNotAllowed = Boolean(fetchedKeys.find((key) => !allowedKeys.includes(key)))

//     if(isNotAllowed) {
//       return res.status(400).send({ error: 'invalid keys'})
//     }

//     try {
//         let user = await User.findById(_id);
//         fetchedKeys.forEach(key => user[key] = req.body[key]);
//         await user.save()
//         // const user = await User.findByIdAndUpdate(_id, req.body, {runValidators: true, new: true});
//         if(!user) {
//             return res.status(404).send();
//         }
//         res.send(user);
//     } catch (error) {
//         res.status(400).send(error);
//     }
// })

module.exports = router;
