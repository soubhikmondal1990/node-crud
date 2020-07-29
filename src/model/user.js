const mongoose = require('mongoose');
const validator = require ('validator');
const bcrypy = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../model/task')

const userSchema = new mongoose.Schema({
  name: {
      type: String,
      require: true,
      trim: true
  },
  age: {
      type: Number,
      default: 1,
      validate(value) {
        if(value <= 0) {
            throw new Error('Not a valid age')
        }
      }
  },
  email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      validate(value) {
        if(!validator.isEmail(value)) {
          throw new Error('Not a valid email')
        }
      }
  },
  password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      validate(value) {
        if(value.toLowerCase().includes('password')) {
              throw new Error('Not valid password')
        }
      }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer
  }
}, {
  timestamps: true
})

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.tokens;
  delete user.password;
  delete user.avatar;
  return user;
}

userSchema.methods.getAuthToken = async function() {
    const user = this;
    const token = jwt.sign({_id: String(user._id)}, process.env.TOKEN_SIGNAMURE, {expiresIn: '1 day'});

    user.tokens = user.tokens.concat({token})
    await user.save();

    return token;
}

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({email});

  if (!user) {
    throw new Error('User not found');
  }

  isMatch = await bcrypy.compare(password, user.password);

  if(!isMatch) {
    throw new Error('User password not correct');
  }

  return user;
}

userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypy.hash(user.password, 8)
  }
  next();
})

userSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany({owner: user._id})
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;
