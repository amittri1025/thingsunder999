import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { CATEGORY_COLORS, CATEGORY_EMOJIS } from "../constants";

function priceIcon(listing, isActive) {
  const color = CATEGORY_COLORS[listing.category] || "#1C1B19";
  const emoji = CATEGORY_EMOJIS[listing.category] || "📍";
  const price = listing.price === 0 ? "Free" : `₹${listing.price}`;
  return L.divIcon({
    className: "",
    html: `<div class="price-marker ${isActive ? "price-marker-active" : ""}" style="--marker-color:${color}"><span class="price-marker-emoji">${emoji}</span><span>${price}</span></div>`,
    iconSize: [76, 32],
    iconAnchor: [38, 32],
  });
}

function Recenter({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom(), { animate: true });
  return null;
}

export default function MapView({ listings, center, activeId, hoveredId, onSelect, onHover }) {
  const markers = useMemo(() => listings.filter((l) => l.coordinates), [listings]);

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom className="map-container">
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter center={center} />
      {markers.map((listing) => (
        <Marker
          key={listing._id}
          position={[listing.coordinates.lat, listing.coordinates.lng]}
          icon={priceIcon(listing, listing._id === activeId || listing._id === hoveredId)}
          eventHandlers={{
            click: () => onSelect(listing._id),
            mouseover: () => onHover(listing._id),
            mouseout: () => onHover(null),
          }}
        >
          {hoveredId === listing._id && (
            <Tooltip direction="top" offset={[0, -6]} opacity={1} permanent className="map-preview-tooltip">
              <div className="preview-card">
                <img src={listing.photos?.[0]} alt={listing.name} />
                <div>
                  <strong>{listing.name}</strong>
                  <span>{listing.locality} · {listing.rating}★</span>
                </div>
              </div>
            </Tooltip>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}
