const mongoose = require("mongoose");
let bcrypt = require('bcrypt')
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true
    },

    password: {
      type: String,
      required: [true, "Password is required"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true
    },

    fullName: {
      type: String,
      default: ""
    },

    avatarUrl: {
      type: String,
      default: "https://i.sstatic.net/l60Hf.png"
    },

    status: {
      type: Boolean,
      default: false
    },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "role",
      required: true
    },

    loginCount: {
      type: Number,
      default: 0,
      min: [0, "Login count cannot be negative"]
    },
    lockTime: Date,
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', function () {
  if (this.isModified("password")) {
    let salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
  }
})
userSchema.pre('findOneAndUpdate', function () {
  let salt = bcrypt.genSaltSync(10);
  if (this._update.password) {
    this._update.password = bcrypt.hashSync(this._update.password, salt);
  }
})
module.exports = mongoose.model("user", userSchema);