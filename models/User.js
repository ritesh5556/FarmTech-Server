const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({

    firstName : {
        type : String,
        required : true,
        trim : true,
    },

    lastName : {
        type : String,
        required : true,
        trim : true,
    },

    email : {
        type : String,
        required : true,
        trim : true,
    },

    password : {
        type : String,
        required : true,
    },

    accountType: {
        type: String,
        enum: ["Admin", "Farmer", "Expert"],
        required: true,
      },

    images : [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Image",
        },  
      ],
    
  



})

module.exports = mongoose.model("User", userSchema);