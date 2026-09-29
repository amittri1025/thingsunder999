import { useMemo } from "react";
import { GoogleMap, OverlayViewF, useLoadScript } from "@react-google-maps/api";

const MAP_PIN_EMOJIS = ["📍", "🙅", "🍬 ", "😂", "🔥", "🛍️", "💘", "🍸", "💄", "🎳", "🍕", "😘"];
const MAP_OPTIONS = {
  backgroundColor: "#F6DCE4",
  clickableIcons: false,
  fullscreenControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#F4E1E7" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#777A82" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#F4E1E7" }] },
    { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#A5A7AE" }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#F4E1E7" }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#A5A7AE" }] },
    { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#E8DDE1" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#C98FA2" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#D9DADF" }] },
  ],
  zoomControl: true,
};
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();

function MapMessage({ children }) {
  return <div className="map-setup-notice">{children}</div>;
}

export default function MapView({ listings, center, activeId, hoveredId, onSelect, onHover }) {
  if (!API_KEY) {
    return <MapMessage>Set VITE_GOOGLE_MAPS_API_KEY in client/.env.local to load Google Maps.</MapMessage>;
  }

  return <GoogleMapContent {...{ listings, center, activeId, hoveredId, onSelect, onHover }} />;
}

function GoogleMapContent({ listings, center, activeId, hoveredId, onSelect, onHover }) {
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: API_KEY });
  const mapCenter = useMemo(() => ({ lat: center[0], lng: center[1] }), [center]);
  const markers = useMemo(() => listings.filter((listing) => listing.coordinates), [listings]);
  const markerEmojis = useMemo(
    () => new Map(markers.map(({ _id }) => [_id, MAP_PIN_EMOJIS[Math.floor(Math.random() * MAP_PIN_EMOJIS.length)]])),
    [markers],
  );

  if (loadError) {
    return <MapMessage>Google Maps failed to load. Check the API key, Maps JavaScript API access, billing, and key restrictions.</MapMessage>;
  }
  if (!isLoaded) {
    return <MapMessage>Loading Google Maps…</MapMessage>;
  }

  return (
    <GoogleMap
      mapContainerClassName="map-container"
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={mapCenter}
      zoom={12}
      options={MAP_OPTIONS}
    >
      {markers.map((listing) => {
        const isActive = listing._id === activeId || listing._id === hoveredId;
        const isHovered = listing._id === hoveredId;
        return (
          <OverlayViewF
            key={listing._id}
            position={{ lat: listing.coordinates.lat, lng: listing.coordinates.lng }}
            mapPaneName="overlayMouseTarget"
            getPixelPositionOffset={() => ({ x: -24, y: -24 })}
          >
            <div
              className="map-marker-overlay"
              onMouseEnter={() => onHover(listing._id)}
              onMouseLeave={() => onHover(null)}
            >
              <button
                type="button"
                className={`emoji-map-marker-content${isActive ? " emoji-map-marker-active" : ""}`}
                aria-label={`${listing.name}, ${listing.price === 0 ? "Free" : `₹${listing.price}`}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(listing._id);
                }}
              >
                {markerEmojis.get(listing._id)}
              </button>
              {isHovered && (
                <div className="map-marker-preview">
                  <div className="preview-card">
                    {listing.photos?.[0] && <img src={listing.photos[0]} alt="" />}
                    <div>
                      <strong>{listing.name}</strong>
                      <span>{listing.locality} · {listing.rating} ⭐</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </OverlayViewF>
        );
      })}
    </GoogleMap>
  );
}
