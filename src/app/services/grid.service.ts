import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface GridColumn {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'number' | 'date';
  width?: string;
  badgeMap?: Record<string, 'green' | 'blue' | 'yellow' | 'red' | 'gray'>;
}

export interface GridConfig {
  title: string;
  columns: GridColumn[];
  data: Record<string, any>[];
}


const REGISTRY: Record<string, GridConfig> = {

  products: {
    title: 'Kimyoviy moddalar',
    columns: [
      { key: 'id',      label: '#',              width: '56px' },
      { key: 'nomi',    label: 'Nomi' },
      { key: 'formula', label: 'Formula' },
      { key: 'miqdor',  label: 'Miqdor',         type: 'number' },
      { key: 'birlik',  label: "O'lchov birligi", width: '120px' },
      { key: 'holat',   label: 'Holat',           type: 'badge',
        badgeMap: { Mavjud: 'green', Kam: 'yellow', Tugagan: 'red' } },
    ],
    data: [
      { id: 1, nomi: 'Sulfat kislota',  formula: 'H₂SO₄',    miqdor: 250, birlik: 'kg', holat: 'Mavjud'  },
      { id: 2, nomi: 'Natriy xlorid',  formula: 'NaCl',      miqdor: 50,  birlik: 'kg', holat: 'Kam'     },
      { id: 3, nomi: 'Xlorid kislota', formula: 'HCl',       miqdor: 0,   birlik: 'L',  holat: 'Tugagan' },
      { id: 4, nomi: 'Glitserin',      formula: 'C₃H₈O₃',   miqdor: 120, birlik: 'kg', holat: 'Mavjud'  },
      { id: 5, nomi: 'Etanol',         formula: 'C₂H₅OH',   miqdor: 80,  birlik: 'L',  holat: 'Mavjud'  },
      { id: 6, nomi: 'Ammiak',         formula: 'NH₃',       miqdor: 35,  birlik: 'kg', holat: 'Kam'     },
    ],
  },

  orders: {
    title: 'Buyurtmalar',
    columns: [
      { key: 'id',       label: 'ID',       width: '100px' },
      { key: 'mijoz',    label: 'Mijoz' },
      { key: 'mahsulot', label: 'Mahsulot' },
      { key: 'miqdor',   label: 'Miqdor',   width: '90px' },
      { key: 'sana',     label: 'Sana',     type: 'date', width: '110px' },
      { key: 'holat',    label: 'Holat',    type: 'badge',
        badgeMap: { Bajarildi: 'green', Jarayonda: 'blue', Kutmoqda: 'yellow', Bekor: 'red' } },
    ],
    data: [
      { id: '#BLK-001', mijoz: 'Karimov Sardor',     mahsulot: 'Sulfat kislota', miqdor: '50 kg',  sana: '07.05.2026', holat: 'Bajarildi' },
      { id: '#BLK-002', mijoz: 'Toshmatova Nilufar', mahsulot: 'Natriy xlorid',  miqdor: '200 kg', sana: '06.05.2026', holat: 'Jarayonda' },
      { id: '#BLK-003', mijoz: 'Raximov Bobur',      mahsulot: 'Xlorid kislota', miqdor: '30 L',   sana: '05.05.2026', holat: 'Kutmoqda'  },
      { id: '#BLK-004', mijoz: 'Yusupova Malika',    mahsulot: 'Glitserin',      miqdor: '15 kg',  sana: '04.05.2026', holat: 'Bajarildi' },
      { id: '#BLK-005', mijoz: 'Mirzayev Jasur',     mahsulot: 'Etanol',         miqdor: '40 L',   sana: '03.05.2026', holat: 'Bekor'     },
    ],
  },

  customers: {
    title: 'Mijozlar',
    columns: [
      { key: 'id',      label: '#',            width: '56px' },
      { key: 'ism',     label: 'Ism Familiya' },
      { key: 'telefon', label: 'Telefon',      width: '150px' },
      { key: 'email',   label: 'Email' },
      { key: 'shahar',  label: 'Shahar',       width: '110px' },
      { key: 'holat',   label: 'Holat',        type: 'badge', width: '100px',
        badgeMap: { Faol: 'green', 'Faol emas': 'gray' } },
    ],
    data: [
      { id: 1, ism: 'Karimov Sardor',     telefon: '+998 90 123 45 67', email: 'sardor@mail.uz',   shahar: 'Toshkent',  holat: 'Faol'     },
      { id: 2, ism: 'Toshmatova Nilufar', telefon: '+998 91 234 56 78', email: 'nilufar@mail.uz',  shahar: 'Samarqand', holat: 'Faol'     },
      { id: 3, ism: 'Raximov Bobur',      telefon: '+998 93 345 67 89', email: 'bobur@mail.uz',    shahar: 'Buxoro',    holat: 'Faol emas' },
      { id: 4, ism: 'Yusupova Malika',    telefon: '+998 94 456 78 90', email: 'malika@mail.uz',   shahar: 'Toshkent',  holat: 'Faol'     },
      { id: 5, ism: 'Mirzayev Jasur',     telefon: '+998 95 567 89 01', email: 'jasur@mail.uz',    shahar: 'Namangan',  holat: 'Faol emas' },
    ],
  },

  warehouse: {
    title: 'Ombor',
    columns: [
      { key: 'id',       label: '#',           width: '56px' },
      { key: 'mahsulot', label: 'Mahsulot' },
      { key: 'qoldiq',   label: 'Qoldiq',      type: 'number', width: '90px' },
      { key: 'birlik',   label: 'Birlik',       width: '80px' },
      { key: 'joy',      label: 'Saqlash joyi', width: '120px' },
      { key: 'holat',    label: 'Holat',        type: 'badge',
        badgeMap: { Normal: 'green', Kam: 'yellow', Kritik: 'red' } },
    ],
    data: [
      { id: 1, mahsulot: 'Sulfat kislota',  qoldiq: 250, birlik: 'kg', joy: 'A-12', holat: 'Normal' },
      { id: 2, mahsulot: 'Natriy xlorid',  qoldiq: 50,  birlik: 'kg', joy: 'B-03', holat: 'Kam'    },
      { id: 3, mahsulot: 'Xlorid kislota', qoldiq: 5,   birlik: 'L',  joy: 'C-07', holat: 'Kritik' },
      { id: 4, mahsulot: 'Glitserin',      qoldiq: 120, birlik: 'kg', joy: 'A-08', holat: 'Normal' },
      { id: 5, mahsulot: 'Etanol',         qoldiq: 18,  birlik: 'L',  joy: 'B-11', holat: 'Kam'    },
    ],
  },

  invoices: {
    title: 'Hisob-faktura',
    columns: [
      { key: 'id',      label: 'Faktura #',   width: '110px' },
      { key: 'mijoz',   label: 'Mijoz' },
      { key: 'summa',   label: 'Summa (so\'m)', type: 'number', width: '140px' },
      { key: 'sana',    label: 'Sana',         type: 'date', width: '110px' },
      { key: 'muddat',  label: 'Muddat',        width: '110px' },
      { key: 'holat',   label: 'Holat',         type: 'badge',
        badgeMap: { "To'landi": 'green', "Jarayonda": 'blue', "Muddati o'tgan": 'red', Yuborildi: 'yellow' } },
    ],
    data: [
      { id: 'INV-2026-001', mijoz: 'Karimov Sardor',     summa: 4500000, sana: '01.05.2026', muddat: '01.06.2026', holat: "To'landi"      },
      { id: 'INV-2026-002', mijoz: 'Toshmatova Nilufar', summa: 1200000, sana: '03.05.2026', muddat: '03.06.2026', holat: 'Jarayonda'     },
      { id: 'INV-2026-003', mijoz: 'Raximov Bobur',      summa: 800000,  sana: '10.04.2026', muddat: '10.05.2026', holat: "Muddati o'tgan"},
      { id: 'INV-2026-004', mijoz: 'Yusupova Malika',    summa: 2100000, sana: '05.05.2026', muddat: '05.06.2026', holat: 'Yuborildi'     },
    ],
  },

  suppliers: {
    title: 'Yetkazib beruvchilar',
    columns: [
      { key: 'id',            label: '#',              width: '56px' },
      { key: 'name',          label: 'Kompaniya nomi' },
      { key: 'contactPerson', label: "Mas'ul shaxs" },
      { key: 'phone',         label: 'Telefon',        width: '160px' },
      { key: 'email',         label: 'Email' },
      { key: 'address',       label: 'Manzil' },
      { key: 'status',        label: 'Holati',         type: 'badge', width: '90px',
        badgeMap: { Faol: 'green', Nofaol: 'gray' } },
    ],
    data: [
      { id: 1, name: 'Alfa Kimyo',   contactPerson: 'Alisher Karimov',  phone: '+998 90 123 45 67', email: 'alfa@kimyo.uz',  address: 'Toshkent, Yunusobod',   status: 'Faol'    },
      { id: 2, name: 'Bioaktiv OAJ',   contactPerson: 'Nilufar Yusupova', phone: '+998 91 234 56 78', email: 'bio@reaktiv.uz', address: 'Samarqand, Registon',  status: 'Faol'    },
      { id: 3, name: 'KimyoTrade MCHJ',  contactPerson: 'Bobur Toshmatov',  phone: '+998 93 345 67 89', email: '',              address: "Namangan, Bozor ko'ch", status: 'Nofaol'  },
    ],
  },

  purchases: {
    title: 'Xaridlar',
    columns: [
      { key: 'id',            label: '#',              width: '56px' },
      { key: 'name',          label: 'Kompaniya nomi' },
      { key: 'description', label: "xarid xaqida" },
      { key: 'price',         label: 'Narxi',        width: '160px' },
      { key: 'amount',         label: 'Miqdori' },
      { key: 'track',       label: 'Xolati (Qayerga yetib keldi)' },
    ],
    data: [
      { id: 1, name: 'Alfa Kimyo LLC',   description: 'Alisher Karimov',  price: '+998 90 123 45 67', amount: 'alfa@kimyo.uz',  track: 'Yetkazib beruvchi' },
      { id: 2, name: 'BioReaktiv OAJ',   description: 'Nilufar Yusupova', price: '+998 91 234 56 78', amount: 'bio@reaktiv.uz', track: 'Bojxonada'},
      { id: 3, name: 'KimyoTrade MCHJ',  description: 'Bobur Toshmatov',  price: '+998 93 345 67 89', amount: '',              track: "Omborda" },
    ],
  },
};

@Injectable({ providedIn: 'root' })
export class GridService {
  /**
   * Real backendga ulash uchun bu metoddagi mock ni o'chiring va
   * return this.http.get<GridConfig>(`/api/grids/${gridId}`) ni yozing.
   */
  getSupplierNames(): string[] {
    return REGISTRY['suppliers'].data.map(s => s['name'] as string);
  }

  getGrid(gridId: string): Observable<GridConfig> {
    const config = REGISTRY[gridId];
    if (!config) {
      return throwError(() => new Error(`Grid topilmadi: "${gridId}"`));
    }
    return of(config).pipe(delay(350));
  }
}
