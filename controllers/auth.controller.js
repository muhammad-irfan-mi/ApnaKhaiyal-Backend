const UserModel = require('../models/user.model')

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const handleSignUp = async (req, res) => {
    const { name, email, password, phoneNumber, roles } = req.body;

    try {
        if (!name || !email || !password || !phoneNumber || !roles) return res.status(404).json({ msg: "Please Enter Email And Password" })


        const existingUser = await UserModel.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: 'Email already exists.' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const User = new UserModel({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            roles,
        });

        const user = await User.save();
        res.status(201).json({
            msg: "User Created Successfully", user
        });

    }
    catch (error) {
        console.log(error)
        res.send({ status: "Email Already Exist" })
    }
}

// Login User
const handleLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(401).json({ msg: "Please provide both email and password" });
        }

        const User = await UserModel.findOne({ email });
        if (!User) {
            return res.status(404).json({ msg: "User not found" });
        }

        const matchPass = await bcrypt.compare(password, User.password);
        if (!matchPass) {
            return res.status(400).json({ msg: "Invalid password" });
        }

        const accessToken = jwt.sign(
            { _id: User._id, email: User.email, roles: User.roles },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('accessToken', accessToken, {
            // httpOnly: true,
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            maxAge: 24 * 60 * 60 * 7000
        });


        res.status(200).json({
            msg: "Login successful",
            accessToken: accessToken,
            user: { id: User._id, User },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

// Logout User
const handleLogout = async (req, res) => {
    try {
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
        });
        return res.status(200).json({ msg: "Logout successful" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
};

const getToken = (req, res) => {
    try {
        const token = req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({ msg: "No token found in cookies" });
        }

        res.status(200).json({ accessToken: token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};


module.exports = {
    handleSignUp,
    handleLogin,
    handleLogout,
    getToken
}