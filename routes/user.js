// Import the required modules
const express = require("express")
const router = express.Router()
const {auth} = require("../middleware/auth")

const {
    login,
    signup,
  
  } = require("../controllers/Auth");


// ****************************** Authentication Routes ******************************

// Route for user login
router.post("/login", login)

// Route for user signup
router.post("/signup", signup)








module.exports = router