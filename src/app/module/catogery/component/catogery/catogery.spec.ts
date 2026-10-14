import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Catogery } from './catogery';

describe('Catogery', () => {
  let component: Catogery;
  let fixture: ComponentFixture<Catogery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Catogery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Catogery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
