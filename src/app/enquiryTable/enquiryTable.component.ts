import { Component, OnInit, OnDestroy, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  EnquiryFormModalComponent,
  ModalMode,
} from "./enquiry-form-modal/enquiry-form-modal.component";
import { Enquiry, EnquiryStatus } from "@/domain/customer";
import { FormsModule } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { EnquiryService } from "../service/enquiry.service";
import { Subscription } from "rxjs";

/**
 * Main component for displaying and managing enquiries in a table format
 * Provides functionality for viewing, creating, editing, and searching enquiries
 * Includes pagination and status filtering capabilities
 */
@Component({
  selector: "app-enquiry-table",
  standalone: true,
  imports: [CommonModule, EnquiryFormModalComponent, FormsModule, DatePipe],
  templateUrl: "./enquiryTable.component.html",
})
export class EnquiryTableComponent implements OnInit, OnDestroy {
  /** Loader state for API calls */
  loading = false;
  /** Master list of all enquiries */
  enquiries: Enquiry[] = [];

  /** Filtered list of enquiries based on search criteria */
  filteredEnquiries: Enquiry[] = [];

  /** Controls visibility of the enquiry modal */
  showModal = false;

  /** Current operation mode of the modal (create/edit/view) */
  modalMode: ModalMode = "create";

  /** Currently selected enquiry for edit/view operations */
  selectedEnquiry?: Enquiry;

  /** Current search text input value */
  searchText = "";

  /** Collection of all active subscriptions for cleanup */
  private subscription: Subscription = new Subscription();

  /** Pagination configuration */
  currentPage = 1; // Current active page
  pageSize = 10; // Number of items per page
  pageSizeOptions = [5, 10, 25, 50]; // Available page size options
  totalPages = 0; // Total number of pages

  /** Service for managing enquiry data */
  private enquiryService = inject(EnquiryService);

  /**
   * Initializes the component by loading enquiries
   */
  ngOnInit() {
    this.loadEnquiries();
  }

  /**
   * Cleans up subscriptions when component is destroyed
   */
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Loads all enquiries from the service and initializes the view
   * Updates both master and filtered lists
   */
  private loadEnquiries() {
    this.loading = true;
    this.subscription.add(
      this.enquiryService.getAllEnquiries().subscribe(
        (enquiries: Enquiry[]) => {
          this.enquiries = enquiries;
          this.filteredEnquiries = enquiries;
          this.updatePagination();
          this.loading = false;
        },
        () => {
          this.loading = false;
        }
      )
    );
  }

  /**
   * Returns CSS classes for enquiry status badges
   * @param status Current status of the enquiry
   * @returns String of CSS classes for styling the status badge
   */
  getStatusClass(status: EnquiryStatus): string {
    const baseClasses =
      "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ";
    switch (status) {
      case "Open":
        return baseClasses + "bg-blue-100 text-blue-800";
      case "Processed":
        return baseClasses + "bg-yellow-100 text-yellow-800";
      case "Closed":
        return baseClasses + "bg-green-100 text-green-800";
      default:
        return baseClasses + "bg-gray-100 text-gray-800";
    }
  }

  /**
   * Opens the modal in create mode
   * Resets selected enquiry and sets appropriate mode
   */
  openCreateModal() {
    this.modalMode = "create";
    this.selectedEnquiry = undefined;
    this.showModal = true;
  }

  /**
   * Opens the modal in view mode for a specific enquiry
   * @param enquiry Enquiry to view
   */
  viewEnquiry(enquiry: Enquiry) {
    this.modalMode = "view";
    this.selectedEnquiry = { ...enquiry };
    this.showModal = true;
  }

  /**
   * Opens the modal in edit mode for a specific enquiry
   * @param enquiry Enquiry to edit
   */
  editEnquiry(enquiry: Enquiry) {
    this.modalMode = "edit";
    this.selectedEnquiry = { ...enquiry };
    this.showModal = true;
  }

  /**
   * Closes the modal and resets selected enquiry
   */
  closeModal() {
    this.showModal = false;
    this.selectedEnquiry = undefined;
  }

  /**
   * Updates modal mode when changed (e.g., from view to edit)
   * @param mode New modal mode
   */
  onModalModeChange(mode: ModalMode) {
    this.modalMode = mode;
  }

  /**
   * Handles saving of enquiry data from the modal
   * Creates new enquiry or updates existing one based on mode
   * @param enquiryData Form data from the modal
   */
  saveEnquiry(enquiryData: Partial<Enquiry>) {
    if (this.modalMode === "create") {
      // Prepare customer object from enquiryData (adjust as needed)
      const customer = {
        customer_id: "", // Let backend generate or fill if available
        // Add more fields here if you collect them in the form
      };
      this.enquiryService
        .createCustomer(customer)
        .subscribe((customerRes: any) => {
          const customer_id =
            customerRes.customer_id || customerRes.id || customer.customer_id;
          const newEnquiry = {
            ...enquiryData,
            customer_id: customer_id,
            enquiry_date: enquiryData.enquiry_datetime
              ? enquiryData.enquiry_datetime.split("T")[0]
              : "",
            enquiry_time: enquiryData.enquiry_datetime
              ? enquiryData.enquiry_datetime.split("T")[1]
              : "",
            status: enquiryData.status || "open",
            products: enquiryData.products || [],
          };
          // Now handled by modal: creation logic moved to modal component
          this.loadEnquiries();
        });
    } else if (this.modalMode === "edit" && this.selectedEnquiry) {
      this.enquiryService.updateEnquiry({
        ...this.selectedEnquiry,
        ...enquiryData,
      } as Enquiry);
    }
    this.showModal = false;
    this.selectedEnquiry = undefined;
  }

  /**
   * Handles search input changes
   * Filters enquiries based on search term
   * @param value Search term entered by user
   */
  onSearch(value: string) {
    this.subscription.add(
      this.enquiryService
        .searchEnquiries(value)
        .subscribe((results: Enquiry[]) => {
          this.filteredEnquiries = results;
          this.currentPage = 1;
          this.updatePagination();
        })
    );
  }

  /**
   * Clears search and resets to full enquiry list
   */
  clear() {
    this.searchText = "";
    this.filteredEnquiries = [...this.enquiries];
    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Gets the enquiries for the current page
   * @returns Slice of filtered enquiries for current page
   */
  get paginatedEnquiries(): Enquiry[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredEnquiries.slice(startIndex, startIndex + this.pageSize);
  }

  /**
   * Updates pagination state based on current data
   * Recalculates total pages and adjusts current page if needed
   */
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredEnquiries.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
  }

  /**
   * Handles page navigation
   * @param page Target page number
   */
  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  /**
   * Handles changes to page size
   * Resets to first page and updates pagination
   * @param size New page size
   */
  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.updatePagination();
  }

  /**
   * Calculates the page numbers to display in pagination
   * Shows up to 5 pages with current page centered when possible
   * @returns Array of page numbers to display
   */
  get pageNumbers(): number[] {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  /**
   * Calculates the starting index of items on current page
   * @returns Index of first item on current page
   */
  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  /**
   * Calculates the ending index of items on current page
   * @returns Index of last item on current page
   */
  get endIndex(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredEnquiries.length
    );
  }
}
