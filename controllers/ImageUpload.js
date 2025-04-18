const express = require('express');
const Image = require('../models/Images'); // Adjust the path as necessary
const User = require('../models/User'); // Adjust the path as necessary
const {uploadImageToCloudinary} = require("../utils/imageUploader")
const axios = require('axios');

const router = express.Router();

// Function to make prediction API call
const makePrediction = async (imageUrl) => {
    try {
        const response = await axios.post('http://127.0.0.1:5000/predict', {
            image_url: imageUrl
        });
        return response.data.one_based_result;
    } catch (error) {
        console.error('Error making prediction:', error);
        throw error;
    }
};

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
        // Create an Image document with initial prediction status
        const newImage = new Image({
            image: image.url,
            description,
            prediction_status: 'pending'
        });

        // Save the Image document to the database
        const savedImage = await newImage.save();

        // Update User with the new Image ID
        await User.findByIdAndUpdate(userId, {
            $push: { images: savedImage._id }, 
        });

        // Make prediction API call in the background
        makePrediction(image.url)
            .then(async (prediction) => {
                // Update the image with prediction results
                await Image.findByIdAndUpdate(savedImage._id, {
                    prediction: {
                        crop: prediction.crop,
                        disease: prediction.disease,
                        confidence: prediction.confidence,
                        top_3_predictions: prediction.top_3_predictions
                    },
                    prediction_status: 'completed'
                });
            })
            .catch(async (error) => {
                console.error('Prediction failed:', error);
                await Image.findByIdAndUpdate(savedImage._id, {
                    prediction_status: 'failed'
                });
            });

        return res.status(200).json({ 
            success: true, 
            message: 'Image uploaded successfully. Prediction in progress.', 
            image: savedImage 
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        return res.status(500).json({ success: false, message: 'Failed to upload image' });
    }
};

exports.getImages = async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role

    try {
        let images;
        if(userRole == "Farmer"){
            const user = await User.findById(userId).populate({
                path: 'images',
                select: 'image description prediction prediction_status'
            }).exec();
            
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            
            images = user.images;
            return res.status(200).json({ 
                success: true, 
                images: images.map(img => ({
                    _id: img._id,
                    image: img.image,
                    description: img.description,
                    prediction: img.prediction,
                    prediction_status: img.prediction_status
                }))
            });
        } else {
            images = await Image.find().select('image description prediction prediction_status');
            
            if (!images) {
                return res.status(404).json({ success: false, message: 'No images found' });
            }
            
            return res.status(200).json({ 
                success: true, 
                images: images.map(img => ({
                    _id: img._id,
                    image: img.image,
                    description: img.description,
                    prediction: img.prediction,
                    prediction_status: img.prediction_status
                }))
            });
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

