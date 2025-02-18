import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const Map = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [0, 0],
      zoom: 0,
    });

    mapRef.current = map;

    map.on('load', () => {
      const shipsData = [
        { longitude: -70, latitude: 40, mmsi: 1, name: "Ship 1" },
        { longitude: -80, latitude: 35, mmsi: 2, name: "Ship 2" },
        { longitude: -90, latitude: 80, mmsi: 3, name: "Ship 3" },
        { longitude: 70, latitude: 30, mmsi: 3, name: "Ship 4" },
        { longitude: 90, latitude: 30, mmsi: 3, name: "Ship 5" },
      ];
      updateShips(shipsData);
    });

    return () => map.remove();
  }, []);

  const updateShips = (shipsData) => {
    const map = mapRef.current;
    if (!map) return; // Make sure map is initialized

    const geojson = {
      type: "FeatureCollection",
      features: shipsData.map((ship) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [ship.longitude, ship.latitude],
        },
        properties: {
          mmsi: ship.mmsi,
          name: ship.name,
        },
      })),
    };

    if (map.getSource("ships")) {
      map.getSource("ships").setData(geojson);
    } else {
      map.addSource("ships", {
        type: "geojson",
        data: geojson,
      });

      map.addLayer({
        id: "ships-layer",
        type: "circle",
        source: "ships",
        paint: {
          "circle-radius": 5,
          "circle-color": "blue",
        },
      });
    }
  };

  return <div ref={mapContainer} style={{ width: "1300px", height: "1300px" }} />;
};

export default Map;