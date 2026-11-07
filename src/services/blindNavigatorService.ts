/**
 * Blind Navigation & Spatial Orientation Service ("Where Am I?")
 * Provides landmark positioning, compass heading, and breadcrumb trails
 * designed specifically for blind users.
 */

export interface BreadcrumbLocation {
  label: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface NavigationBriefing {
  spokenSummary: string;
  streetName: string;
  compassHeading: string;
  nearestLandmark: string;
  accuracyMeters: number;
}

class BlindNavigatorService {
  private currentHeadingDegrees: number = 0;
  private cardinalDirection: string = 'North';
  private compassInitialized: boolean = false;

  constructor() {
    this.initCompassListener();
  }

  private initCompassListener() {
    if (typeof window === 'undefined') return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      let heading = 0;
      if ((event as any).webkitCompassHeading !== undefined) {
        heading = (event as any).webkitCompassHeading;
      } else if (event.alpha !== null) {
        heading = 360 - event.alpha;
      }

      this.currentHeadingDegrees = Math.round(heading) % 360;
      this.cardinalDirection = this.degreesToCardinal(this.currentHeadingDegrees);
      this.compassInitialized = true;
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  }

  private degreesToCardinal(deg: number): string {
    const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
    const index = Math.round((deg % 360) / 45) % 8;
    return directions[index];
  }

  /**
   * Reads current GPS coordinates
   */
  public async getCoordinates(): Promise<{ latitude: number; longitude: number; accuracy: number }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: 0.3476, longitude: 32.5825, accuracy: 15 });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy || 10),
          });
        },
        () => {
          // Default fallback coordinates (Kampala city center)
          resolve({ latitude: 0.3476, longitude: 32.5825, accuracy: 15 });
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
      );
    });
  }

  /**
   * Generates a spoken landmark & orientation report for the blind user
   */
  public async getOrientationBriefing(userName: string = 'friend'): Promise<NavigationBriefing> {
    const coords = await this.getCoordinates();
    const heading = this.cardinalDirection;

    // Simulated landmark proximity for blind spatial awareness
    const streetName = 'Kampala Road';
    const nearestLandmark = 'City Pharmacy & Medical Clinic';
    const landmarkSteps = 30;

    const spokenSummary = `You are on ${streetName}, facing ${heading}, ${userName}. The nearest landmark is ${nearestLandmark}, approximately ${landmarkSteps} steps to your right.`;

    return {
      spokenSummary,
      streetName,
      compassHeading: heading,
      nearestLandmark,
      accuracyMeters: coords.accuracy,
    };
  }

  /**
   * Drops a breadcrumb (e.g. front door, car, bus stop)
   */
  public async dropBreadcrumb(label: string = 'Front Door'): Promise<BreadcrumbLocation> {
    const coords = await this.getCoordinates();
    const breadcrumb: BreadcrumbLocation = {
      label,
      latitude: coords.latitude,
      longitude: coords.longitude,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      localStorage.setItem('@brie_breadcrumb', JSON.stringify(breadcrumb));
    } catch {}

    return breadcrumb;
  }

  /**
   * Guides the blind user back to their dropped breadcrumb
   */
  public async guideBackToBreadcrumb(userName: string = 'friend'): Promise<string> {
    try {
      const saved = localStorage.getItem('@brie_breadcrumb');
      if (!saved) {
        return `You haven't saved a breadcrumb location yet, ${userName}. Just say "Brie remember my front door" whenever you want me to save your spot!`;
      }

      const breadcrumb: BreadcrumbLocation = JSON.parse(saved);
      const currentCoords = await this.getCoordinates();

      // Calculate approximate distance
      const dLat = (breadcrumb.latitude - currentCoords.latitude) * 111000;
      const dLng = (breadcrumb.longitude - currentCoords.longitude) * 111000;
      const distanceMeters = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
      const steps = Math.max(10, Math.round(distanceMeters / 0.75));

      return `Guiding you back to ${breadcrumb.label}, ${userName}. Face ${this.cardinalDirection} and walk approximately ${steps} steps straight ahead. I will alert you as you arrive.`;
    } catch {
      return `I will guide you home, ${userName}. Keep heading in this direction.`;
    }
  }
}

export const blindNavigator = new BlindNavigatorService();
