const property = require("../models/property.model");
const { uploadFileToS3 } = require("../services/s3.service");

const addProperty = async (req, res) => {
    try {
        const { adType, category, title, description, pricingOption, priceType, price, maxPrice, tags, features, videoURL, state, zip, address, phone, whatsapp, email, website, lat, lng
        } = req.body;

        // const imageUrls = req.files.map(file => file.location);

        const priceField = pricingOption === "price_range" ? [price, maxPrice] : price;

        const newProperty = new property({
            adType,
            category,
            title,
            description,
            pricingOption,
            priceType,
            price: priceField,
            tags: tags?.split(",").map(t => t.trim()),
            features: features?.split("\n"),
            videoURL,
            contact: { state, zip, address, phone, whatsapp, email, website },
            lat,
            lng,
            images: [],
        });

        // await newAd.save();

        const uploadedImageUrls = await Promise.all(
            req.files.map((file, index) => {
                const ext = file.originalname.split(".").pop();
                const fileName = `ads/${newProperty._id.toString()}/image_${index}.${ext}`;
                return uploadFileToS3({
                    fileBuffer: file.buffer,
                    fileName,
                    mimeType: file.mimetype,
                });
            })
        );

        newProperty.images = uploadedImageUrls;
        await newProperty.save();

        res.status(201).json({ message: "Ad posted successfully", property: newProperty });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error });
    }
};

const incrementView = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const propertyDoc = await property.findById(id);
        if (!propertyDoc) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // If user hasn't viewed yet
        if (!propertyDoc.viewedBy.includes(userId)) {
            propertyDoc.views += 1;
            propertyDoc.viewedBy.push(userId);
            await propertyDoc.save();
        }

        res.status(200).json({ views: propertyDoc.views });
    } catch (error) {
        console.error('Error updating view:', error);
        res.status(500).json({ message: 'Error updating view', error });
    }
};

const getProperty = async (req, res) => {
    try {
        const properties = await property.find().sort({ createdAt: -1 });
        res.status(200).json(properties);
    } catch (error) {
        console.error('Error fetching ads:', error);
        res.status(500).json({ message: 'Failed to fetch ads', error });
    }
};

const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;

        const propertyDoc = await property.findById(id);
        if (!propertyDoc) {
            return res.status(404).json({ message: "Property not found" });
        }

        res.status(200).json(propertyDoc);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error });
    }
};


module.exports = {
    addProperty,
    incrementView,
    getProperty,
    getPropertyById
};
