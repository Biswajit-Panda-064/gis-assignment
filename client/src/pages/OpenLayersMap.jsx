import { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import { Vector as VectorLayer } from "ol/layer";
import OSM from "ol/source/OSM";
import { Vector as VectorSource } from "ol/source";
import { fromLonLat, toLonLat } from "ol/proj";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { Style, Circle, Fill, Stroke, Icon } from "ol/style";
import { ToastContainer, toast } from "react-toastify";
import CustomButton from "../components/CustomButton";
import DataTable from "../components/DataTable";
import MapTooltip from "../components/MapTooltip";
import {
    createPlace,
    getNearbyPlaces,
    getNearestPlace,
    getDistanceBetweenPoints,
} from "../services/apiService";

const OpenLayersMap = () => {
    const tooltipRef = useRef(null);
    const mapRef = useRef(null);
    const clickedButtonRef = useRef(null);
    const [selectedCoordinate, setSelectedCoordinate] = useState(null);
    const [radius, setRadius] = useState("");
    const [map, setMap] = useState(null);
    const [showNearbyData, setShowNearbyData] = useState(false);
    const [clickedButton, setClickedButton] = useState("");
    const [loading, setLoading] = useState(false);
    const [placeType, setPlaceType] = useState("");
    const [messageShown, setMessageShown] = useState(true);
    const [placeName, setPlaceName] = useState("");
    const [totalDistance, setTotalDistance] = useState("");
    const [isShowDataModalOpen, setIsShowDataModalOpen] = useState(false);
    const [nearestData, setNearestData] = useState({});
    const [nearbyData, setNearbyData] = useState([]);
    const [selectedPoints, setSelectedPoints] = useState([]);
    const [vectorSource] = useState(new VectorSource());

    const notify = (msg) => {
        toast.dismiss();
        toast(msg);
    };


    useEffect(() => {
        if (!mapRef?.current) return;

        const initialMap = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                new VectorLayer({
                    source: vectorSource,
                }),
            ],
            view: new View({
                center: fromLonLat([85.824812, 20.295000]),
                zoom: 15,
            }),
        });
        setMap(initialMap);

        initialMap.on("click", async (event) => {
            const coordinate = event.coordinate;
            const lonLat = toLonLat(coordinate);
            setSelectedCoordinate(lonLat);
            const clickedType = clickedButtonRef?.current;

            switch (clickedType) {
                case "add":
                case "nearby":
                    setIsShowDataModalOpen(true);
                    break;

                case "nearest":
                    await handleGetNearestPlace(lonLat[1], lonLat[0]);
                    break;

                case "distance":
                    pinLocationWithImage(null, 'distancePin', lonLat[1], lonLat[0]);

                    setSelectedPoints((prevPoints) => {
                        const newPoints = [...prevPoints, lonLat];

                        if (newPoints.length === 2) {
                            handleDistanceCalculation(
                                newPoints[0][1],
                                newPoints[0][0],
                                newPoints[1][1],
                                newPoints[1][0]
                            );
                            setMessageShown(false)
                            return [];
                        }

                        return newPoints;
                    });
                    break;

                default:
                    break;
            }
        });

        return () => initialMap.dispose();
    }, []);

    useEffect(() => {
        clickedButtonRef.current = clickedButton;
    }, [clickedButton]);

    useEffect(() => {
        if (clickedButton === "add" || clickedButton === "nearby" || clickedButton === "nearest") {
            setMessageShown(true)
            notify(`Click on the map to perform the "${clickedButton}" operation.`);
        } else if (clickedButton === "distance" && selectedPoints.length === 0 && messageShown) {
            notify("Click on the map to select the first point");
        } else if (clickedButton === "distance" && selectedPoints.length === 1) {
            notify("Click on the map to select the second point");
        }
    }, [clickedButton, selectedPoints]);


    const handleButtonClick = (actionName) => {
        setSelectedPoints([]);
        removeAllPins();

        if (["add", "nearby", "nearest", "distance"].includes(actionName)) {
            setClickedButton(actionName);
        }
    };

    const handleAddPlace = async () => {
        if (!placeName || !placeType || !selectedCoordinate) {
            notify("Name, Type, and a valid location are required");
            return;
        }

        try {
            setLoading(true);
            const response = await createPlace(
                placeName,
                placeType,
                selectedCoordinate[1],
                selectedCoordinate[0]
            );

            if (response?.status === 201 && response?.data?.id) {
                notify("New place created successfully");
                pinLocationWithImage(
                    placeName,
                    placeType,
                    selectedCoordinate[1],
                    selectedCoordinate[0]
                );
                closeModal();
            } else {
                notify("Failed to create place");
            }
        } catch (err) {
            console.error("Error adding new place:", err);
            notify("Error adding new place. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleNearbySearch = async () => {
        if (!radius) {
            notify("Input radius");
            return;
        }

        try {
            setLoading(true);
            pinLocation(null, null, selectedCoordinate[1], selectedCoordinate[0]);
            const response = await getNearbyPlaces(
                selectedCoordinate[1],
                selectedCoordinate[0],
                radius
            );

            if (response?.status === 200) {
                const data = response.data;
                setNearbyData(data);
                setShowNearbyData(true);
                notify(`Found ${data.length} nearby places`);
                data.forEach((place) =>
                    pinLocationWithImage(place.name, place.type, place.latitude, place.longitude)
                );
            }
        } catch (err) {
            console.error("Error fetching nearby places:", err);
            notify("Error fetching nearby places");
        } finally {
            setLoading(false);
        }
    };

    const handleGetNearestPlace = async (lat, lon) => {
        try {
            setLoading(true);
            const response = await getNearestPlace(lat, lon);
            if (response?.status === 200 && response?.data) {
                const place = response?.data;
                setNearestData(place);
                pinLocation(null, null, lat, lon)
                pinLocationWithImage(place?.name, place?.type, place?.latitude, place?.longitude);
                setIsShowDataModalOpen(true);
            } else if (response?.status === 200) {
                notify("no nearest place available");
            }
            else {
                notify("Failed to fetch nearest place");
            }
        } catch (err) {
            console.error("Error fetching nearest place:", err);
            notify("Error fetching nearest place");
        } finally {
            setLoading(false);
        }
    };

    const handleDistanceCalculation = async (lat1, lon1, lat2, lon2) => {
        try {
            setLoading(true);
            const response = await getDistanceBetweenPoints(lat1, lon1, lat2, lon2);
            if (response?.status === 200 && response?.data?.distance) {
                setTotalDistance(response.data.distance);
                setIsShowDataModalOpen(true);
            } else {
                notify("Failed to get distance");
            }
        } catch (err) {
            console.error("Error calculating distance:", err);
            notify("Error calculating distance");
        } finally {
            setLoading(false);
        }
    };

    const pinLocation = (name, type, lat, lon) => {
        const feature = new Feature({
            geometry: new Point(fromLonLat([lon, lat])),
            name,
            type,
        });

        feature.setStyle(
            new Style({
                image: new Circle({
                    radius: 9,
                    fill: new Fill({ color: "blue" }),
                    stroke: new Stroke({ color: "white", width: 3 }),
                }),
            })
        );
        vectorSource.addFeature(feature);
    };

    const pinLocationWithImage = (name, type, lat, lon) => {
        const feature = new Feature({
            geometry: new Point(fromLonLat([lon, lat])),
            name,
            type,
        });

        feature.setStyle(
            new Style({
                image: new Icon({
                    src: "/marker.png",
                    scale: 0.1,
                }),
            })
        );

        vectorSource.addFeature(feature);
    };

    const removeAllPins = () => {
        vectorSource.clear();
        tooltipRef.current?.hideTooltip();
    };
    const removeLocationMarker = () => {
        vectorSource.getFeatures().forEach((feature) => {
            if (feature.get("type") === "distancePin") {
                vectorSource.removeFeature(feature);
            }
        });
    };

    const closeModal = () => {
        setIsShowDataModalOpen(false);
        setShowNearbyData(false);
        setRadius("");
        setPlaceName("");
        setPlaceType("");
        setNearbyData([]);
        setNearestData({});
        setTotalDistance("");
        removeLocationMarker();
    };

    const metersToKilometers = (meters) =>
        (meters / 1000).toFixed(2) + " K.M";

    const buttonOptions = [
        { id: "add", label: "Add Location" },
        { id: "nearby", label: "Nearby Places" },
        { id: "nearest", label: "Nearest Location" },
        { id: "distance", label: "Distance Calculation" },
    ];

    return (
        <>
            <div className="w-full h-full">
                <h1 className="text-3xl font-bold text-center text-blue-600 mt-2">
                    GIS Query and Map Handling
                </h1>
                <div className="w-full flex justify-center my-4">
                    <ul className="gap-3 flex md:flex-row flex-col justify-between">
                        {buttonOptions.map((option) => (
                            <CustomButton
                                key={option.id}
                                id={option.id}
                                label={option.label}
                                selected={clickedButton}
                                onClick={handleButtonClick}
                            />
                        ))}
                    </ul>
                </div>

                <div className="w-[100%] h-[80vh] p-10">
                    <div ref={mapRef} className="w-[100%] h-[100%]" />
                    {/* Tooltip component gets map instance as prop */}
                    <MapTooltip map={map} ref={tooltipRef} />
                </div>
            </div>

            {loading && (
                <div className="fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-[9999]">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
                </div>
            )}

            {isShowDataModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg max-h-[80vh] px-4 max-w-[70%] mx-2 sm:max-w-[50%]">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-xl font-semibold">
                                {clickedButton === "add"
                                    ? "Add New Place"
                                    : clickedButton === "nearby"
                                        ? "Nearby Places"
                                        : clickedButton === "nearest"
                                            ? "Nearest Place"
                                            : "Distance"}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-900">
                                &times;
                            </button>
                        </div>

                        <div className="p-4">
                            {clickedButton === "add" ? (
                                <form className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium">Place Name</label>
                                        <input
                                            type="text"
                                            value={placeName}
                                            className="w-full border rounded-lg p-2"
                                            placeholder="Enter place name"
                                            onChange={(e) => setPlaceName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Place Type</label>
                                        <input
                                            type="text"
                                            value={placeType}
                                            className="w-full border rounded-lg p-2"
                                            placeholder="Enter place type"
                                            onChange={(e) => setPlaceType(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddPlace}
                                        className="w-full bg-blue-700 text-white rounded-lg p-2 hover:bg-blue-800"
                                    >
                                        Add Location
                                    </button>
                                </form>
                            ) : clickedButton === "nearby" ? (
                                <>
                                    <div className="flex justify-center items-center gap-2 pb-2">
                                        <label className="text-sm font-medium">Radius</label>
                                        <span>
                                            <input
                                                type="number"
                                                value={radius}
                                                className="border rounded-lg p-1 w-[60px]"
                                                placeholder="5"
                                                onChange={(e) => setRadius(e.target.value)}
                                            />
                                            <span className="text-sm pl-1">KM</span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleNearbySearch}
                                            className="bg-blue-700 text-white rounded-md p-1 px-3 hover:bg-blue-800"
                                        >
                                            Find Nearby Places
                                        </button>
                                    </div>
                                    {showNearbyData && (
                                        <>
                                            <h3 className="pb-2 font-bold">List of Nearby Places</h3>
                                            <DataTable
                                                data={nearbyData}
                                                columns={[
                                                    { header: "Place Name", accessor: "name" },
                                                    { header: "Place Type", accessor: "type" },
                                                    {
                                                        header: "Distance",
                                                        accessor: "distance",
                                                        render: metersToKilometers,
                                                    },
                                                ]}
                                            />
                                        </>
                                    )}
                                </>
                            ) : clickedButton === "nearest" ? (
                                <DataTable
                                    data={[nearestData]}
                                    columns={[
                                        { header: "Place Name", accessor: "name" },
                                        { header: "Place Type", accessor: "type" },
                                        {
                                            header: "Distance",
                                            accessor: "distance",
                                            render: metersToKilometers,
                                        },
                                    ]}
                                />
                            ) : (
                                <h3 className="text-center">
                                    Total Distance between 2 points is{" "}
                                    <span className="font-bold">
                                        {metersToKilometers(totalDistance)}
                                    </span>
                                </h3>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
        </>
    );
};

export default OpenLayersMap;