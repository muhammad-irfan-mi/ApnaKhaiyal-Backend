const City = require('../models/city.model');
const { uploadFileToS3 } = require('../services/s3.service');

const addCities = async (req, res) => {
    try {
        const { name, locations } = req.body;

        const locationArray = Array.isArray(locations)
            ? locations
            : locations.split(',').map(loc => loc.trim());

        const imageFiles = req.files || [];
        const imageUrls = [];

        for (const file of imageFiles) {
            const url = await uploadFileToS3({
                fileBuffer: file.buffer,
                fileName: file.originalname,
                mimeType: file.mimetype,
            });
            imageUrls.push(url);
        }

        const newCity = new City({
            name,
            locations: locationArray,
            images: imageUrls,
        });

        const savedCity = await newCity.save();
        res.status(201).json(savedCity);
    } catch (error) {
        console.error('Add city error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getCities = async (req, res) => {
    try {
        const cities = await City.find().sort({ createdAt: -1 });
        res.status(200).json(cities);
    } catch (error) {
        console.error('Get cities error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addCities,
    getCities
};
