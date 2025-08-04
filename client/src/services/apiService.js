import axios from "axios";

const API_URL = "http://13.201.131.191/api";


export const createPlace = async (name, type, lat, lon) => {
    const response = await axios.post(`${API_URL}/places`, {
        name,
        type,
        latitude: lat,
        longitude: lon,
    });
    return response;
};


export const getNearbyPlaces = async (lat, lon, radius) => {
    const response = await axios.get(
        `${API_URL}/places/nearby?latitude=${lat}&longitude=${lon}&radius=${radius * 1000}`
    );
    return response;
};


export const getNearestPlace = async (lat, lon) => {
    const response = await axios.get(
        `${API_URL}/places/nearest?latitude=${lat}&longitude=${lon}`
    );
    return response;
};


export const getDistanceBetweenPoints = async (lat1, lon1, lat2, lon2) => {
    const response = await axios.get(
        `${API_URL}/places/distance?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}`
    );
    return response;
};
