import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsItem, SettingsService } from '../../services/settings.service';

interface EditableItem extends SettingsItem {
  editing: boolean;
  editName: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  paymentTypes: EditableItem[] = [];
  newPaymentName = '';

  deliveryTypes: EditableItem[] = [];
  newDeliveryName = '';

  currencies: EditableItem[] = [];
  newCurrencyName = '';

  constructor(
    private settingsService: SettingsService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadPaymentTypes();
    this.loadDeliveryTypes();
    this.loadCurrencies();
  }

  private toEditable(items: SettingsItem[]): EditableItem[] {
    return items.map(i => ({ ...i, editing: false, editName: i.name }));
  }

  loadPaymentTypes(): void {
    this.settingsService.getPaymentTypes().subscribe({
      next: list => this.paymentTypes = this.toEditable(list),
    });
  }

  startEdit(item: EditableItem): void {
    item.editName = item.name;
    item.editing = true;
  }

  cancelEdit(item: EditableItem): void {
    item.editing = false;
  }

  addPaymentType(): void {
    const name = this.newPaymentName.trim();
    if (!name) return;
    this.settingsService.addPaymentType(name).subscribe({
      next: res => {
        this.snack.open(res.message, 'OK', { duration: 2000 });
        this.newPaymentName = '';
        this.loadPaymentTypes();
      },
    });
  }

  savePaymentType(item: EditableItem): void {
    const name = item.editName.trim();
    if (!name) return;
    this.settingsService.editPaymentType(item.id, name).subscribe({
      next: res => {
        this.snack.open(res.message, 'OK', { duration: 2000 });
        this.loadPaymentTypes();
      },
    });
  }

  deletePaymentType(id: number): void {
    this.settingsService.deletePaymentType(id).subscribe({
      next: res => {
        this.snack.open(res.message, 'OK', { duration: 2000 });
        this.loadPaymentTypes();
      },
    });
  }

  loadDeliveryTypes(): void {
    this.settingsService.getDeliveryTypes().subscribe({
      next: list => this.deliveryTypes = this.toEditable(list),
    });
  }

  addDeliveryType(): void {
    const name = this.newDeliveryName.trim();
    if (!name) return;
    this.settingsService.addDeliveryType(name).subscribe({
      next: res => {
        this.snack.open(res.message, 'OK', { duration: 2000 });
        this.newDeliveryName = '';
        this.loadDeliveryTypes();
      },
    });
  }

  saveDeliveryType(item: EditableItem): void {
    const name = item.editName.trim();
    if (!name) return;
    this.settingsService.editDeliveryType(item.id, name).subscribe({
      next: res => {
        this.snack.open(res.message, 'OK', { duration: 2000 });
        this.loadDeliveryTypes();
      },
    });
  }

  deleteDeliveryType(id: number): void {
    this.settingsService.deleteDeliveryType(id).subscribe({
      next: res => {
        this.snack.open(res.message, 'OK', { duration: 2000 });
        this.loadDeliveryTypes();
      },
    });
  }

  loadCurrencies(): void {
    this.settingsService.getCurrencies().subscribe({
      next: list => this.currencies = this.toEditable(list),
    });
  }

  addCurrency(): void {
    const name = this.newCurrencyName.trim();
    if (!name) return;
    this.settingsService.addCurrency(name).subscribe({
      next: res => {
        this.snack.open(res.message, 'OK', { duration: 2000 });
        this.newCurrencyName = '';
        this.loadCurrencies();
      },
    });
  }

  saveCurrency(item: EditableItem): void {
    const name = item.editName.trim();
    if (!name) return;
    this.settingsService.editCurrency(item.id, name).subscribe({
      next: res => {
        this.snack.open(res.message, 'OK', { duration: 2000 });
        this.loadCurrencies();
      },
    });
  }

  deleteCurrency(id: number): void {
    this.settingsService.deleteCurrency(id).subscribe({
      next: res => {
        this.snack.open(res.message, 'OK', { duration: 2000 });
        this.loadCurrencies();
      },
    });
  }
}
