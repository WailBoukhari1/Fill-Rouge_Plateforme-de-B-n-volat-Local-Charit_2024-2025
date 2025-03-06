import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  // Using Nominatim API (OpenStreetMap's geocoding service)
  private readonly nominatimApiUrl = 'https://nominatim.openstreetmap.org/search';

  // Using the Moroccan Administrative Division API
  private readonly moroccanCitiesApiUrl = 'https://raw.githubusercontent.com/Morocco-Open-Data/Morocco-Cities/main/cities.json';

  // Fallback city data by province
  private readonly fallbackCitiesByProvince: Record<string, string[]> = {
    'Tanger-Tétouan-Al Hoceïma': ['Tanger', 'Tétouan', 'Al Hoceïma', 'Larache', 'Chefchaouen', 'Asilah', 'Ouezzane'],
    'L\'Oriental': ['Oujda', 'Nador', 'Berkane', 'Taourirt', 'Jerada', 'Figuig', 'Bouarfa'],
    'Fès-Meknès': ['Fès', 'Meknès', 'Taza', 'Ifrane', 'Sefrou', 'Moulay Yacoub', 'Taounate'],
    'Rabat-Salé-Kénitra': ['Rabat', 'Salé', 'Kénitra', 'Témara', 'Skhirate', 'Khémisset', 'Sidi Kacem'],
    'Béni Mellal-Khénifra': ['Béni Mellal', 'Khénifra', 'Khouribga', 'Azilal', 'Fquih Ben Salah'],
    'Casablanca-Settat': ['Casablanca', 'Settat', 'Mohammedia', 'El Jadida', 'Berrechid', 'Benslimane', 'Médiouna'],
    'Marrakech-Safi': ['Marrakech', 'Safi', 'Essaouira', 'Chichaoua', 'Al Haouz', 'Kelâa des Sraghna', 'Youssoufia'],
    'Drâa-Tafilalet': ['Errachidia', 'Ouarzazate', 'Midelt', 'Tinghir', 'Zagora'],
    'Souss-Massa': ['Agadir', 'Inezgane', 'Taroudant', 'Tiznit', 'Chtouka-Aït Baha', 'Tata'],
    'Guelmim-Oued Noun': ['Guelmim', 'Tan-Tan', 'Sidi Ifni', 'Assa-Zag'],
    'Laâyoune-Sakia El Hamra': ['Laâyoune', 'Boujdour', 'Tarfaya', 'Es-Semara'],
    'Dakhla-Oued Ed-Dahab': ['Dakhla', 'Aousserd']
  };

  constructor(private http: HttpClient) {}

  /**
   * Get cities in a specific Moroccan province/region
   * @param province The province/region to get cities for
   * @returns Observable of city names
   */
  getCitiesByProvince(province: string): Observable<string[]> {
    // First try to get from fallback data
    if (this.fallbackCitiesByProvince[province]) {
      console.log(`Using fallback data for province ${province}`);
      return of(this.fallbackCitiesByProvince[province]);
    }

    // If no fallback data, try the API
    return this.http.get<any[]>(this.moroccanCitiesApiUrl).pipe(
      map(cities => {
        // Filter cities by province and extract names
        const filteredCities = cities
          .filter(city => city.region === province)
          .map(city => city.city);

        if (filteredCities.length === 0) {
          console.log(`No cities found for province ${province} in API, using fallback`);
          return this.fallbackCitiesByProvince[province] || [];
        }

        return filteredCities;
      }),
      catchError(error => {
        console.error('Error fetching Moroccan cities:', error);
        return of(this.fallbackCitiesByProvince[province] || []);
      })
    );
  }

  /**
   * Get coordinates for a location in Morocco
   * @param query The location to geocode
   * @returns Observable of coordinates [lat, lon]
   */
  getCoordinates(query: string): Observable<[number, number] | null> {
    // Add Morocco to the query to ensure we get results in Morocco
    const fullQuery = `${query}, Morocco`;

    const params = {
      q: fullQuery,
      format: 'json',
      limit: '1',
      countrycodes: 'ma' // Country code for Morocco
    };

    return this.http.get<any[]>(this.nominatimApiUrl, { params }).pipe(
      map(results => {
        if (results && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lon = parseFloat(results[0].lon);
          return [lat, lon] as [number, number];
        }
        return null;
      }),
      catchError(error => {
        console.error('Error geocoding location:', error);
        return of(null);
      })
    );
  }
}
