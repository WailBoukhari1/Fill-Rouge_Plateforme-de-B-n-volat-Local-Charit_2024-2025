import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Organization, OrganizationProfile } from '../../../core/models/organization.model';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ImagePlaceholderService } from '../../services/image-placeholder.service';

@Component({
  selector: 'app-organization-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule, 
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './organization-details-dialog.component.html'
})
export class OrganizationDetailsDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public organization: any, // Use 'any' to accept both Organization and OrganizationProfile
    private dialogRef: MatDialogRef<OrganizationDetailsDialogComponent>,
    private imagePlaceholderService: ImagePlaceholderService
  ) {}

  ngOnInit(): void {
    // Log the organization object to see its structure
    console.log('Organization data in dialog:', this.organization);
  }

  getLogoUrl(): string {
    if (this.organization?.logoUrl) {
      return this.organization.logoUrl;
    }
    if (this.organization?.logo) {
      return this.organization.logo;
    }
    return this.imagePlaceholderService.getOrganizationPlaceholder();
  }

  close(): void {
    this.dialogRef.close();
  }
} 