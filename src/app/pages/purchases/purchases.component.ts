import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {AddEditPurchaseFormComponent, Purchase} from "./add-edit-purchase-form/add-edit-purchase-form.component";
@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.scss']
})
export class PurchasesComponent {
  onSearch(value: string) {
  }
  onFilter() {}
  onExcel() {}

  constructor(public dialog: MatDialog) {
  }

  openAdd() {
    const ref = this.dialog.open(AddEditPurchaseFormComponent, {
      data: null, width: '560px', disableClose: true,
    });
    ref.afterClosed().subscribe((result: Purchase | undefined) => {
      if (!result) return;
    });
  }

  onEdit(row: Record<string, any>) {
    const ref = this.dialog.open(AddEditPurchaseFormComponent, {
    });
    ref.afterClosed().subscribe((result: Purchase | undefined) => {
      if (!result) return;

    });
  }

  onDelete() {
  }
}
