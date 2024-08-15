import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDetailComponent } from './product-detail.component';
import { ProductService } from '../../services/product.service';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let router: Router;
  let activatedRoute: ActivatedRoute;

  beforeEach(async () => {
    const productServiceMock = jasmine.createSpyObj('ProductService', ['getProductById', 'deleteProduct']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ProductDetailComponent
      ],
      providers: [
        { provide: ProductService, useValue: productServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jasmine.createSpy('get').and.returnValue('123')
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);

    productService.getProductById.and.returnValue(of({ id: '123', name: 'Test Product' }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch product on init', fakeAsync(() => {
    const productData = { id: '123', name: 'Test Product' };
    productService.getProductById.and.returnValue(of(productData));

    component.ngOnInit();
    tick();

    expect(productService.getProductById).toHaveBeenCalledWith('123');
    expect(component.product).toEqual(productData);
  }));

  it('should navigate to edit page on edit', () => {
    const routerSpy = spyOn(router, 'navigate');
    component.product = { id: '123' };
    component.onEdit();

    expect(routerSpy).toHaveBeenCalledWith(['/edit', '123']);
  });

  it('should delete product and navigate to product list on delete', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);
    const routerSpy = spyOn(router, 'navigate');
    productService.deleteProduct.and.returnValue(of({}));

    component.product = { id: '123' };
    component.onDelete();
    tick();

    expect(productService.deleteProduct).toHaveBeenCalledWith('123');
    expect(routerSpy).toHaveBeenCalledWith(['/products']);
  }));

  it('should not delete product if confirm is false', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.product = { id: '123' };
    component.onDelete();

    expect(productService.deleteProduct).not.toHaveBeenCalled();
  });
});
