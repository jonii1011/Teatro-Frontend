import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventoDetalles } from './evento-detalles';

describe('EventoDetalles', () => {
  let component: EventoDetalles;
  let fixture: ComponentFixture<EventoDetalles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventoDetalles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventoDetalles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
