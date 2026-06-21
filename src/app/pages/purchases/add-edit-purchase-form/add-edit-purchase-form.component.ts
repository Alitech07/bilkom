import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SupplierService, Supplier } from '../../../services/supplier.service';
import { PurchaseService, PurchaseDto } from '../../../services/purchase.service';

export interface PurchaseFormResult {
  id?: number;
  dto: PurchaseDto;
}

@Component({
  selector: 'app-add-edit-purchase-form',
  templateUrl: './add-edit-purchase-form.component.html',
  styleUrls: ['./add-edit-purchase-form.component.scss']
})
export class AddEditPurchaseFormComponent implements OnInit {
  isEdit: boolean;
  form: FormGroup;
  suppliers: Supplier[] = [];
  selectedFileName = '';
  uploading = false;

  readonly deliveryTypes = [
    { value: 'CIP',      label: 'CIP (Carriage and Insurance Paid)' },
    { value: 'LOGISTICS', label: 'Logistik' },
  ];

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private purchaseService: PurchaseService,
    private dialogRef: MatDialogRef<AddEditPurchaseFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Record<string, any> | null
  ) {
    this.isEdit = !!data;
    this.form = this.fb.group({
      supplierId:       [data?.['supplier_id'] ?? null, Validators.required],
      productName:      [data?.['product_name'] ?? '',  Validators.required],
      country:          [data?.['country']       ?? ''],
      brand:            [data?.['brand']         ?? ''],
      deliveryType:     [data?.['delivery_type'] ?? null, Validators.required],
      price:            [data?.['price']         ?? null, [Validators.required, Validators.min(0)]],
      certificatePath:  [data?.['certificate_path'] ?? ''],
    });
  }

  ngOnInit(): void {
    this.supplierService.getAll().subscribe({
      next: suppliers => this.suppliers = suppliers.filter(s => s.isActive === 'A'),
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.selectedFileName = file.name;
    this.uploading = true;
    this.purchaseService.uploadCertificate(file).subscribe({
      next: path => {
        this.form.patchValue({ certificatePath: path });
        this.uploading = false;
      },
      error: () => {
        this.uploading = false;
        this.selectedFileName = '';
      },
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const result: PurchaseFormResult = {
      id: this.data?.['purchase_id'] ?? this.data?.['id'],
      dto: this.form.value as PurchaseDto,
    };
    this.dialogRef.close(result);
  }
}
