const UserModel = require('../models/user.model')
const { uploadFileToS3 } = require('../services/s3.service');

// get user by Id 
const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

// update User by Id
const updateUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const userData = JSON.parse(req.body.data || '{}');
        const bannerFile = req.files?.['banner']?.[0] || null;
        const logoFile = req.files?.['logo']?.[0] || null;

        if (bannerFile) {
            const bannerUrl = await uploadFileToS3(bannerFile);
            userData.bannerUrl = bannerUrl;
        }
        if (logoFile) {
            const logoUrl = await uploadFileToS3(logoFile);
            userData.logoUrl = logoUrl;
        }

        const updatedUser = await UserModel.findByIdAndUpdate(id, userData, { new: true });

        if (!updatedUser) return res.status(404).json({ msg: "User not found" });

        res.status(200).json({ msg: "User updated successfully", updatedUser });
    } catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const getAllTownOwners = async (req, res) => {
    try {
        const users = await UserModel.find({ roles: 'TOWN OWNER' });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

const getAllMarketingAgencies = async (req, res) => {
    try {
        const users = await UserModel.find({ roles: 'MARKETING AGENCIES' });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};


module.exports = {
    getUserById,
    updateUserById,
    getAllTownOwners,
    getAllMarketingAgencies
}