const mongoose = require('mongoose');

const connectDB = async (mongoURL) => {
  try {
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, 
      tlsAllowInvalidCertificates: true,
    });
    console.log("✅ MongoDB Connected Successfully!");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
  }
};

module.exports = connectDB;
