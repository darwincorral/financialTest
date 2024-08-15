import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../services/product.service';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let router: Router;

  beforeEach(async () => {
    const productServiceMock = jasmine.createSpyObj('ProductService', ['getProducts', 'deleteProduct']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ProductListComponent
      ],
      providers: [
        { provide: ProductService, useValue: productServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    router = TestBed.inject(Router);

    productService.getProducts.and.returnValue(of({ data: [{ id: '123', name: 'Test Product' }] }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(productService.getProducts).toHaveBeenCalled();
    expect(component.products.length).toBe(1);
    expect(component.products[0].name).toBe('Test Product');
  }));

  it('should filter products based on search term', () => {
    component.products = [
      { id: '123', name: 'Test Product' },
      { id: '124', name: 'Another Product' }
    ];
    component.searchTerm = 'another';
    component.filterProducts();

    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].name).toBe('Another Product');
  });

  it('should show modal on delete', () => {
    const product = { id: '123', name: 'Test Product' };
    component.onDelete(product);

    expect(component.showModal).toBeTrue();
    expect(component.item).toEqual(product);
  });

  it('should confirm delete product and reload', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    productService.deleteProduct.and.returnValue(of({}));

    const product = { id: '123', name: 'Test Product' };
    component.item = product;
    component.confirmDelete();
    tick();

    expect(productService.deleteProduct).toHaveBeenCalledWith('123');
    expect(productService.getProducts).toHaveBeenCalled();
    expect(component.showModal).toBeFalse();
  }));

  it('should navigate to edit page on edit', () => {
    const routerSpy = spyOn(router, 'navigate');
    const product = { id: '123', name: 'Test Product' };
    component.onEdit(product);

    expect(routerSpy).toHaveBeenCalledWith(['/edit', '123']);
  });

  it('should navigate to add page on add', () => {
    const routerSpy = spyOn(router, 'navigate');
    component.onAdd();

    expect(routerSpy).toHaveBeenCalledWith(['/add']);
  });

  it('should close modal on cancel delete', () => {
    component.showModal = true;
    component.item = { id: '123', name: 'Test Product' };
    component.cancelDelete();

    expect(component.showModal).toBeFalse();
    expect(component.item).toBeNull();
  });
});
