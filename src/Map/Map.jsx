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
    if (!map) return;

    // Remove existing markers before adding new ones.  Important for updates!
    if (map.getSource("ships")) {
        map.removeLayer("ships-layer");
        map.removeSource("ships");
    }


    shipsData.forEach(ship => {
      const marker = new maplibregl.Marker()
        .setLngLat([ship.longitude, ship.latitude])
        .setPopup(new maplibregl.Popup({ offset: 25 }) // add popups
          .setHTML(`<h3>${ship.name}</h3><p>MMSI: ${ship.mmsi}</p>`))
        .addTo(map);

    });



  };

  return <div ref={mapContainer} style={{ width: "500px", height: "500px" }} />;
};

export default Map;