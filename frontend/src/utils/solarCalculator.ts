/**
 * Solar Position & Lighting Calculator for Marrakech, Morocco
 * Coordinates: Latitude 31.63° N, Longitude 8.00° W
 * 
 * Computes mathematically realistic solar elevation (altitude), azimuth,
 * and MapLibre 3D light vector parameters based on time of day and season.
 */

export type Season = 'summer' | 'equinox' | 'winter';

export interface SolarTelemetry {
  hour: number; // Decimal hour, e.g. 14.5 for 14:30
  formattedTime: string; // e.g. "14:30"
  phaseName: string; // e.g. "Golden Hour", "Solar Noon", "Night"
  azimuthDeg: number; // 0 to 360 degrees from North
  azimuthCompass: string; // e.g. "SSW (215°)"
  altitudeDeg: number; // Angle above horizon in degrees
  polarDeg: number; // Angle from zenith for MapLibre light
  shadowLengthMultiplier: number; // 1 / tan(altitude)
  lightColor: string; // Hex color for directional light
  lightIntensity: number; // 0.0 to 1.0
  isNight: boolean;
  isGoldenHour: boolean;
}

const MARRAKECH_LAT_RAD = (31.6295 * Math.PI) / 180;
const SOLAR_NOON_HOUR = 12.5; // ~12:30 PM local solar noon

const DECLINATIONS: Record<Season, number> = {
  summer: (23.44 * Math.PI) / 180, // June 21 Solstice
  equinox: 0,                      // March 21 / Sept 21
  winter: (-23.44 * Math.PI) / 180, // Dec 21 Solstice
};

function getCompassHeading(degrees: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'
  ];
  const idx = Math.round((degrees % 360) / 22.5);
  return `${directions[idx]} (${Math.round(degrees)}°)`;
}

export function computeSolarPosition(hour: number, season: Season = 'summer'): SolarTelemetry {
  // Clamp hour to 0-24
  const h = Math.max(0, Math.min(24, hour));
  const declination = DECLINATIONS[season];

  // Hour angle H in radians (15 degrees per hour from solar noon)
  const hourAngleRad = ((h - SOLAR_NOON_HOUR) * 15 * Math.PI) / 180;

  // Solar Altitude (Elevation)
  // sin(alt) = sin(lat) * sin(dec) + cos(lat) * cos(dec) * cos(H)
  const sinAlt =
    Math.sin(MARRAKECH_LAT_RAD) * Math.sin(declination) +
    Math.cos(MARRAKECH_LAT_RAD) * Math.cos(declination) * Math.cos(hourAngleRad);

  const altitudeRad = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const altitudeDeg = (altitudeRad * 180) / Math.PI;

  // Solar Azimuth (measured clockwise from North)
  // cos(az) = (sin(dec) - sin(lat) * sin(alt)) / (cos(lat) * cos(alt))
  const cosAlt = Math.cos(altitudeRad);
  let azimuthDeg = 180;

  if (cosAlt > 0.001) {
    const cosAz = (Math.sin(declination) - Math.sin(MARRAKECH_LAT_RAD) * sinAlt) /
                  (Math.cos(MARRAKECH_LAT_RAD) * cosAlt);
    const clampedCosAz = Math.max(-1, Math.min(1, cosAz));
    const azRad = Math.acos(clampedCosAz);
    const azBase = (azRad * 180) / Math.PI;

    // Morning (H < 0): Sun is in East (azimuth < 180)
    // Afternoon (H >= 0): Sun is in West (azimuth = 360 - azBase)
    azimuthDeg = hourAngleRad < 0 ? azBase : 360 - azBase;
  }

  // Polar angle for MapLibre setLight (0 = zenith, 90 = horizon)
  // Clamp between 14° and 86° for graceful MapLibre shader rendering
  const polarDeg = Math.max(14, Math.min(86, 90 - altitudeDeg));

  // Shadow length multiplier: cotangent of altitude = 1 / tan(altitude)
  const shadowMultiplier = altitudeDeg > 3
    ? Math.min(8.0, 1 / Math.tan(Math.max(0.05, altitudeRad)))
    : 8.0;

  // Classify lighting state and color
  const isNight = altitudeDeg <= 0;
  const isGoldenHour = altitudeDeg > 0 && altitudeDeg <= 12;

  let lightColor = '#ffffff';
  let lightIntensity = 0.72;
  let phaseName = 'Daylight';

  if (isNight) {
    phaseName = h < 12 ? 'Pre-Dawn / Night' : 'Night';
    lightColor = '#93c5fd'; // Cool soft moonlight
    lightIntensity = 0.25;
  } else if (isGoldenHour) {
    if (h < 12) {
      phaseName = 'Morning Golden Hour';
      lightColor = '#fed7aa'; // Warm sunrise amber
      lightIntensity = 0.62;
    } else {
      phaseName = 'Sunset / Golden Hour';
      lightColor = '#f97316'; // Vivid terracotta sunset
      lightIntensity = 0.65;
    }
  } else if (altitudeDeg <= 28) {
    phaseName = h < 12 ? 'Mid Morning' : 'Late Afternoon';
    lightColor = '#fef08a'; // Soft warm daylight
    lightIntensity = 0.68;
  } else if (altitudeDeg > 55) {
    phaseName = 'Peak Solar Noon';
    lightColor = '#ffffff'; // Direct brilliant white
    lightIntensity = 0.78;
  } else {
    phaseName = 'Clear Daylight';
    lightColor = '#f8fafc';
    lightIntensity = 0.74;
  }

  // Format time (e.g. 14.5 -> "14:30")
  const wholeHours = Math.floor(h);
  const minutes = Math.round((h - wholeHours) * 60);
  const formattedTime = `${String(wholeHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  return {
    hour: h,
    formattedTime,
    phaseName,
    azimuthDeg: Math.round(azimuthDeg * 10) / 10,
    azimuthCompass: getCompassHeading(azimuthDeg),
    altitudeDeg: Math.round(altitudeDeg * 10) / 10,
    polarDeg: Math.round(polarDeg * 10) / 10,
    shadowLengthMultiplier: Math.round(shadowMultiplier * 10) / 10,
    lightColor,
    lightIntensity,
    isNight,
    isGoldenHour,
  };
}
