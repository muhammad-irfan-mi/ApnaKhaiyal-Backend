const Town = require("../models/town.model");
const { uploadFileToS3 } = require("../services/s3.service");

const addTown = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    const { name, desc, area, city, userId, phases } = req.body;

    const locationMapUrl = req.files?.locationMap?.[0]
      ? await uploadFileToS3({
        fileBuffer: req.files.locationMap[0].buffer,
        fileName: req.files.locationMap[0].originalname,
        mimeType: req.files.locationMap[0].mimetype,
      })
      : null;

    const nocUrl = req.files?.nocRegistry?.[0]
      ? await uploadFileToS3({
        fileBuffer: req.files.nocRegistry[0].buffer,
        fileName: req.files.nocRegistry[0].originalname,
        mimeType: req.files.nocRegistry[0].mimetype,
      })
      : null;

    const documentUrls = [];
    if (req.files?.documents) {
      for (const doc of req.files.documents) {
        const url = await uploadFileToS3({
          fileBuffer: doc.buffer,
          fileName: doc.originalname,
          mimeType: doc.mimetype,
        });
        documentUrls.push(url);
      }
    }

    const parsedPhases = phases ? JSON.parse(phases) : [];

    for (let i = 0; i < parsedPhases.length; i++) {
      const phase = parsedPhases[i];

      // Upload images
      const images = [];
      const imageFiles = req.files[`phaseImages${i}`];
      if (imageFiles?.length) {
        for (const img of imageFiles) {
          const imgUrl = await uploadFileToS3({
            fileBuffer: img.buffer,
            fileName: img.originalname,
            mimeType: img.mimetype,
          });
          images.push({ path: imgUrl });
        }
      }

      // Upload video
      const videoFile = req.files[`phaseVideo${i}`]?.[0];
      let videoUrl = "";
      if (videoFile) {
        videoUrl = await uploadFileToS3({
          fileBuffer: videoFile.buffer,
          fileName: videoFile.originalname,
          mimeType: videoFile.mimetype,
        });
      }

      if (typeof phase.plots === "string") {
        phase.plots = JSON.parse(phase.plots);
      }

      phase.images = images;
      phase.video = videoUrl;
    }

    const newTown = new Town({
      userId: id,
      name,
      desc,
      area,
      city,
      location: locationMapUrl,
      noc: nocUrl,
      documents: documentUrls,
      phases: parsedPhases,
    });

    await newTown.save();

    res.status(201).json({ message: "Town created", town: newTown });
  } catch (err) {
    console.error("Error adding town:", err);
    res.status(500).json({ error: err.message });
  }
};

const getAllTowns = async (req, res) => {
  try {
    const towns = await Town.find();
    res.status(200).json({ message: "All towns fetched", towns });
  } catch (err) {
    console.error("Error fetching towns:", err);
    res.status(500).json({ error: err.message });
  }
};

const getTownsByUser = async (req, res) => {
  const { id } = req.params;
  try {
    const towns = await Town.find({ userId: id });
    res.status(200).json({ message: "All towns fetched", towns });
  } catch (err) {
    console.error("Error fetching towns:", err);
    res.status(500).json({ error: err.message });
  }
};

const getTownById = async (req, res) => {
  try {
    const { id } = req.params;

    const town = await Town.findById(id);

    if (!town) {
      return res.status(404).json({ message: "Town not found" });
    }

    res.status(200).json({
      message: "Town data fetched successfully",
      town,
    });
  } catch (err) {
    console.error("Error fetching town:", err);
    res.status(500).json({ error: err.message });
  }
};

// update plot stauts and delaer info
// const updatePlotStatusAndDealer = async (req, res) => {
//   const { plotNumberId } = req.params;
//   const { status, dealerName, dealerContact } = req.body;

//   try {
//     const town = await Town.findOne({
//       "phases.plots.plotNumbers._id": plotNumberId
//     });

//     if (!town) return res.status(404).json({ error: "Plot number not found" });

//     let plotNumber;

//     for (const phase of town.phases) {
//       for (const plot of phase.plots) {
//         const pNum = plot.plotNumbers.id(plotNumberId);
//         if (pNum) {
//           plotNumber = pNum;

//           if (status) {
//             plotNumber.status = status;
//           }
//           if (dealerName !== undefined) plotNumber.dealerName = dealerName;
//           if (dealerContact !== undefined) plotNumber.dealerContact = dealerContact;

//           await town.save();
//           return res.json({ message: "Plot updated", plotNumber });
//         }
//       }
//     }

//     res.status(404).json({ error: "Plot number not found" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const updatePropertyStatusAndDealer = async (req, res) => {
  const { propertyId } = req.params;
  const { status, dealerName, dealerContact } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ error: "Invalid property ID format" });
    }

    const id = new mongoose.Types.ObjectId(propertyId);

    // Find the town that contains either a plot or shop with this ID
    const town = await Town.findOne({
      $or: [
        { "phases.plots.plotNumbers._id": id },
        { "phases.shops.shopNumbers._id": id },
      ],
    });

    if (!town) {
      return res.status(404).json({ error: "Property (plot/shop) not found" });
    }

    let propertyType = null;
    let propertyRef = null;

    for (const phase of town.phases) {
      // Search in plots
      for (const plot of phase.plots) {
        const foundPlot = plot.plotNumbers.id(id);
        if (foundPlot) {
          propertyType = "plot";
          propertyRef = foundPlot;
          break;
        }
      }

      // Search in shops if not found in plots
      if (!propertyRef && Array.isArray(phase.shops)) {
        for (const shop of phase.shops) {
          const foundShop = shop.shopNumbers.id(id);
          if (foundShop) {
            propertyType = "shop";
            propertyRef = foundShop;
            break;
          }
        }
      }

      if (propertyRef) break;
    }

    if (!propertyRef) {
      return res.status(404).json({ error: "Property (plot/shop) not found" });
    }

    // Update only provided fields
    if (status !== undefined) propertyRef.status = status;
    if (dealerName !== undefined) propertyRef.dealerName = dealerName;
    if (dealerContact !== undefined) propertyRef.dealerContact = dealerContact;

    await town.save();

    res.json({
      message: `${propertyType === "shop" ? "Shop" : "Plot"} updated successfully`,
      property: propertyRef,
    });
  } catch (err) {
    console.error("Error updating property:", err);
    res.status(500).json({ error: err.message });
  }
};

const deleteDealerfromPlot = async (req, res) => {
  const { plotNumberId } = req.params;

  try {
    const town = await Town.findOne({
      "phases.plots.plotNumbers._id": plotNumberId
    });

    if (!town) return res.status(404).json({ error: "Plot number not found" });

    let plotNumber;

    for (const phase of town.phases) {
      for (const plot of phase.plots) {
        const pNum = plot.plotNumbers.id(plotNumberId);
        if (pNum) {
          pNum.dealerName = "";
          pNum.dealerContact = "";

          await town.save();
          return res.json({ message: "Dealer info deleted", plotNumber: pNum });
        }
      }
    }

    res.status(404).json({ error: "Plot number not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assumes: const Town = require('../models/town.model');
// and uploadFileToS3(fileBuffer, fileName, mimeType) available

const updateTownById = async (req, res) => {
  try {
    const { id } = req.params;

    let town = await Town.findById(id);
    if (!town) {
      return res.status(404).json({ message: "Town not found" });
    }

    const { name, desc, area, address, city, phases } = req.body;

    if (name) town.name = name;
    if (desc) town.desc = desc;
    if (area) town.area = area;
    if (address) town.address = address;
    if (city) town.city = city;

    if (req.files?.locationMap?.[0]) {
      const url = await uploadFileToS3({
        fileBuffer: req.files.locationMap[0].buffer,
        fileName: req.files.locationMap[0].originalname,
        mimeType: req.files.locationMap[0].mimetype,
      });
      town.location = url;
    }

    if (req.files?.nocRegistry?.[0]) {
      const url = await uploadFileToS3({
        fileBuffer: req.files.nocRegistry[0].buffer,
        fileName: req.files.nocRegistry[0].originalname,
        mimeType: req.files.nocRegistry[0].mimetype,
      });
      town.noc = url;
    }

    if (req.files?.documents?.length) {
      for (const doc of req.files.documents) {
        const url = await uploadFileToS3({
          fileBuffer: doc.buffer,
          fileName: doc.originalname,
          mimeType: doc.mimetype,
        });
        town.documents.push(url);
      }
    }

    if (phases) {
      const parsedPhases = typeof phases === "string" ? JSON.parse(phases) : phases;

      for (let i = 0; i < parsedPhases.length; i++) {
        const phaseUpdate = parsedPhases[i];
        let phase;

        if (phaseUpdate._id) {
          // Update existing phase
          phase = town.phases.id(phaseUpdate._id);
          if (!phase) continue; // skip invalid ID
        } else {
          // Create new phase
          phase = { name: phaseUpdate.name || `Phase-${Date.now()}`, plots: [], shops: [], images: [] };
          town.phases.push(phase);
          phase = town.phases[town.phases.length - 1]; // reference to new phase
        }

        // ✅ Update name if provided
        if (phaseUpdate.name) phase.name = phaseUpdate.name;

        // ✅ Update plots/shops if provided
        if (phaseUpdate.plots) phase.plots = phaseUpdate.plots;
        if (phaseUpdate.shops) phase.shops = phaseUpdate.shops;

        // ✅ Handle images (max 20)
        const existingCount = phase.images.length;
        const newFiles = req.files[`phaseImages${i}`] || [];
        const remainingSlots = 20 - existingCount;

        if (newFiles.length > 0) {
          if (remainingSlots <= 0) {
            return res.status(400).json({
              error: `Phase "${phase.name}" already has maximum 20 images`,
            });
          }

          const filesToUpload = newFiles.slice(0, remainingSlots);
          for (const img of filesToUpload) {
            const imgUrl = await uploadFileToS3({
              fileBuffer: img.buffer,
              fileName: img.originalname,
              mimeType: img.mimetype,
            });
            phase.images.push({ path: imgUrl });
          }
        }

        // ✅ Handle video (only one allowed per phase)
        const videoFile = req.files[`phaseVideo${i}`]?.[0];
        if (videoFile) {
          if (phase.video) {
            return res.status(400).json({
              error: `Phase "${phase.name}" already has a video. Cannot upload another.`,
            });
          }
          const videoUrl = await uploadFileToS3({
            fileBuffer: videoFile.buffer,
            fileName: videoFile.originalname,
            mimeType: videoFile.mimetype,
          });
          phase.video = videoUrl;
        }
      }
    }

    await town.save();
    res.json({ message: "Town updated successfully", town });
  } catch (err) {
    console.error("Error updating town:", err);
    res.status(500).json({ error: err.message });
  }
};


const deleteTownById = async (req, res) => {
  try {
    const { id } = req.params;

    const town = await Town.findByIdAndDelete(id);
    if (!town) {
      return res.status(404).json({ message: "Town not found" });
    }

    res.json({ message: "Town deleted successfully" });
  } catch (err) {
    console.error("Error deleting town:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addTown,
  getAllTowns,
  getTownsByUser,
  getTownById,
  // updatePlotStatusAndDealer,
  updatePropertyStatusAndDealer,
  deleteDealerfromPlot,
  updateTownById,
  deleteTownById
};
