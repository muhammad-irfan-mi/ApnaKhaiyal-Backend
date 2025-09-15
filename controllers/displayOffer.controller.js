const DisplayOffer = require('../models/displayOffer.model');
const { uploadFileToS3 } = require('../services/s3.service');

const createDisplayOffer = async (req, res) => {
  try {
    const { name, cell, email, city, address, businessType, category } = req.body;

    if (!name || !cell || !email || !city || !address || !businessType || !category) {
      return res.status(400).json({ error: "All fields are required." });
    }
    console.log("FILES:", req.files);

    if (!req.files?.design?.[0] || !req.files?.slip?.[0]) {
      return res.status(400).json({ error: "Design and Slip images are required." });
    }


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

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

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
      expiryDate
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

const getApprovedDisplayOffer = async (req, res) => {
  try {
    const { businessType, category } = req.query;

    const filter = { status: "approved" };
    
    if (businessType) {
      filter.businessType = businessType;
    }
    if (category) {
      filter.category = category;
    }

    const offers = await DisplayOffer.find(filter);

    res.status(200).json(offers);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};



module.exports = {
  createDisplayOffer,
  updateDisplayOffer,
  getDisplayOffer,
  getApprovedDisplayOffer
}