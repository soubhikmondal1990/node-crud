const jwt = require('jsonwebtoken');
const User = require('../model/user');

const auth = async (req, res, next) => {
    try {
        const requestedToken = req.header('Authorization').replace('Bearer ', '');
        const decodedToken = jwt.verify(requestedToken, process.env.TOKEN_SIGNAMURE);

        const user = await User.findOne({_id: decodedToken._id, 'tokens.token': requestedToken});
        if(!user) {
            throw new Error();
        }
        req.user = user;
        req.token = requestedToken;
        next();
    } catch (error) {
        res.status(401).send('Not authenticated');
    }
}

module.exports = auth;
