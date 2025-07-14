const Town = require("../models/town.model");
const { uploadFileToS3 } = require("../services/s3.service");

const addTown = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    const { name, desc, area, address, city, userId, phases } = req.body;

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
      address,
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

const updatePlotStatusAndDealer = async (req, res) => {
  const { plotNumberId } = req.params;
  const { status, dealerName, dealerContact } = req.body;

  try {
    const town = await Town.findOne({
      "phases.plots.plotNumbers._id": plotNumberId
    });

    if (!town) return res.status(404).json({ error: "Plot number not found" });

    let plotNumber;

    // Traverse nested structure
    for (const phase of town.phases) {
      for (const plot of phase.plots) {
        const pNum = plot.plotNumbers.id(plotNumberId);
        if (pNum) {
          plotNumber = pNum;

          if (status) {
            plotNumber.status = status;
          }
          if (dealerName !== undefined) plotNumber.dealerName = dealerName;
          if (dealerContact !== undefined) plotNumber.dealerContact = dealerContact;

          await town.save();
          return res.json({ message: "Plot updated", plotNumber });
        }
      }
    }

    res.status(404).json({ error: "Plot number not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/plots/:townId/:phaseId/:plotId/:plotNumberId/dealer
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

module.exports = {
  addTown,
  getAllTowns,
  getTownsByUser,
  getTownById,
  updatePlotStatusAndDealer,
  deleteDealerfromPlot
};
