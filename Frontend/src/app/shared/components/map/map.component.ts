import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

// Initialize Mapbox with access token
mapboxgl.accessToken = environment.mapboxToken;

interface LocationDetails {
  coordinates: [number, number];
  address: string;
  country: string;
  city?: string;
  region?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationData {
  coordinates: [number, number];
  address: string;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-wrapper">
      <div #mapElement class="map-container"></div>
      <div #tooltip class="tooltip" [style.display]="tooltipVisible ? 'block' : 'none'">
        {{ tooltipContent }}
      </div>
      <div class="coordinates-display" *ngIf="selectedCoordinates">
        Selected: {{ selectedCoordinates[0] | number:'1.6-6' }}, {{ selectedCoordinates[1] | number:'1.6-6' }}
      </div>
      @if (error) {
        <div class="error-message">
          {{ error }}
        </div>
      }
    </div>
  `,
  styles: [`
    .map-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 400px;
      background-color: #f5f5f5;
    }
    .map-container {
      width: 100%;
      height: 100%;
      min-height: 400px;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      background-color: #f5f5f5;
    }
    .tooltip {
      position: absolute;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      pointer-events: none;
      z-index: 1000;
    }
    .coordinates-display {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.9);
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 1000;
    }
    .error-message {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 0, 0, 0.1);
      color: #d32f2f;
      padding: 16px;
      border-radius: 4px;
      text-align: center;
      z-index: 1000;
    }
    :host ::ng-deep .mapboxgl-ctrl-group {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    :host ::ng-deep .mapboxgl-ctrl button {
      background-color: #ffffff;
      color: #333333;
      border: none;
      border-radius: 4px;
      padding: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    :host ::ng-deep .mapboxgl-ctrl button:hover {
      background-color: #f0f0f0;
    }
  `]
})
export class MapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapElement') mapElement!: ElementRef<HTMLDivElement>;
  @ViewChild('tooltip') tooltipElement!: ElementRef<HTMLDivElement>;
  @Input() coordinates?: Coordinates;
  @Input() selectable = false;
  @Input() zoom: number = 6; // Adjusted zoom level for Morocco
  @Output() locationSelected = new EventEmitter<LocationData>();

  private map: mapboxgl.Map | null = null;
  tooltipVisible = false;
  tooltipContent = '';
  selectedCoordinates: [number, number] | null = null;
  error: string | null = null;
  private marker: mapboxgl.Marker | null = null;

  constructor(private http: HttpClient) {
    mapboxgl.accessToken = environment.mapboxToken;
  }

  ngOnInit(): void {
    // Don't initialize map here, wait for AfterViewInit
  }

  ngAfterViewInit(): void {
    // Initialize map after view is ready
    this.initializeMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private async getAddressFromCoordinates(coords: [number, number]): Promise<LocationDetails> {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const context = feature.context || [];
        
        // Extract location details
        const country = context.find((c: any) => c.id.startsWith('country'))?.text || 'Morocco';
        const region = context.find((c: any) => c.id.startsWith('region'))?.text;
        const city = context.find((c: any) => c.id.startsWith('place'))?.text;
        
        return {
          coordinates: coords,
          address: feature.place_name,
          country,
          region,
          city
        };
      }

      return {
        coordinates: coords,
        address: 'Location selected',
        country: 'Morocco'
      };
    } catch (err) {
      console.error('Error getting address:', err);
      return {
        coordinates: coords,
        address: 'Location selected',
        country: 'Morocco'
      };
    }
  }

  private initializeMap(): void {
    // Add a small delay to ensure the DOM is ready
    setTimeout(() => {
      if (!this.mapElement?.nativeElement) {
        this.error = 'Map element not found';
        console.error('Map element not found');
        return;
      }

      try {
        // Create the map with Mapbox
        this.map = new mapboxgl.Map({
          container: this.mapElement.nativeElement,
          style: {
            version: 8,
            sources: {
              osm: {
                type: 'raster',
                tiles: ['https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© Stadia Maps, © OpenMapTiles, © OpenStreetMap contributors'
              }
            },
            layers: [
              {
                id: 'osm',
                type: 'raster',
                source: 'osm',
                minzoom: 0,
                maxzoom: 19
              }
            ]
          },
          center: this.coordinates,
          zoom: this.zoom,
          attributionControl: true,
          logoPosition: 'bottom-right',
          maxBounds: [
            [-13.1678, 21.4207], // Southwest coordinates (including Moroccan Sahara)
            [-1.1247, 35.9228]   // Northeast coordinates
          ],
          minZoom: 5,
          maxZoom: 15,
          projection: 'mercator'
        });

        // Add navigation controls with better positioning
        this.map.addControl(new mapboxgl.NavigationControl({
          showCompass: true,
          showZoom: true,
          visualizePitch: true
        }), 'top-right');

        // Add scale control
        this.map.addControl(new mapboxgl.ScaleControl({
          maxWidth: 100,
          unit: 'metric'
        }), 'bottom-right');

        // Add fullscreen control
        this.map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

        // Add geolocate control
        this.map.addControl(new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }), 'top-right');

        // Add a custom style layer to highlight Morocco's borders
        this.map.on('load', () => {
          if (!this.map) return;
          
          this.map.addSource('morocco', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [-13.1678, 21.4207], // Southwest
                  [-1.1247, 21.4207],  // Southeast
                  [-1.1247, 35.9228],  // Northeast
                  [-13.1678, 35.9228], // Northwest
                  [-13.1678, 21.4207]  // Close the polygon
                ]]
              }
            }
          });

          this.map.addLayer({
            id: 'morocco-outline',
            type: 'line',
            source: 'morocco',
            layout: {},
            paint: {
              'line-color': '#FF0000',
              'line-width': 2,
              'line-opacity': 0.8
            }
          });
        });

        // Update click handler to include address lookup
        this.map.on('click', async (event: mapboxgl.MapMouseEvent) => {
          if (!this.map) return;
          
          const coords = event.lngLat.toArray() as [number, number];
          this.selectedCoordinates = coords;

          // Get address details
          const locationDetails = await this.getAddressFromCoordinates(coords);
          
          // Emit location details
          this.locationSelected.emit({
            coordinates: coords,
            address: locationDetails.address
          });

          // Add marker
          this.addMarker(coords);
        });

        // Add pointer move handler for tooltip with better styling
        this.map.on('mousemove', (event: mapboxgl.MapMouseEvent) => {
          if (!this.map) return;
          
          const coords = event.lngLat.toArray();
          this.tooltipContent = `Latitude: ${coords[1].toFixed(6)}\nLongitude: ${coords[0].toFixed(6)}`;
          this.tooltipVisible = true;
          
          if (this.tooltipElement?.nativeElement) {
            this.tooltipElement.nativeElement.style.left = (event.point.x + 10) + 'px';
            this.tooltipElement.nativeElement.style.top = (event.point.y + 10) + 'px';
          }
        });

        // Add hover effect for better interactivity
        this.map.on('mouseenter', () => {
          if (this.map) {
            this.map.getCanvas().style.cursor = 'crosshair';
          }
        });

        this.map.on('mouseleave', () => {
          if (this.map) {
            this.map.getCanvas().style.cursor = '';
          }
          this.tooltipVisible = false;
        });

        // Clear any previous errors
        this.error = null;
      } catch (err) {
        this.error = 'Failed to initialize map';
        console.error('Error initializing map:', err);
      }
    }, 0);
  }

  // Method to update coordinates
  updateCoordinates(coordinates: [number, number]): void {
    if (this.map) {
      this.map.flyTo({
        center: coordinates,
        zoom: this.zoom
      });
      this.selectedCoordinates = coordinates;
    }
  }

  onMapClick(event: { lat: number, lng: number }): void {
    if (this.selectable) {
      this.locationSelected.emit({
        coordinates: [event.lat, event.lng],
        address: 'Location selected'
      });
    }
  }

  private addMarker(coordinates: [number, number]): void {
    if (this.marker) {
      this.marker.remove();
    }
    this.marker = new mapboxgl.Marker({
      color: '#FF0000',
      scale: 0.8
    })
      .setLngLat(coordinates)
      .addTo(this.map!);
  }

  private reverseGeocode(coordinates: [number, number]): void {
    const [lat, lng] = coordinates;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response.features && response.features.length > 0) {
          const address = response.features[0].place_name;
          this.locationSelected.emit({
            coordinates,
            address
          });
        }
      },
      error: (error) => {
        console.error('Error reverse geocoding:', error);
        // Fallback to coordinates if geocoding fails
        this.locationSelected.emit({
          coordinates,
          address: `${lat}, ${lng}`
        });
      }
    });
  }
} 
