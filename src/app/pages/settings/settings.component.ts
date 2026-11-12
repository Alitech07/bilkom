import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { CurrencyRate, SettingsItem, SettingsService, isSomCurrency } from '../../services/settings.service';

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

  rates: CurrencyRate[] = [];
  private latestByCurrency = new Map<number, CurrencyRate>();
  newRateCurrencyId: number | null = null;
  newRateValue: number | null = null;
  newRateDate = SettingsComponent.now();

  constructor(
    private settingsService: SettingsService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadPaymentTypes();
    this.loadDeliveryTypes();
    this.loadCurrencies();
    this.loadRates();
  }

  private static now(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  get foreignCurrencies(): EditableItem[] {
    return this.currencies.filter(c => !isSomCurrency(c.name));
  }

  isCurrent(r: CurrencyRate): boolean {
    return this.latestByCurrency.get(r.currency.id)?.id === r.id;
  }

  loadRates(): void {
    this.settingsService.getCurrencyRates().subscribe({
      next: list => {
        this.rates = list;
        this.latestByCurrency = new Map();
        for (const r of list) {
          if (!this.latestByCurrency.has(r.currency.id)) this.latestByCurrency.set(r.currency.id, r);
        }
      },
    });
  }

  addRate(): void {
    if (!this.newRateCurrencyId) { this.toast.warning('Valyutani tanlang'); return; }
    if (!this.newRateValue || this.newRateValue <= 0) { this.toast.warning('Kursni kiriting'); return; }
    this.settingsService.addCurrencyRate({
      currencyId: this.newRateCurrencyId,
      rate: this.newRateValue,
      rateDate: this.newRateDate || SettingsComponent.now(),
    }).subscribe({
      next: res => {
        this.toast.showResult(res);
        if (res.success) {
          this.newRateValue = null;
          this.newRateDate = SettingsComponent.now();
          this.loadRates();
        }
      },
      error: () => this.toast.error('Xato yuz berdi'),
    });
  }

  deleteRate(id: number): void {
    this.settingsService.deleteCurrencyRate(id).subscribe({
      next: res => {
        this.toast.showResult(res);
        if (res.success) this.loadRates();
      },
      error: () => this.toast.error('Xato yuz berdi'),
    });
  }

  formatRate(val: number): string {
    return new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 4 }).format(val);
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
        this.toast.showResult(res);
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
        this.toast.showResult(res);
        if (res.success) this.loadPaymentTypes();
      },
    });
  }

  deletePaymentType(id: number): void {
    this.settingsService.deletePaymentType(id).subscribe({
      next: res => {
        this.toast.showResult(res);
        if (res.success) this.loadPaymentTypes();
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
        this.toast.showResult(res);
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
        this.toast.showResult(res);
        if (res.success) this.loadDeliveryTypes();
      },
    });
  }

  deleteDeliveryType(id: number): void {
    this.settingsService.deleteDeliveryType(id).subscribe({
      next: res => {
        this.toast.showResult(res);
        if (res.success) this.loadDeliveryTypes();
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
        this.toast.showResult(res);
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
        this.toast.showResult(res);
        if (res.success) { this.loadCurrencies(); this.loadRates(); }
      },
    });
  }

  deleteCurrency(id: number): void {
    this.settingsService.deleteCurrency(id).subscribe({
      next: res => {
        this.toast.showResult(res);
        if (res.success) this.loadCurrencies();
      },
    });
  }
}



