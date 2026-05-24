import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GridService } from '../../../services/grid.service';

export interface Purchase {
  id: number;
  name: string;
  description: string;
  price: number;
  amount: number;
  track: string;
}

@Component({
  selector: 'app-add-edit-purchase-form',
  templateUrl: './add-edit-purchase-form.component.html',
  styleUrls: ['./add-edit-purchase-form.component.scss']
})
export class AddEditPurchaseFormComponent {
  isEdit: boolean;
  form: FormGroup;
  supplieres: string[];

  constructor(
    private fb: FormBuilder,
    private gridService: GridService,
    private dialogRef: MatDialogRef<AddEditPurchaseFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Purchase | null
  ) {
    this.isEdit   = !!data;
    this.supplieres = this.gridService.getSupplierNames();
    this.form = this.fb.group({
      name:        [data?.name        ?? '', Validators.required],
      description: [data?.description ?? ''],
      price:       [data?.price       ?? null, [Validators.required, Validators.min(0)]],
      amount:      [data?.amount      ?? null, [Validators.required, Validators.min(1)]],
      track:       [data?.track       ?? 's',  Validators.required],
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close({ ...this.data, ...this.form.value });
  }
}
