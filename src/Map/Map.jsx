import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const Map = () => {
    const mapContainer = useRef(null);

    useEffect(() => {
        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: "https://demotiles.maplibre.org/style.json", // Open-source tiles
            center: [0, 0], // Longitude, Latitude
            zoom: 2,
        });

        return () => map.remove(); // Cleanup on unmount
    }, []);

    return <div ref={mapContainer} style={{ width: "100%", height: "500px" }} />;
};

export default Map;
