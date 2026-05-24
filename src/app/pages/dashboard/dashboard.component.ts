import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  stats = [
    { type: 'chemicals', label: "Kimyoviy moddalar", value: '248', trend: '+12%', color: '#1D9E75', bg: 'rgba(29,158,117,0.1)' },
    { type: 'orders',    label: 'Buyurtmalar',        value: '56',  trend: '+8%',  color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    { type: 'customers', label: 'Mijozlar',           value: '134', trend: '+5%',  color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    { type: 'stock',     label: "Ombor qoldig'i",     value: '1.2T',trend: '-3%',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  ];

  orders = [
    { id: '#BLK-001', mijoz: 'Karimov Sardor',     mahsulot: 'Sulfat kislota',  miqdor: '50 kg',  status: 'Bajarildi', date: '07.05.2026' },
    { id: '#BLK-002', mijoz: 'Toshmatova Nilufar', mahsulot: 'Natriy xlorid',   miqdor: '200 kg', status: 'Jarayonda', date: '06.05.2026' },
    { id: '#BLK-003', mijoz: 'Raximov Bobur',      mahsulot: 'Xlorid kislota',  miqdor: '30 L',   status: 'Kutmoqda',  date: '05.05.2026' },
    { id: '#BLK-004', mijoz: 'Yusupova Malika',    mahsulot: 'Glitserin',       miqdor: '15 kg',  status: 'Bajarildi', date: '04.05.2026' },
  ];
}
