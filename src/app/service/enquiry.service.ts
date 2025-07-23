import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Enquiry } from '@/domain/customer';

/**
 * Service responsible for managing enquiries in the application
 * Provides CRUD operations and data transformation for enquiries
 */
@Injectable({
  providedIn: 'root'
})
export class EnquiryService {
  /**
   * Path to the JSON file containing initial enquiry data
   * In a real application, this would be an API endpoint
   */
  private apiUrl = 'assets/data/enquiries.json';

  /**
   * BehaviorSubject to maintain the current state of enquiries
   * Allows components to subscribe to enquiry updates
   */
  private enquiriesSubject = new BehaviorSubject<Enquiry[]>([]);

  /**
   * Observable that components can subscribe to for enquiry updates
   * Exposed as public property to prevent direct modification of the subject
   */
  enquiries$ = this.enquiriesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadEnquiries();
  }

  /**
   * Loads initial enquiry data from the JSON file
   * Transforms enquiry IDs to ensure 5-digit format
   */
  private loadEnquiries(): void {
    this.http.get<Enquiry[]>(this.apiUrl).pipe(
      map(enquiries => this.transformEnquiryIds(enquiries))
    ).subscribe(enquiries => {
      this.enquiriesSubject.next(enquiries);
    });
  }

  /**
   * Transforms enquiry IDs to ensure they are 5 digits
   * @param enquiries Array of enquiries to transform
   * @returns Array of enquiries with 5-digit IDs
   */
  private transformEnquiryIds(enquiries: Enquiry[]): Enquiry[] {
    return enquiries.map(enquiry => ({
      ...enquiry,
      enquiryId: this.generateFiveDigitId(enquiry.enquiryId)
    }));
  }

  /**
   * Converts a number to a 5-digit format by padding with leading zeros
   * @param id Number to convert
   * @returns 5-digit number
   */
  private generateFiveDigitId(id: number): number {
    return parseInt(id.toString().padStart(5, '0'));
  }

  /**
   * Retrieves all enquiries as an observable
   * @returns Observable of enquiry array
   */
  getAllEnquiries(): Observable<Enquiry[]> {
    return this.enquiries$;
  }

  /**
   * Finds an enquiry by its ID
   * @param id Enquiry ID to search for
   * @returns Observable of the found enquiry or undefined if not found
   */
  getEnquiryById(id: number): Observable<Enquiry | undefined> {
    return this.enquiries$.pipe(
      map(enquiries => enquiries.find(e => e.enquiryId === id))
    );
  }

  /**
   * Creates a new enquiry
   * @param enquiry Complete enquiry object to create
   */
  createEnquiry(enquiry: Enquiry): void {
    const currentEnquiries = this.enquiriesSubject.value;
    this.enquiriesSubject.next([...currentEnquiries, enquiry]);
  }

  /**
   * Updates an existing enquiry
   * @param updatedEnquiry Enquiry object with updated values
   */
  updateEnquiry(updatedEnquiry: Enquiry): void {
    const currentEnquiries = this.enquiriesSubject.value;
    const index = currentEnquiries.findIndex(e => e.enquiryId === updatedEnquiry.enquiryId);
    
    if (index !== -1) {
      const updatedEnquiries = [...currentEnquiries];
      updatedEnquiries[index] = updatedEnquiry;
      this.enquiriesSubject.next(updatedEnquiries);
    }
  }

  /**
   * Deletes an enquiry by its ID
   * @param id ID of the enquiry to delete
   */
  deleteEnquiry(id: number): void {
    const currentEnquiries = this.enquiriesSubject.value;
    this.enquiriesSubject.next(currentEnquiries.filter(e => e.enquiryId !== id));
  }

  /**
   * Searches enquiries by a search term
   * Matches against ID, customer name, and status
   * @param searchTerm Term to search for
   * @returns Observable of filtered enquiries
   */
  searchEnquiries(searchTerm: string): Observable<Enquiry[]> {
    return this.enquiries$.pipe(
      map(enquiries => {
        const term = searchTerm.toLowerCase();
        return enquiries.filter(enquiry => 
          enquiry.enquiryId.toString().includes(term) ||
          enquiry.customerName.toLowerCase().includes(term) ||
          enquiry.status.toLowerCase().includes(term)
        );
      })
    );
  }
} 