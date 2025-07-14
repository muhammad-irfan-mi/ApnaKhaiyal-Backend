const Profile = require('../models/profileModel');
const { uploadToS3 } = require('../utils/s3Upload');

// Create a new profile
const createProfile = async (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        const bannerFile = req.files['banner'] ? req.files['banner'][0] : null;
        const logoFile = req.files['logo'] ? req.files['logo'][0] : null;

        // Upload files to S3
        const [bannerUrl, logoUrl] = await Promise.all([
            bannerFile ? uploadToS3(bannerFile) : Promise.resolve(null),
            logoFile ? uploadToS3(logoFile) : Promise.resolve(null)
        ]);

        // Create profile in database
        const profile = new Profile({
            ...data,
            bannerUrl,
            logoUrl
        });

        await profile.save();

        res.status(201).json({
            message: 'Profile created successfully',
            profile
        });
    } catch (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({ error: 'Failed to create profile' });
    }
};

// Get all profiles
const getAllProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find().sort({ createdAt: -1 });
        res.json(profiles);
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({ error: 'Failed to fetch profiles' });
    }
};

// Get single profile
const getProfile = async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

module.exports = {
    createProfile,
    getAllProfiles,
    getProfile
}