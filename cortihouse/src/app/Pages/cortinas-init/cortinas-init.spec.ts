import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CortinasInit } from './cortinas-init';

describe('CortinasInit', () => {
  let component: CortinasInit;
  let fixture: ComponentFixture<CortinasInit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CortinasInit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CortinasInit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
