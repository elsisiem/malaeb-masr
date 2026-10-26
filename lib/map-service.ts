// Map service for handling map-related functionality
import type { Venue } from "./mock-data"

// Map provider API key (would normally be in environment variables)
const MAP_API_KEY = "map_api_key_here"

// Interface for map marker
export interface MapMarker {
  id: string
  latitude: number
  longitude: number
  title: string
  description?: string
  type: "venue" | "user"
}

// Mock coordinates for Cairo neighborhoods
const cairoCoordinates = {
  "Nasr City": { lat: 30.0511, lng: 31.3656 },
  Maadi: { lat: 29.9602, lng: 31.2569 },
  Heliopolis: { lat: 30.0875, lng: 31.3298 },
  Zamalek: { lat: 30.0609, lng: 31.2197 },
  "New Cairo": { lat: 30.0074, lng: 31.4913 },
  Downtown: { lat: 30.0444, lng: 31.2357 },
  "6th of October": { lat: 29.9285, lng: 30.9188 },
  Dokki: { lat: 30.0382, lng: 31.2122 },
}

// User's current location (mock)
const userLocation = { lat: 30.0444, lng: 31.2357 }

// Convert venues to map markers. Only these fields are read, so API venues can be passed too.
export type MapVenue = Pick<Venue, "id" | "name" | "location" | "district">

export function venueToMapMarkers(venues: MapVenue[]): MapMarker[] {
  return venues.map((venue) => {
    // Extract district from location
    const district = venue.district || venue.location.split(",")[0].trim()
    const coordinates = cairoCoordinates[district as keyof typeof cairoCoordinates] || {
      lat: 30.0444 + (Math.random() * 0.1 - 0.05),
      lng: 31.2357 + (Math.random() * 0.1 - 0.05),
    }

    return {
      id: venue.id,
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      title: venue.name,
      description: venue.location,
      type: "venue",
    }
  })
}

// Get user's current location
export function getUserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve) => {
    // In a real app, we would use the browser's geolocation API
    // For now, return a mock location
    setTimeout(() => {
      resolve(userLocation)
    }, 500)
  })
}

// Calculate distance between two points (haversine formula)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Get directions URL
export function getDirectionsUrl(destLat: number, destLng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`
}
