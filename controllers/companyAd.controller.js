const companyAd = require("../models/companyAd.model");
const { uploadFileToS3, deleteFileFromS3 } = require("../services/s3.service");

const createAd = async (req, res) => {
  try {
    const { category, expiryDate } = req.body;
    const adfile = req.file;

    if (!adfile) return res.status(400).json({ error: "Image is required" });

    const ext = adfile.originalname.split(".").pop();
    const fileName = `ads/${Date.now()}.${ext}`;

    const adUrl = await uploadFileToS3({
      fileBuffer: adfile.buffer,
      fileName,
      mimeType: adfile.mimetype,
    });

    const newAd = await companyAd.create({
      category,
      imageUrl: adUrl,
      expiryDate,
    });

    res.json(newAd);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAds = async (req, res) => {
  try {
    const ads = await companyAd.find();
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteExpiredAds = async (req, res) => {
  try {
    const now = new Date();
    const expiredAds = await companyAd.find({ expiryDate: { $lte: now } });

    for (const ad of expiredAds) {
      await deleteFileFromS3(ad.imageUrl);
      await companyAd.findByIdAndDelete(ad._id);
    }

    res.json({ message: "Expired ads deleted", count: expiredAds.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
    createAd,
    getAds,
    deleteExpiredAds
}