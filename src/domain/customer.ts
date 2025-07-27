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
export type FlagEnum = "y" | "N";

/**
 * Represents a product in an enquiry
 * Contains all chemical and commercial details of the product
 */
export interface EnquiryProduct {
  product_id: string; // Product unique identifier (e.g., 'isp-a123')
  quantity: number;
  chemical_name: string;
  price: number;
  cas_number: string;
  cat_number?: string;
  molecular_weight?: number;
  variant?: string;
  flag?: FlagEnum; // Optional flag indicating product status
  attachmentRef?: string; // Optional reference to an attachment (e.g., image, document)
  // Add other fields as needed
}

/**
 * Main enquiry entity
 * Represents a customer's request for products with all related information
 */
export interface Enquiry {
  enquiry_id: string; // e.g., 'isp02/25/0020'
  customer_id: string; // e.g., 'cust-001'
  enquiry_date: string; // e.g., '05-07-2025'
  enquiry_time: string; // e.g., '05-07-2025'
  enquiry_datetime: string; // e.g., '2025-07-05T01:11:00'
  status: EnquiryStatus; // Current status of the enquiry
  customer_name?: string; // Optional customer name for display purposes
  products: EnquiryProduct[];
  // Add other fields as needed
}
