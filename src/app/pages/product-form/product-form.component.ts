import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode: boolean = false;
  productId!: string;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      id: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)], [this.uniqueIdValidator(this.productService)]],
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: ['', Validators.required],
      date_release: ['', Validators.required],
      date_revision: ['', Validators.required]
    },{ validators: this.releaseAndRevisionDateValidator() });
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') ?? ''; 
    if (this.productId) {
      this.isEditMode = true;
      this.productService.getProductById(this.productId).subscribe(data => {
        this.productForm.patchValue(data);
        this.productForm.controls['id'].disable();
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const formValue = this.productForm.getRawValue();
      if (this.isEditMode) {
        this.productService.updateProduct(this.productId, formValue).subscribe({
          next: () => {
            alert('Producto actualizado correctamente');
            this.router.navigate(['/products']);
          },
          error: (err) => {
            this.handleError(err, 'Error al actualizar el producto. Inténtalo nuevamente.');
          }
        });
      } else {
        this.productService.addProduct(formValue).subscribe({
          next: () => {
            alert('Producto agregado correctamente');
            this.router.navigate(['/products']);
          },
          error: (err) => {
            this.handleError(err, 'Error al agregar el producto. Inténtalo nuevamente.');
          }
        });
      }
    } else {
      this.validateAllFormFields(this.productForm);
    }
  }

  private handleError(error: any, userMessage: string): void {
    console.error('Ocurrió un error:', error); 
    alert(userMessage);
  }

  onReset(): void {
    this.productForm.reset();
    if (this.isEditMode) {
      this.productService.getProductById(this.productId).subscribe(data => {
        this.productForm.patchValue(data);
      });
    }
  }

  validateAllFormFields(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control) {
        control.markAsTouched({ onlySelf: true });
      }
    });
  }

  releaseAndRevisionDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const dateRelease = control.get('date_release')?.value;
      const dateRevision = control.get('date_revision')?.value;
  
      if (!dateRelease || !dateRevision) {
        return null;
      }
  
      const releaseDate = new Date(dateRelease);
      const revisionDate = new Date(dateRevision);
  
      // Sumar un año a la fecha de liberación
      const expectedRevisionDate = new Date(releaseDate);
      expectedRevisionDate.setFullYear(releaseDate.getFullYear() + 1);
  
      if (revisionDate.getTime() !== expectedRevisionDate.getTime()) {
        return { revisionDateInvalid: true };
      }
  
      return null;
    };
  }

  uniqueIdValidator(productService: ProductService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const id = control.value;
      if (!id) {
        return of(null);
      }
  
      return productService.verifyProductId(id).pipe(
        map(exists => (exists ? { idExists: true } : null)),
        catchError(() => of(null))
      );
    };
  }
}
