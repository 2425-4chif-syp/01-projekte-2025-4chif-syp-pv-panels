import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AlertLogComponent } from './alert-log.component';

describe('AlertLogComponent', () => {
  let component: AlertLogComponent;
  let fixture: ComponentFixture<AlertLogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
