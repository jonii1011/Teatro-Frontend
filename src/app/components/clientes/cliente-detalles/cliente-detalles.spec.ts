import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteDetalles } from './cliente-detalles';

describe('ClienteDetalles', () => {
  let component: ClienteDetalles;
  let fixture: ComponentFixture<ClienteDetalles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteDetalles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClienteDetalles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
