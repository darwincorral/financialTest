import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../services/product.service';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let router: Router;
  let activatedRoute: ActivatedRoute;

  beforeEach(async () => {
    const productServiceMock = jasmine.createSpyObj('ProductService', ['getProductById', 'updateProduct', 'addProduct']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        ProductFormComponent 
      ],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jasmine.createSpy('get').and.returnValue(null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form', () => {
    expect(component.productForm).toBeDefined();
    expect(component.productForm.controls['id']).toBeDefined();
    expect(component.productForm.controls['name']).toBeDefined();
    expect(component.productForm.controls['description']).toBeDefined();
    expect(component.productForm.controls['logo']).toBeDefined();
    expect(component.productForm.controls['date_release']).toBeDefined();
    expect(component.productForm.controls['date_revision']).toBeDefined();
  });

  it('should be in add mode if no productId is provided', () => {
    expect(component.isEditMode).toBeFalsy();
  });

  it('should be in edit mode if productId is provided', fakeAsync(() => {
    const productData = { id: '123', name: 'Test Product', description: 'Description', logo: 'logo.png', date_release: '2024-06-27', date_revision: '2024-06-28' };
    (activatedRoute.snapshot.paramMap.get as jasmine.Spy).and.returnValue('123');
    productService.getProductById.and.returnValue(of(productData));
    component.ngOnInit();
    tick();
    expect(component.isEditMode).toBeTruthy();
    expect(productService.getProductById).toHaveBeenCalledWith('123');
    expect(component.productForm.value.name).toBe('Test Product');
  }));

  it('should validate form fields', () => {
    component.productForm.controls['id'].setValue('');
    component.productForm.controls['name'].setValue('');
    component.productForm.controls['description'].setValue('');
    component.productForm.controls['logo'].setValue('');
    component.productForm.controls['date_release'].setValue('');
    component.productForm.controls['date_revision'].setValue('');

    expect(component.productForm.invalid).toBeTruthy();
    component.onSubmit();
    expect(component.productForm.controls['id'].invalid).toBeTruthy();
    expect(component.productForm.controls['name'].invalid).toBeTruthy();
    expect(component.productForm.controls['description'].invalid).toBeTruthy();
    expect(component.productForm.controls['logo'].invalid).toBeTruthy();
    expect(component.productForm.controls['date_release'].invalid).toBeTruthy();
    expect(component.productForm.controls['date_revision'].invalid).toBeTruthy();
  });

  it('should add product on submit in add mode', fakeAsync(() => {
    component.isEditMode = false;
    component.productForm.controls['id'].setValue('123');
    component.productForm.controls['name'].setValue('Test Product');
    component.productForm.controls['description'].setValue('Description');
    component.productForm.controls['logo'].setValue('logo.png');
    component.productForm.controls['date_release'].setValue('2024-06-27');
    component.productForm.controls['date_revision'].setValue('2024-06-28');

    const expectedProduct = {
      id: '123',
      name: 'Test Product',
      description: 'Description',
      logo: 'logo.png',
      date_release: '2024-06-27',
      date_revision: '2024-06-28'
    };

    productService.addProduct.and.returnValue(of({}));
    const routerSpy = spyOn(router, 'navigate');
    component.onSubmit();
    tick();
    expect(productService.addProduct).toHaveBeenCalledWith(expectedProduct);
    expect(routerSpy).toHaveBeenCalledWith(['/products']);
  }));

  it('should update product on submit in edit mode', fakeAsync(() => {
    component.isEditMode = true;
    component.productId = '123';
    component.productForm.controls['id'].setValue('123');
    component.productForm.controls['name'].setValue('Test Product');
    component.productForm.controls['description'].setValue('Description');
    component.productForm.controls['logo'].setValue('logo.png');
    component.productForm.controls['date_release'].setValue('2024-06-27');
    component.productForm.controls['date_revision'].setValue('2024-06-28');

    const expectedProduct = {
      id: '123',
      name: 'Test Product',
      description: 'Description',
      logo: 'logo.png',
      date_release: '2024-06-27',
      date_revision: '2024-06-28'
    };

    productService.updateProduct.and.returnValue(of({}));
    const routerSpy = spyOn(router, 'navigate');
    component.onSubmit();
    tick();
    expect(productService.updateProduct).toHaveBeenCalledWith('123', expectedProduct);
    expect(routerSpy).toHaveBeenCalledWith(['/products']);
  }));

  it('should reset form on reset', fakeAsync(() => {
    component.isEditMode = true;
    component.productId = '123';
    const productData = { id: '123', name: 'Test Product', description: 'Description', logo: 'logo.png', date_release: '2024-06-27', date_revision: '2024-06-28' };
    productService.getProductById.and.returnValue(of(productData));

    component.onReset();
    tick();
    expect(productService.getProductById).toHaveBeenCalledWith('123');
    expect(component.productForm.value.name).toBe('Test Product');
  }));
});
