// models/Image.js
const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
    class_index: Number,
    crop: String,
    disease: String,
    probability: Number
});

const imageSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    prediction: {
        crop: String,
        disease: String,
        confidence: Number,
        top_3_predictions: [predictionSchema]
    },
    prediction_status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
});

module.exports = mongoose.model("Image", imageSchema);
