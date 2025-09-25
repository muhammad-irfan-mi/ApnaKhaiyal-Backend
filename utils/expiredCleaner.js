const cron = require("node-cron");
const UserModel = require("../models/user.model");
const propertyModel = require("../models/property.model");
const { deleteFileFromS3 } = require("../services/s3.service");

cron.schedule("0 * * * *", async () => {
    const now = new Date();

    try {
        const expiredProps = await propertyModel.find({ expiresAt: { $lt: now } });
        for (let prop of expiredProps) {
            for (let imgUrl of prop.images) await deleteFileFromS3(imgUrl);
            await propertyModel.findByIdAndDelete(prop._id);
            console.log(`Deleted expired property: ${prop._id}`);
        }
    } catch (err) {
        console.error("Error cleaning expired properties:", err);
    }

    try {
        const expiredUsers = await UserModel.find({ planExpiry: { $lte: now } });
        for (const user of expiredUsers) {
            user.listingQuota = 0;
            user.featureQuota = 0;
            user.topQuota = 0;
            user.planExpiry = null;
            user.isFreePlan = false;
            await user.save();
            console.log(`Reset quotas for user: ${user._id}`);
        }
    } catch (err) {
        console.error("Error resetting expired user quotas:", err);
    }
});
