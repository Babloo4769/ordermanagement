import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  Enquiry,
  EnquiryProduct,
  EnquiryStatus,
  FlagEnum,
} from "@/domain/customer";

/**
 * Type definition for modal operation modes
 * - create: Creating a new enquiry
 * - edit: Modifying an existing enquiry
 * - view: Viewing enquiry details (read-only)
 */
export type ModalMode = "create" | "edit" | "view";

/**
 * Modal component for creating, editing, and viewing enquiries
 * Provides a form interface for managing enquiry data and products
 */
@Component({
  selector: "app-enquiry-form-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./enquiry-form-modal.component.html",
  styleUrls: ["./enquiry-form-modal.component.scss"],
})
export class EnquiryFormModalComponent implements OnInit {
  /**
   * Loader for products table
   */
  isLoadingProducts = false;
  /**
   * Current operation mode of the modal
   * Determines form behavior and available actions
   */
  @Input() mode: ModalMode = "create";

  /**
   * Existing enquiry data for edit/view modes
   * Undefined when creating a new enquiry
   */
  @Input() enquiry?: Enquiry;

  /**
   * Event emitted when the modal should be closed
   */
  @Output() closeModal = new EventEmitter<void>();

  /**
   * Event emitted when an enquiry should be saved
   * Contains the form data for create/update operations
   * (Type is 'any' to support custom API payload structure)
   */
  @Output() saveEnquiry = new EventEmitter<any>();

  /**
   * Event emitted when the modal mode changes
   * Used when switching from view to edit mode
   */
  @Output() modeChange = new EventEmitter<ModalMode>();

  /**
   * Main form group for the enquiry data
   * Initialized in the constructor
   */
  enquiryForm: FormGroup = this.initializeForm();

  /**
   * Flag indicating if a save operation is in progress
   */
  isSubmitting = false;

  /**
   * Available status options for enquiries
   */
  statuses: EnquiryStatus[] = ["Open", "Processed", "Closed"];

  /**
   * Available flag options for products
   */
  flagOptions: FlagEnum[] = ["Y", "N"];

  constructor(private fb: FormBuilder) {}

  /**
   * Initializes the form with default values and validation rules
   * @returns A new FormGroup instance
   */
  private initializeForm(): FormGroup {
    return this.fb.group({
      customerId: ["", [Validators.required, Validators.minLength(3)]],
      enquiryDateTime: ["", Validators.required],
      status: ["Open", Validators.required],
      products: this.fb.array(
        [],
        [Validators.required, Validators.minLength(1)]
      ),
    });
  }

  ngOnInit() {
    if (this.mode === "create") {
      // Set default date and time for new enquiries
      this.enquiryForm.patchValue({
        enquiryDateTime: new Date().toISOString().slice(0, 16),
      });
    }

    if (this.enquiry) {
      // Populate form with existing enquiry data
      this.enquiryForm.patchValue({
        customerId: this.enquiry.customerName || this.enquiry.customerId,
        enquiryDateTime: new Date(this.enquiry.enquiryDateTime)
          .toISOString()
          .slice(0, 16),
        status: this.enquiry.status,
      });

      // Add existing products to the form
      this.enquiry.products.forEach((product) => {
        this.addProduct(product);
      });
    }

    // Disable form in view mode
    if (this.mode === "view") {
      this.enquiryForm.disable();
    }
  }

  /**
   * Accessor for the products form array
   */
  get productsFormArray(): FormArray {
    return this.enquiryForm.get("products") as FormArray;
  }

  /**
   * Gets a specific product form group by index
   * @param index Index of the product in the array
   */
  getProductFormGroup(index: number): FormGroup {
    return this.productsFormArray.at(index) as FormGroup;
  }

  /**
   * Creates a form group for a product with validation rules
   * @param product Optional existing product data to populate the form
   */
  createProductFormGroup(product?: EnquiryProduct): FormGroup {
    return this.fb.group({
      quantity: [
        product?.quantity || "",
        [Validators.required, Validators.min(1)],
      ],
      chemicalName: [product?.chemicalName || ""],
      price: [product?.price || "", [Validators.min(0)]],
      casNumber: [
        product?.casNumber || "",
        [Validators.pattern(/^\d{7}-\d{2}-\d$/)],
      ],
      catNumber: [
        product?.catNumber || "",
        [Validators.pattern(/^ISP-[A-Z]\d{6}$/)],
      ],
      molecularWeight: [product?.molecularWeight || "", [Validators.min(0)]],
      variant: [product?.variant || ""],
      flag: [product?.flag || "N"],
      attachmentRef: [product?.attachmentRef || ""],
    });
  }

  /**
   * Adds a new product to the form
   * @param product Optional existing product data to populate the form
   */
  addProduct(product?: EnquiryProduct) {
    this.productsFormArray.push(this.createProductFormGroup(product));
  }

  /**
   * Removes a product from the form
   * @param index Index of the product to remove
   */
  removeProduct(index: number) {
    this.productsFormArray.removeAt(index);
  }

  /**
   * Gets the appropriate title for the modal based on mode
   */
  getModalTitle(): string {
    switch (this.mode) {
      case "create":
        return "Create Enquiry";
      case "edit":
        return "Edit Enquiry";
      case "view":
        return "Enquiry Details";
      default:
        return "";
    }
  }

  /**
   * Gets the appropriate subtitle for the modal based on mode
   */
  getModalSubtitle(): string {
    switch (this.mode) {
      case "create":
        return "Fill in the information below to create a new enquiry";
      case "edit":
        return "Update the enquiry information below";
      case "view":
        return "View detailed enquiry information";
      default:
        return "";
    }
  }

  /**
   * Gets the appropriate text for the save button
   * Shows loading state when submitting
   */
  getSaveButtonText(): string {
    if (this.isSubmitting) {
      return "Saving...";
    }
    return this.mode === "create" ? "Create Enquiry" : "Save Changes";
  }

  /**
   * Switches the modal from view to edit mode
   */
  switchToEdit() {
    this.mode = "edit";
    this.modeChange.emit(this.mode);
    this.enquiryForm.enable();
  }

  /**
   * Closes the modal
   */
  close() {
    this.closeModal.emit();
  }

  /**
   * Checks if a form field is invalid and has been touched
   * @param formGroup Form group containing the field
   * @param fieldName Name of the field to check
   */
  isFieldInvalid(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  /**
   * Handles file selection for product attachments
   * @param event File input change event
   * @param index Index of the product
   */
  onFileSelected(event: Event, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const productGroup = this.getProductFormGroup(index);
      productGroup.patchValue({ attachmentRef: file.name });
    }
  }

  /**
   * Handles form submission
   * Validates the form and emits the enquiry data if valid
   */
  onSubmit() {
    if (this.enquiryForm.valid) {
      this.isSubmitting = true;
      const formValue = this.enquiryForm.value;

      // Build attachments array for each product (if any)
      const attachments = formValue.products
        .filter((p: any) => p.attachmentRef)
        .map((p: any) => ({
          file_name: p.attachmentRef,
          file_type: "", // You can enhance this to capture file type if needed
          file_url: `s3://ordermanagement-attachments/temp/${p.attachmentRef}`,
        }));

      // Build products array in required format
      const products = formValue.products.map((p: any) => ({
        cas_number: p.casNumber,
        cat_number: p.catNumber,
        chemical_name: p.chemicalName,
        molecular_weight: p.molecularWeight,
        price: p.price,
        product_name: p.chemicalName, // or another field if you have a separate product_name
        quantity: p.quantity,
        variant: p.variant,
      }));

      // Build the emails array as required by backend
      const payload = {
        emails: [
          {
            attachments,
            customer_id: formValue.customerId,
            email_content: "", // You can add a field in your form for this if needed
            products,
          },
        ],
      };

      this.saveEnquiry.emit(payload);
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.enquiryForm.controls).forEach((key) => {
        const control = this.enquiryForm.get(key);
        control?.markAsTouched();
      });

      // Mark all product form fields as touched
      this.productsFormArray.controls.forEach((control: AbstractControl) => {
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach((key) => {
            const field = control.get(key);
            field?.markAsTouched();
          });
        }
      });
    }
  }
}
