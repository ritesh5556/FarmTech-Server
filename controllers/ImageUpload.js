const express = require('express');
const Image = require('../models/Images'); // Adjust the path as necessary
const User = require('../models/User'); // Adjust the path as necessary
const {uploadImageToCloudinary} = require("../utils/imageUploader")

const router = express.Router();

// Upload image and associate with user
exports.ImageUpload = async (req, res) => {
    const { description } = req.body; 
    const userId = req.user.id;
    const {photo} = req.files;
    console.log("description -> ",description, " userId -:> ", userId, " Photo -> ", photo);

    try {
        
        console.log("uploading")
        const image = await uploadImageToCloudinary(
                                                     photo.tempFilePath,
                                                     process.env.FOLDER_NAME, 1000, 1000);
        
        console.log("uploaded")
        // 2. Create an Image document
        const newImage = new Image({
            image: image.url,
            description,
        });

        // 3. Save the Image document to the database
        const savedImage = await newImage.save();

        // 4. Update User with the new Image ID
        await User.findByIdAndUpdate(userId, {
            $push: { images: savedImage._id }, 
        });

        return res.status(200).json({ success: true, message: 'Image uploaded successfully', image: savedImage });
    } catch (error) {
        console.error('Error uploading image:', error);
        return res.status(500).json({ success: false, message: 'Failed to upload image' });
    }
};

exports.getImages = async (req, res) => {

    const userId = req.user.id;
    const userRole = req.user.role

  
    try {
      let images
      if(userRole == "Farmer"){
         images = await User.findById(userId).populate('images').exec();
        // console.log("images", images.images)
    
        if (!images) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
         images = images.images
         console.log("imag", images)
        return res.status(200).json({ success: true, images });
      }
      else{
         images  = await Image.find();
         console.log(images)
        
         if (!images) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
    
        return res.status(200).json({ success: true, images });
      }
       
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  };


  exports.getProfileDetails = async (req, res) => {
    console.log("here")
      try {
        const userId = req.user.id;
        console.log("userId ", userId) 
    
    
        const user = await User.findById(userId);
    
  
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found',
          });
        }
    
        // If user is found, return the profile details
        return res.status(200).json({
          success: true,
          profile: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            accountType: user.accountType,
          },
        });
      } catch (error) {
        // Handle any other errors (database errors, etc.)
        return res.status(500).json({
          success: false,
          message: 'Server Error',
          error: error.message,
        });
      }
    };
    
  

