import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface FileViewerData {
  url: string;
  fileName: string;
}

@Component({
  selector: 'app-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss']
})
export class FileViewerComponent implements OnInit, OnDestroy {
  objectUrl: string | null = null;
  loading = true;
  error = false;

  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<FileViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FileViewerData,
  ) {}

  ngOnInit(): void {
    this.http.get(this.data.url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.objectUrl = URL.createObjectURL(blob);
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
  }

  get isPdf(): boolean {
    return this.data.fileName.toLowerCase().endsWith('.pdf');
  }

  get isImage(): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(this.data.fileName);
  }

  download(): void {
    if (!this.objectUrl) return;
    const a = document.createElement('a');
    a.href = this.objectUrl;
    a.download = this.data.fileName;
    a.click();
  }

  close(): void {
    this.dialogRef.close();
  }
}
