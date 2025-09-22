// const City = require('../models/city.model');
// const { uploadFileToS3 } = require('../services/s3.service');

// const addCities = async (req, res) => {
//     try {
//         const { name, locations } = req.body;

//         const locationArray = Array.isArray(locations)
//             ? locations
//             : locations.split(',').map(loc => loc.trim());

//         const imageFiles = req.files || [];
//         const imageUrls = [];

//         for (const file of imageFiles) {
//             const url = await uploadFileToS3({
//                 fileBuffer: file.buffer,
//                 fileName: file.originalname,
//                 mimeType: file.mimetype,
//             });
//             imageUrls.push(url);
//         }

//         const newCity = new City({
//             name,
//             locations: locationArray,
//             images: imageUrls,
//         });

//         const savedCity = await newCity.save();
//         res.status(201).json(savedCity);
//     } catch (error) {
//         console.error('Add city error:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// const getCities = async (req, res) => {
//     try {
//         const cities = await City.find().sort({ createdAt: -1 });
//         res.status(200).json(cities);
//     } catch (error) {
//         console.error('Get cities error:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// module.exports = {
//     addCities,
//     getCities
// };






const Province = require("../models/city.model");
const { uploadFileToS3 } = require("../services/s3.service");

// Add or update city
const addCity = async (req, res) => {
    try {
        const { provinceName, cityName, locations } = req.body;
        if (!provinceName || !cityName || !locations) {
            return res.status(400).json({ message: "provinceName, cityName, locations required" });
        }

        const files = req.files || [];
        const imageUrls = [];

        // Upload images to S3
        for (let file of files) {
            const url = await uploadFileToS3({
                fileBuffer: file.buffer,
                fileName: `cities/${provinceName}/${cityName}-${Date.now()}.png`,
                mimeType: file.mimetype,
            });
            imageUrls.push(url);
        }

        let province = await Province.findOne({ name: provinceName });
        const locArray = locations.split(",").map(l => l.trim());

        if (!province) {
            province = new Province({
                name: provinceName,
                cities: [{ name: cityName, locations: locArray, images: imageUrls }]
            });
        } else {
            let city = province.cities.find(c => c.name === cityName);
            if (!city) {
                province.cities.push({ name: cityName, locations: locArray, images: imageUrls });
            } else {
                city.locations.push(...locArray.filter(l => !city.locations.includes(l)));
                city.images.push(...imageUrls);
            }
        }

        await province.save();
        res.json({ message: "City added/updated successfully", province });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update city
const updateCity = async (req, res) => {
    try {
        const { provinceName, oldCityName, newCityName, addLocations } = req.body; // removeLocations not needed
        const files = req.files || [];

        if (!provinceName || !oldCityName)
            return res.status(400).json({ message: "provinceName and oldCityName required" });

        const province = await Province.findOne({ name: provinceName });
        if (!province) return res.status(404).json({ message: "Province not found" });

        const city = province.cities.find(c => c.name === oldCityName);
        if (!city) return res.status(404).json({ message: "City not found" });

        // Update city name
        if (newCityName) city.name = newCityName;

        // Replace locations with addLocations (trim & remove duplicates)
        if (addLocations && Array.isArray(addLocations)) {
            const uniqueLocations = [...new Set(addLocations.map(loc => loc.trim()).filter(Boolean))];
            city.locations = uniqueLocations;
        }

        // Upload images (max 10)
        if (files.length > 0 && city.images.length < 10) {
            const availableSlots = 10 - city.images.length;
            const filesToUpload = files.slice(0, availableSlots);

            for (let file of filesToUpload) {
                const url = await uploadFileToS3({
                    fileBuffer: file.buffer,
                    fileName: `cities/${provinceName}/${city.name}-${Date.now()}.png`,
                    mimeType: file.mimetype,
                });
                city.images.push(url);
            }
        }

        await province.save();
        res.json({ message: "City updated successfully", province });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete city
const deleteCity = async (req, res) => {
    try {
        const { provinceName, cityName } = req.query; 
        if (!provinceName || !cityName)
            return res.status(400).json({ message: "provinceName and cityName required" });

        const province = await Province.findOne({ name: provinceName });
        if (!province) return res.status(404).json({ message: "Province not found" });

        province.cities = province.cities.filter(c => c.name !== cityName);
        await province.save();
        res.json({ message: "City deleted successfully", province });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all provinces and cities
const getCity = async (req, res) => {
    try {
        const provinces = await Province.find();
        res.json(provinces);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { addCity, updateCity, deleteCity, getCity };
