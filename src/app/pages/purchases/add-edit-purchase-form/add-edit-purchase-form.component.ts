import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastService } from '../../../services/toast.service';
import { SupplierService, Supplier } from '../../../services/supplier.service';
import { PurchaseService, PurchaseDto } from '../../../services/purchase.service';
import { ProductService, Product } from '../../../services/product.service';
import { SettingsItem, SettingsService } from '../../../services/settings.service';

export interface PurchaseFormResult {
  id?: number;
  dto: PurchaseDto;
  alreadySaved?: boolean;
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
  products: Product[] = [];
  paymentTypes: SettingsItem[] = [];
  deliveryTypes: SettingsItem[] = [];
  currencies: SettingsItem[] = [];
  selectedFileName = '';
  uploading = false;
  saving = false;
  savedId: number | null = null;
  private onSaved?: () => void;

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private purchaseService: PurchaseService,
    private productService: ProductService,
    private settingsService: SettingsService,
    private toast: ToastService,
    private dialogRef: MatDialogRef<AddEditPurchaseFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Record<string, any> | null
  ) {
    this.isEdit = !!(data?.['purchase_id'] ?? data?.['id']);
    this.onSaved = data?.['onSaved'];

    const existingItems: any[] = data?.['items'] ?? [];

    this.form = this.fb.group({
      supplierId:        [data?.['supplier']?.['id'] ?? null, Validators.required],
      deliveryTypeId:    [data?.['delivery_type']?.['id'] ?? null],
      paymentTypeId:     [data?.['payment_type']?.['id'] ?? null],
      currencyId:        [data?.['currency']?.['id'] ?? null],
      transportExpenses: [data?.['transport_expenses'] ?? null, Validators.min(0)],
      customsExpenses:   [data?.['customs_expenses'] ?? null, Validators.min(0)],
      items: this.fb.array(
        existingItems.length
          ? existingItems.map(i => this.buildItem(i.product?.id, i.price, i.amount))
          : [this.buildItem()]
      ),
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  buildItem(productId: any = null, price: any = null, amount: any = null): FormGroup {
    return this.fb.group({
      productId: [productId, Validators.required],
      price:     [price,     [Validators.required, Validators.min(0)]],
      amount:    [amount,    Validators.min(0)],
    });
  }

  addItem(): void {
    this.items.push(this.buildItem());
  }

  removeItem(i: number): void {
    if (this.items.length > 1) this.items.removeAt(i);
  }

  totalAmount(i: number): number {
    const g = this.items.at(i) as FormGroup;
    const p = +(g.get('price')?.value ?? 0);
    const a = +(g.get('amount')?.value ?? 0);
    return p * a;
  }

  get grandTotal(): number {
    return this.items.controls.reduce((sum, _, i) => sum + this.totalAmount(i), 0);
  }

  get grandQty(): number {
    return this.items.controls.reduce((sum, g) => sum + +(g.get('amount')?.value ?? 0), 0);
  }

  ngOnInit(): void {
    this.supplierService.getAll().subscribe({ next: s => this.suppliers = s.filter(x => x.isActive === 'A') });
    this.productService.getAll().subscribe({ next: p => this.products = p });
    this.settingsService.getPaymentTypes().subscribe({ next: l => this.paymentTypes = l });
    this.settingsService.getDeliveryTypes().subscribe({ next: l => this.deliveryTypes = l });
    this.settingsService.getCurrencies().subscribe({ next: l => this.currencies = l });
  }

  productName(id: number): string {
    return this.products.find(p => p.id === id)?.productName ?? '';
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.selectedFileName = file.name;
    this.uploading = true;
    this.purchaseService.uploadCertificate(file).subscribe({
      next: path => { this.form.patchValue({ certificatePath: path }); this.uploading = false; },
      error: () => { this.uploading = false; this.selectedFileName = ''; },
    });
  }

  cancel(): void { this.dialogRef.close(); }

  private buildDto(): PurchaseDto {
    const v = this.form.value;
    return {
      supplierId:        v.supplierId,
      deliveryTypeId:    v.deliveryTypeId ?? undefined,
      paymentTypeId:     v.paymentTypeId ?? undefined,
      currencyId:        v.currencyId ?? undefined,
      transportExpenses: v.transportExpenses ?? undefined,
      customsExpenses:   v.customsExpenses ?? undefined,
      items:             (v.items as any[]).filter(i => i.productId != null),
    };
  }

  saqlash(): void {
    this.form.get('supplierId')?.markAsTouched();
    if (this.form.get('supplierId')?.invalid) return;

    this.saving = true;
    const dto = this.buildDto();
    const existingId = this.savedId ?? (this.data?.['purchase_id'] ?? this.data?.['id']);

    if (existingId) {
      this.purchaseService.edit(existingId, dto).subscribe({
        next: res => {
          this.saving = false;
          this.savedId = existingId;
          this.toast.showResult(res);
          this.onSaved?.();
        },
        error: () => { this.saving = false; this.toast.error('Xato yuz berdi'); },
      });
    } else {
      this.purchaseService.add(dto).subscribe({
        next: res => {
          this.saving = false;
          this.savedId = (res as any).object ?? null;
          this.toast.showResult(res);
          this.onSaved?.();
        },
        error: () => { this.saving = false; this.toast.error('Xato yuz berdi'); },
      });
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const existingId = this.data?.['purchase_id'] ?? this.data?.['id'];
    const result: PurchaseFormResult = {
      id: this.savedId ?? existingId,
      dto: this.buildDto(),
      alreadySaved: !!this.savedId,
    };
    this.dialogRef.close(result);
  }
}



