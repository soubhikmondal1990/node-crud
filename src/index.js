const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks');
// Co5vmoKDJEyJzM9W
// mongodb+srv://taskmanager:<password>@cluster0.fxuex.mongodb.net/test
const app = express();

const PORT = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(PORT, () => {
    console.log('Server started...', PORT)
})
