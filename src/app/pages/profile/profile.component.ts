import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  avatarPreview: string | null = null;
  uploadingAvatar = false;
  savingProfile = false;
  savingPassword = false;

  private readonly base = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private http: HttpClient,
    public auth: AuthService,
  ) {
    this.profileForm = this.fb.group({
      fullname: ['', Validators.required],
    });
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.profileForm.patchValue({ fullname: this.auth.currentUser?.fullname ?? '' });
    if (this.auth.currentUser?.avatarPath) {
      this.avatarPreview = this.avatarUrl(this.auth.currentUser.avatarPath);
    }
  }

  get initials(): string {
    const name = this.auth.currentUser?.fullname ?? this.auth.currentUser?.login ?? '?';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }

  avatarUrl(path: string): string {
    const fileName = path.split('/').pop() ?? '';
    return `${this.base}/user/avatar/${fileName}`;
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    const reader = new FileReader();
    reader.onload = e => { this.avatarPreview = e.target?.result as string; };
    reader.readAsDataURL(file);

    this.uploadingAvatar = true;
    const formData = new FormData();
    formData.append('file', file);
    this.http.post<{ success: boolean; message: string; object: string }>(`${this.base}/user/upload-avatar`, formData).subscribe({
      next: res => {
        this.uploadingAvatar = false;
        if (res.success) {
          this.auth.updateCurrentUser({ avatarPath: res.object });
          this.toast.success('Avatar saqlandi');
        } else {
          this.toast.error(res.message ?? 'Xato');
        }
      },
      error: () => { this.uploadingAvatar = false; this.toast.error('Avatar yuklashda xato'); },
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.savingProfile = true;
    const { fullname } = this.profileForm.value;
    this.http.put<{ success: boolean; message: string }>(`${this.base}/user/update-profile`, { fullname }).subscribe({
      next: res => {
        this.savingProfile = false;
        if (res.success) {
          this.auth.updateCurrentUser({ fullname });
          this.toast.success('Profil yangilandi');
        } else {
          this.toast.error(res.message ?? 'Xato');
        }
      },
      error: () => { this.savingProfile = false; this.toast.error('Xato yuz berdi'); },
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    const { oldPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.toast.warning('Yangi parollar mos kelmaydi');
      return;
    }
    this.savingPassword = true;
    this.http.put<{ success: boolean; message: string }>(`${this.base}/user/update-profile`, { oldPassword, newPassword }).subscribe({
      next: res => {
        this.savingPassword = false;
        if (res.success) {
          this.passwordForm.reset();
          this.toast.success('Parol yangilandi');
        } else {
          this.toast.error(res.message ?? 'Xato');
        }
      },
      error: () => { this.savingPassword = false; this.toast.error('Xato yuz berdi'); },
    });
  }
}

