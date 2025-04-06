const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming you have a User model
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

exports.signup = async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword, accountType } = req.body;

    try {

        if(!firstName || !lastName || !email || !password || !confirmPassword || !accountType){
            return res.status(400).json({
                message : "All fields are required",
            })
        }
        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword, // Store the hashed password
            accountType
        });

        // Save the user in the database
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            {   userId: newUser._id,
                email: newUser.email,
                accountType: newUser.accountTyp
            },
            process.env.JWT_SECRET, 
            { expiresIn: '1h' } 
        );

        res.status(201).json({
            message: 'User created successfully',
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;

      console.log(email, password)
  
      // Check if email and password are provided
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please fill up all the required fields",
        });
      }
  
      // Find user by email
      const user = await User.findOne({ email });
      console.log(user)
  
      // Check if user exists
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User is not registered with us. Please sign up to continue.",
        });
      }
  
      // Compare the password with the hashed password in the database
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
  
      if (isPasswordCorrect) {
        // Generate a JWT token
        const token = jwt.sign(
          { email: user.email, id: user._id, role: user.accountType },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );
  
        // Remove password from the response object
        user.password = undefined;
  
        // Set cookie for the token
        const options = {
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days expiry
          httpOnly: true, // Cookie cannot be accessed via JavaScript
        };
  
        // Return success response
        return res.cookie("token", token, options).status(200).json({
          success: true,
          token,
          user,
          message: "User login success",
        });
      } else {
        // Password does not match
        return res.status(401).json({
          success: false,
          message: "Password is incorrect",
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong during login",
      });
    }
  };

