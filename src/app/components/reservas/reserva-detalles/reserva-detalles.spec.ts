import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaDetalles } from './reserva-detalles';

describe('ReservaDetalles', () => {
  let component: ReservaDetalles;
  let fixture: ComponentFixture<ReservaDetalles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaDetalles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservaDetalles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
