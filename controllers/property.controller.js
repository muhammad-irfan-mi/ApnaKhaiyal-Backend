const propertyModel = require("../models/property.model");
const property = require("../models/property.model");
const UserModel = require("../models/user.model");
const { uploadFileToS3 } = require("../services/s3.service");

const addProperty = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { adType, category, title, description, pricingOption, priceType, price, maxPrice, tags, features, videoURL, province, city, location, zip, address, phone, whatsapp, email, website, lat, lng, expireDuration, listingType
        } = req.body;

        if (listingType === "listing" && user.listingQuota <= 0) {
            return res.status(403).json({ message: "Listing Limit exceeded" });
        }
        if (listingType === "featured" && user.featureQuota <= 0) {
            return res.status(403).json({ message: "Featured Limit exceeded" });
        }
        if (listingType === "top" && user.topQuota <= 0) {
            return res.status(403).json({ message: "Top Limit exceeded" });
        }

        if (user.roles === "INDIVIDUAL ACCOUNT") {
            const soldCount = await property.countDocuments({
                userId,
                isSold: false
            });

            if (soldCount >= 3) {
                return res.status(403).json({
                    message: "You cannot add more properties. Limit reached (3 sold)."
                });
            }
        }

        const priceField = pricingOption === "price_range" ? [price, maxPrice] : price;

        const newProperty = new property({
            userId: userId,
            adType,
            category,
            title,
            description,
            pricingOption,
            priceType,
            price: priceField,
            tags: tags ? tags.split(",").map(t => t.trim()) : [],
            features: features ? features.split("\n") : [],
            videoURL,
            contact: {
                province: province || '',
                city: city || '',
                location: location || '',
                zip: zip || '',
                address: address || '',
                phone: phone || '',
                whatsapp: whatsapp || '',
                email: email || '',
                website: website || ''
            },
            lat: lat ? parseFloat(lat) : null,
            lng: lng ? parseFloat(lng) : null,
            images: [],
            listingType: listingType || "listing",
            status: "pending",
            expiresAt: new Date(Date.now() + (expireDuration ? parseInt(expireDuration, 10) : 7 * 24 * 60 * 60 * 1000))
        });

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

        if (listingType === "listing") user.listingQuota -= 1;
        if (listingType === "featured") user.featureQuota -= 1;
        if (listingType === "top") user.topQuota -= 1;
        
        user.totalListings += 1;
        user.pendingListings += 1;
        await user.save();

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
        const properties = await property.find({ status: "approved" }).sort({ createdAt: -1 });
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

const getPropertyByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const properties = await property.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json(properties);

    } catch (error) {
        res.send({ msg: "INternal Server Error" })
    }
}

const getPropertyByAdmin = async (req, res) => {
    try {
        const properties = await property.find({}).sort({ createdAt: -1 });
        res.status(200).json(properties);
    } catch (error) {
        console.error('Error fetching ads:', error);
        res.status(500).json({ message: 'Failed to fetch ads', error });
    }
};

const updatePropertyStatusByAdmin = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { status, expireDuration } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const property = await propertyModel.findById(propertyId);
        if (!property) return res.status(404).json({ message: "Property not found" });

        const user = await UserModel.findById(property.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Update user counters
        if (property.status === "pending") {
            user.pendingListings -= 1;
        }
        if (status === "approved") {
            user.publishedListings += 1;
        }

        property.status = status;

        if (expireDuration) {
            property.expiresAt = new Date(Date.now() + expireDuration);
        }

        await property.save();
        await user.save();

        res.status(200).json({ message: "Status updated", property, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error });
    }
};

const updatePropertyById = async (req, res) => {
    try {
        const { id } = req.params;

        let existingProperty = await property.findById(id);
        if (!existingProperty) {
            return res.status(404).json({ message: "Property not found" });
        }

        const {
            adType,
            category,
            title,
            description,
            pricingOption,
            priceType,
            price,
            maxPrice,
            tags,
            features,
            videoURL,
            state,
            zip,
            address,
            phone,
            whatsapp,
            email,
            website,
            lat,
            lng,
            isSold,
        } = req.body;

        if (adType) existingProperty.adType = adType;
        if (category) existingProperty.category = category;
        if (title) existingProperty.title = title;
        if (description) existingProperty.description = description;
        if (pricingOption) existingProperty.pricingOption = pricingOption;
        if (priceType) existingProperty.priceType = priceType;

        if (typeof isSold !== "undefined") {
            existingProperty.isSold = isSold;
        }
        if (pricingOption === "price_range" && (price || maxPrice)) {
            existingProperty.price = [
                price ?? existingProperty.price?.[0],
                maxPrice ?? existingProperty.price?.[1],
            ];
        } else if (price) {
            existingProperty.price = price;
        }

        if (tags) existingProperty.tags = tags.split(",").map(t => t.trim());
        if (features) existingProperty.features = features.split("\n");

        if (videoURL) existingProperty.videoURL = videoURL;

        // Contact updates
        if (state) existingProperty.contact.state = state;
        if (zip) existingProperty.contact.zip = zip;
        if (address) existingProperty.contact.address = address;
        if (phone) existingProperty.contact.phone = phone;
        if (whatsapp) existingProperty.contact.whatsapp = whatsapp;
        if (email) existingProperty.contact.email = email;
        if (website) existingProperty.contact.website = website;

        // Lat/lng
        if (lat) existingProperty.lat = lat;
        if (lng) existingProperty.lng = lng;

        // Handle image uploads (with 15 max limit)
        if (req.files && req.files.length > 0) {
            const currentImageCount = existingProperty.images.length;

            if (currentImageCount >= 15) {
                return res.status(400).json({
                    message: "You cannot upload more than 15 images for a property",
                });
            }

            // calculate remaining allowed
            const remainingSlots = 15 - currentImageCount;
            const filesToUpload = req.files.slice(0, remainingSlots);

            const uploadedImageUrls = await Promise.all(
                filesToUpload.map((file, index) => {
                    const ext = file.originalname.split(".").pop();
                    const fileName = `ads/${existingProperty._id.toString()}/image_${Date.now()}_${index}.${ext}`;
                    return uploadFileToS3({
                        fileBuffer: file.buffer,
                        fileName,
                        mimeType: file.mimetype,
                    });
                })
            );

            existingProperty.images = [...existingProperty.images, ...uploadedImageUrls];
        }

        // Save changes
        await existingProperty.save();

        res.status(200).json({
            message: "Property updated successfully",
            property: existingProperty,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error });
    }
};

const deletePropertyById = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedProperty = await property.findByIdAndDelete(id);

        if (!deletedProperty) {
            return res.status(404).json({ message: "Property not found" });
        }

        res.status(200).json({ message: "Property deleted successfully" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: "Something went wrong", error });
    }
};

module.exports = {
    addProperty,
    incrementView,
    getProperty,
    getPropertyById,
    getPropertyByUser,
    getPropertyByAdmin,
    updatePropertyStatusByAdmin,
    updatePropertyById,
    deletePropertyById
};
