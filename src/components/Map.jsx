import { useEffect, useRef } from "react";
import leaflet from "leaflet";

export default function Map() {
  const mapRef = useRef(null); // Reference for the Leaflet map instance

  // Fetch pollution data from OpenWeatherMap
  const fetchPollutionData = async (latitude, longitude) => {
    const API_KEY = "a9658e5bedfb27dc6793d4af63fb6b5b"; // Replace with your API key
    const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude.toFixed(
      6
    )}&lon=${longitude.toFixed(6)}&appid=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      // Check if data is available
      if (data && data.list && data.list.length > 0) {
        const pollution = data.list[0].components;
        return `
          <b>Air Pollution Data:</b><br/>
          AQI: ${data.list[0].main.aqi}<br/>
          CO: ${pollution.co} µg/m³<br/>
          NO: ${pollution.no} µg/m³<br/>
          NO₂: ${pollution.no2} µg/m³<br/>
          O₃: ${pollution.o3} µg/m³<br/>
          SO₂: ${pollution.so2} µg/m³<br/>
          PM2.5: ${pollution.pm2_5} µg/m³<br/>
          PM10: ${pollution.pm10} µg/m³<br/>
        `;
      }
      else {
        return "<b>No pollution data available for this location.</b>";
      }
    } catch (error) {
      console.error("Error fetching pollution data:", error);
      return "<b>Error fetching pollution data.</b>";
    }
  };

  useEffect(() => {
    // Initialize the Leaflet map
    if (!mapRef.current) {
      const mapInstance = leaflet
        .map("map")
        .setView([51.505, -0.09], 13); // Default center (London)

      // Add map tiles
      leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(mapInstance);

      // Handle map click events
      mapInstance.on("click", async (e) => {
        const { lat: latitude, lng: longitude } = e.latlng;

        // Fetch pollution data for the clicked location
        const pollutionInfo = await fetchPollutionData(latitude, longitude);

        // Add a marker with pollution data in the popup
        leaflet
          .marker([latitude, longitude])
          .addTo(mapInstance)
          .bindPopup(
            `
              <b>Location:</b><br/>
              Latitude: ${latitude.toFixed(6)}<br/>
              Longitude: ${longitude.toFixed(6)}<br/>
              ${pollutionInfo}
            `
          )
          .openPopup();
      });

      mapRef.current = mapInstance; // Save the map instance
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove(); // Clean up map on component unmount
        mapRef.current = null;
      }
    };
  }, []);

  return <div id="map" style={{ height: "100vh", width: "100%" }}></div>;
}