const cron = require("node-cron");
const Ad = require("../models/Ad");
const { deleteFileFromS3 } = require("./s3.service");
const companyAd = require("../models/companyAd.model");

cron.schedule("0 * * * *", async () => {
  console.log("Running expired ads cleanup...");
  const now = new Date();
  const expiredAds = await companyAd.find({ expiryDate: { $lte: now } });

  for (const ad of expiredAds) {
    await deleteFileFromS3(ad.imageUrl);
    await companyAd.findByIdAndDelete(ad._id);
    console.log(`Deleted ad ${ad._id}`);
  }
});
