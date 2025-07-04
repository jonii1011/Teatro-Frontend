import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FidelizacionComponent } from '../fidelizacion/fidelizacion';

describe('Fidelizacion', () => {
  let component: FidelizacionComponent;
  let fixture: ComponentFixture<FidelizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FidelizacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FidelizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
