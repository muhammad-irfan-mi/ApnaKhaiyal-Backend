const News = require('../models/news.model');
const { uploadFileToS3 } = require('../services/s3.service');

const addNews = async (req, res) => {
    try {
        const { title, author, description } = req.body;

        if (!req.file || !title || !description) {
            return res.status(400).json({ message: 'All fields are required including image.' });
        }

        const uploadedImageUrl = await uploadFileToS3({
            fileBuffer: req.file.buffer,
            fileName: req.file.originalname,
            mimeType: req.file.mimetype,
        });

        const news = new News({
            title,
            author,
            description,
            imageUrl: uploadedImageUrl,
        });

        await news.save();
        res.status(201).json({ message: 'News created successfully', news });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getAllNews = async (req, res) => {
    try {
        const newsList = await News.find().sort({ createdAt: -1 });
        res.status(200).json({ message: 'All news fetched successfully', news: newsList });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch news', error: error.message });
    }
};

const getNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        const newsItem = await News.findById(id);

        if (!newsItem) {
            return res.status(404).json({ message: 'News not found' });
        }

        res.status(200).json({ message: 'News fetched successfully', news: newsItem });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch news', error: error.message });
    }
};


module.exports = {
    addNews,
    getAllNews,
    getNewsById
};
