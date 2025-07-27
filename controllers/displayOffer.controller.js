const DisplayOffer = require('../models/displayOffer.model');
const { uploadFileToS3 } = require('../services/s3.service');

const createDisplayOffer = async (req, res) => {
  try {
    const { name, cell, email, city, address, businessType, category } = req.body;

    const designImage = await uploadFileToS3({
      fileBuffer: req.files.design[0].buffer,
      fileName: req.files.design[0].originalname,
      mimeType: req.files.design[0].mimetype,
    });
    const paymentSlip = await uploadFileToS3({
      fileBuffer: req.files.slip[0].buffer,
      fileName: req.files.slip[0].originalname,
      mimeType: req.files.slip[0].mimetype,
    });



    const offer = await DisplayOffer.create({
      name,
      cell,
      email,
      city,
      address,
      businessType,
      category,
      designImageUrl: designImage,
      paymentSlipUrl: paymentSlip,
    });

    res.status(201).json(offer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateDisplayOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const post = await DisplayOffer.findById(id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.status = status;
    post.expiryDate = status === 'approved' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined;

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDisplayOffer = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const offer = await DisplayOffer.find(filter);
    res.json(offer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  createDisplayOffer,
  updateDisplayOffer,
  getDisplayOffer
}