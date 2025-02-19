import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const Map = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [shipsData, setShipsData] = useState([]);
  const [socket, setSocket] = useState(null); 

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [0, 0],
      zoom: 2,
    });

    mapRef.current = map;

    const ws = new WebSocket("ws://ideal-disco-56qq4759jqqcp6qv");
    setSocket(ws); 

    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "ship_updates" || data.type === "initial_ships") { 
          setShipsData(data.ships);
          updateShips(data.ships);
        } else if (data.type === "ship_update") { 
          setShipsData(prevShips => {
            const updatedShips = prevShips.map(ship =>
              ship.mmsi === data.ship.mmsi ? data.ship : ship
            );
            return updatedShips;
          });
          updateShips(shipsData);
        }
      } catch (error) {
        console.error("Error parsing or processing WebSocket message:", error, event.data);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setSocket(null); 
    };

    map.on("load", () => {
    });

    return () => {
      map.remove();
      if (ws) {
        ws.close(); 
      }
    };
  }, []); 

  const updateShips = (shipsData) => {
    // ... (This function remains the same as in the previous example)
    const map = mapRef.current;
    if (!map) return;

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
          name: ship.name || `Ship ${ship.mmsi}`, // Default name
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

  return <div ref={mapContainer} style={{ width: "500px", height: "500px" }} />;
};

export default Map;