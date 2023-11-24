let mongoose = require("mongoose");
let user = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    mobile: {
      type: String,
      require: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["M", "F"],
    },
    dob: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports= mongoose.model("user",user)