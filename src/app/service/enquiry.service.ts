import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, catchError, of } from "rxjs";
import { Enquiry } from "@/domain/customer";

/**
 * Service responsible for managing enquiries in the application
 * Provides CRUD operations and data transformation for enquiries
 */
@Injectable({
  providedIn: "root",
})
export class EnquiryService {
  /**
   * Path to the JSON file containing initial enquiry data
   * In a real application, this would be an API endpoint
   */
  // API base URL
  private baseUrl = "https://order-management-api-knhi.onrender.com";
  private enquiriesApiUrl = `${this.baseUrl}/v1/enquiries/`;
  private customersApiUrl = `${this.baseUrl}/v1/customers/`;

  constructor(private http: HttpClient) {}

  /**
   * Gets enquiry data from the backend API, or falls back to local JSON if API fails or returns empty
   */
  getAllEnquiries(): Observable<Enquiry[]> {
    return this.http
      .get<Enquiry[]>(`${this.enquiriesApiUrl}?page=1&limit=10`)
      .pipe(
        catchError(() =>
          this.http.get<Enquiry[]>("assets/data/enquiries.json")
        ),
        map((data) => (Array.isArray(data) && data.length > 0 ? data : []))
      );
  }

  /**
   * Finds an enquiry by its ID
   * @param id Enquiry ID to search for
   * @returns Observable of the found enquiry or undefined if not found
   */
  getEnquiryById(id: number): Observable<Enquiry | undefined> {
    return this.getAllEnquiries().pipe(
      map((enquiries) => enquiries.find((e) => e.enquiryId === id))
    );
  }

  /**
   * Creates a new customer (required before creating an enquiry)
   * @param customer Customer object to create
   * @returns Observable<any>
   */
  createCustomer(customer: any): Observable<any> {
    return this.http.post(this.customersApiUrl, customer);
  }

  /**
   * Creates a new enquiry
   * @param enquiry Complete enquiry object to create
   * @returns Observable<any>
   */
  createEnquiry(enquiry: any): Observable<any> {
    return this.http.post(this.enquiriesApiUrl, enquiry);
  }

  /**
   * Updates an existing enquiry (API call only)
   * @param updatedEnquiry Enquiry object with updated values
   */
  updateEnquiry(updatedEnquiry: Enquiry): Observable<any> {
    // You may need to adjust the endpoint and payload as per your API
    return this.http.put(
      `${this.enquiriesApiUrl}${updatedEnquiry.enquiryId}/`,
      updatedEnquiry
    );
  }

  /**
   * Searches enquiries by a search term
   * Matches against ID, customer name, and status
   * @param searchTerm Term to search for
   * @returns Observable of filtered enquiries
   */
  searchEnquiries(searchTerm: string): Observable<Enquiry[]> {
    return this.getAllEnquiries().pipe(
      map((enquiries) => {
        const term = searchTerm.toLowerCase();
        return enquiries.filter(
          (enquiry) =>
            enquiry.enquiryId.toString().includes(term) ||
            enquiry.customerName.toLowerCase().includes(term) ||
            enquiry.status.toLowerCase().includes(term)
        );
      })
    );
  }
}
