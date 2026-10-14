import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Navside } from './navside';

describe('Navside', () => {
  let component: Navside;
  let fixture: ComponentFixture<Navside>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Navside]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Navside);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
