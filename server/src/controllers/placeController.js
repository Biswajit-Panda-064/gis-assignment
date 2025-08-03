const placeService = require("../services/placeService");


const createPlace = async (req, res) => {
  try {
    const { name, type, latitude, longitude } = req.body;
    const place = await placeService.createPlace(name, type, latitude, longitude);
    res.status(201).json(place);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getNearbyPlaces = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const places = await placeService.getNearbyPlaces(
      latitude,
      longitude,
      radius
    );
    res.status(200).json(places);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getNearestPlace = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    const place = await placeService.getNearestPlace(latitude, longitude);
    res.status(200).json(place);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getDistanceBetweenPoints = async (req, res) => {
  try {
    const { lat1, lon1, lat2, lon2 } = req.query;
    const distance = await placeService.getDistanceBetweenPoints(
      lat1,
      lon1,
      lat2,
      lon2
    );
    res.status(200).json({ distance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPlace, getNearbyPlaces, getNearestPlace, getDistanceBetweenPoints };
