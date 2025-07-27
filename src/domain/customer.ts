/**
 * Domain models for the enquiry management system
 */

/**
 * Represents a country with its name and code
 * Used for displaying country flags and information
 */
export interface Country {
  name: string; // Full name of the country
  code: string; // Two-letter country code (ISO 3166-1 alpha-2)
}

/**
 * Represents a company representative
 * Used for contact information and avatar display
 */
export interface Representative {
  name?: string; // Name of the representative
  image?: string; // URL or path to the representative's avatar image
}

/**
 * Basic customer information
 * Used for customer identification and reference
 */
export interface Customer {
  customer_id: string; // Unique customer identifier (e.g., "cust-001")
  name: string; // Full name or company name of the customer
  address: string; // Customer address
  contact_owner: string; // Contact owner (e.g., ISP Email)
  department: string; // Department (e.g., Procurement)
  email: string; // Email address
  flag: string; // Status flag (e.g., 'y')
  landline: string; // Landline phone number
  mobile: string; // Mobile phone number
  organization: string; // Organization name
  phone: string; // Phone number
  tag: string; // Tag (e.g., VIP)
  title: string; // Title (e.g., Purchasing Manager)
}

/**
 * Valid status values for an enquiry
 * Tracks the progress of an enquiry through its lifecycle
 */
export type EnquiryStatus = "Open" | "Processed" | "Closed";

/**
 * Flag values for product-related indicators
 * Y: Yes/Active/Available
 * N: No/Inactive/Unavailable
 */
export type FlagEnum = "Y" | "N";

/**
 * Represents a product in an enquiry
 * Contains all chemical and commercial details of the product
 */
export interface EnquiryProduct {
  quantity: number; // Quantity requested by the customer
  chemicalName?: string; // Chemical compound name
  price?: number; // Price per unit
  casNumber?: string; // Chemical Abstracts Service registry number (format: XXXXXXX-XX-X)
  catNumber?: string; // Catalog number (format: ISP-AXXXXXX)
  molecularWeight?: number; // Molecular weight in g/mol
  variant?: string; // Product variant (e.g., "25kg Drum")
  flag?: FlagEnum; // Product status flag
  attachmentRef?: string; // Reference to attached documents
}

/**
 * Main enquiry entity
 * Represents a customer's request for products with all related information
 */
export interface Enquiry {
  enquiryId: number; // Unique 5-digit identifier for the enquiry
  customerId: number; // Reference to the customer who made the enquiry
  customerName: string; // Name of the customer (denormalized for display)
  enquiryDateTime: string; // Date and time when the enquiry was created
  status: EnquiryStatus; // Current status of the enquiry
  products: EnquiryProduct[]; // List of products included in the enquiry
}
