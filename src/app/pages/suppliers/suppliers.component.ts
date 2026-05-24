import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Supplier, SupplierFormComponent } from './supplier-form/supplier-form.component';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent {
  private nextId = 4;
  private allSuppliers: Supplier[] = [
    ];

  constructor(private dialog: MatDialog) {}

  onSearch(value: string) {
    const q = value.toLowerCase();
    const filtered = this.allSuppliers.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.contactPerson.toLowerCase().includes(q) ||
      s.phone.includes(q)
    );
  }

  onFilter() {}
  onExcel() {}

  openAdd() {
    const ref = this.dialog.open(SupplierFormComponent, {
      data: null, width: '560px', disableClose: true,
    });
    ref.afterClosed().subscribe((result: Supplier | undefined) => {
      if (!result) return;
      this.allSuppliers.push({ ...result, id: this.nextId++ });
    });
  }

  onEdit(row: Record<string, any>) {
    const supplier = this.allSuppliers.find(s => s.id === row['id'])!;
    const ref = this.dialog.open(SupplierFormComponent, {
      data: { ...supplier }, width: '560px', disableClose: true,
    });
    ref.afterClosed().subscribe((result: Supplier | undefined) => {
      if (!result) return;
      const idx = this.allSuppliers.findIndex(s => s.id === result.id);
      if (idx !== -1) this.allSuppliers[idx] = result;
    });
  }

  onDelete(row: Record<string, any>) {
    this.allSuppliers = this.allSuppliers.filter(s => s.id !== row['id']);
  }

}
