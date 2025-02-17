import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const Map = () => {
    const mapContainer = useRef(null);
    const [lngLat, setLngLat] = useState({ lng: 10, lat: 10 }); 

    useEffect(() => {
        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: "https://demotiles.maplibre.org/style.json",
            center: [0, 0],
            zoom: 0,
        });

        const marker = new maplibregl.Marker({ draggable: true })
            .setLngLat([lngLat.lng, lngLat.lat]) 
            .addTo(map);

        marker.on("dragend", () => {
            const lngLat = marker.getLngLat();
            setLngLat({ lng: lngLat.lng, lat: lngLat.lat });
            console.log(`Longitude: ${lngLat.lng}, Latitude: ${lngLat.lat}`); 
        });

        return () => map.remove();
    }, []); 

    return (
        <div>
            <div ref={mapContainer} style={{ width: "1700px", height: "1700px" }} />
            <div id="coordinates">
                Longitude: {lngLat.lng}, Latitude: {lngLat.lat} {}
            </div>
        </div>
    );
};

export default Map;