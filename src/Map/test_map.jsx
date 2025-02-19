import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const Map = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});  // Store markers by MMSI
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

    const ws = new WebSocket("ws://localhost:8080/ws");
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "ship_updates" || data.type === "initial_ships") {
          setShipsData(data.ships);
          updateShipMarkers(data.ships);
        } else if (data.type === "ship_update") {
          setShipsData(prevShips => {
            const updatedShips = prevShips.map(ship =>
              ship.mmsi === data.ship.mmsi ? data.ship : ship
            );
            return updatedShips;
          });
          updateShipMarkers([data.ship]);
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
      // Add ship icon image
      map.loadImage(
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Blue_boat_icon.svg/32px-Blue_boat_icon.svg.png',
        (error, image) => {
          if (error) throw error;
          map.addImage('ship-icon', image);
        }
      );
    });

    return () => {
      // Clean up markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      
      map.remove();
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const createMarkerElement = (ship) => {
    const el = document.createElement('div');
    el.className = 'ship-marker';
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.backgroundImage = 'url(https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Blue_boat_icon.svg/32px-Blue_boat_icon.svg.png)';
    el.style.backgroundSize = 'cover';
    
    // Add tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'ship-tooltip';
    tooltip.style.display = 'none';
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = 'white';
    tooltip.style.padding = '5px';
    tooltip.style.borderRadius = '3px';
    tooltip.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
    tooltip.innerHTML = `
      <strong>${ship.name || `Ship ${ship.mmsi}`}</strong><br>
      MMSI: ${ship.mmsi}<br>
      Position: ${ship.latitude.toFixed(4)}°, ${ship.longitude.toFixed(4)}°
    `;
    el.appendChild(tooltip);

    // Show/hide tooltip on hover
    el.addEventListener('mouseenter', () => {
      tooltip.style.display = 'block';
    });
    el.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });

    return el;
  };

  const updateShipMarkers = (ships) => {
    const map = mapRef.current;
    if (!map) return;

    ships.forEach(ship => {
      const marker = markersRef.current[ship.mmsi];
      const newPosition = [ship.longitude, ship.latitude];

      if (marker) {
        // Update existing marker position with animation
        marker.setLngLat(newPosition);
        
        // Update tooltip content
        const tooltip = marker.getElement().querySelector('.ship-tooltip');
        if (tooltip) {
          tooltip.innerHTML = `
            <strong>${ship.name || `Ship ${ship.mmsi}`}</strong><br>
            MMSI: ${ship.mmsi}<br>
            Position: ${ship.latitude.toFixed(4)}°, ${ship.longitude.toFixed(4)}°
          `;
        }
      } else {
        // Create new marker
        const newMarker = new maplibregl.Marker({
          element: createMarkerElement(ship),
          anchor: 'center'
        })
          .setLngLat(newPosition)
          .addTo(map);

        markersRef.current[ship.mmsi] = newMarker;
      }
    });

    // Remove markers for ships that are no longer present
    const currentMMSIs = ships.map(ship => ship.mmsi);
    Object.keys(markersRef.current).forEach(mmsi => {
      if (!currentMMSIs.includes(mmsi)) {
        markersRef.current[mmsi].remove();
        delete markersRef.current[mmsi];
      }
    });
  };

  return <div ref={mapContainer} style={{ width: "500px", height: "500px" }} />;
};

export default Map;