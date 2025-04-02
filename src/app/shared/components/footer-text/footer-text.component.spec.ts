import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FooterTextComponent } from './footer-text.component';

describe('FooterTextComponent', () => {
  let component: FooterTextComponent;
  let fixture: ComponentFixture<FooterTextComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FooterTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
