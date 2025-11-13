import React, { useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = { lat: 10.7769, lng: 106.7009 }; // TP.HCM

export default function AddressSelector({ onAddressSelect }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Thay bằng key của bạn
    libraries: ["places"],
  });

  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [autocomplete, setAutocomplete] = useState(null);

  if (!isLoaded) return <div>Loading Map...</div>;

  const handleMapClick = (e) => {
    const position = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setMarkerPosition(position);
    onAddressSelect({ latitude: position.lat, longitude: position.lng });
  };

  const handlePlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;
      const position = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setMarkerPosition(position);
      onAddressSelect({
        latitude: position.lat,
        longitude: position.lng,
        formattedAddress: place.formatted_address,
      });
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Tìm địa chỉ"
        className="w-full p-2 mb-2 border rounded"
        ref={(ref) => {
          if (ref && !autocomplete) {
            const input = new window.google.maps.places.Autocomplete(ref);
            input.setFields(["formatted_address", "geometry"]);
            input.addListener("place_changed", handlePlaceChanged);
            setAutocomplete(input);
          }
        }}
      />
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition}
        zoom={15}
        onClick={handleMapClick}
      >
        <Marker position={markerPosition} />
      </GoogleMap>
    </div>
  );
}
