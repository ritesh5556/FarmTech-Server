// Import the required modules
const express = require("express")
const router = express.Router()
const {auth} = require("../middleware/auth")

const {getImages
    ,ImageUpload,
    getProfileDetails } = require("../controllers/ImageUpload")


router.get("/getImage", auth, getImages)

// Route for user signup
router.post("/image", auth, ImageUpload);
router.get("/profile",auth, getProfileDetails)

module.exports = router