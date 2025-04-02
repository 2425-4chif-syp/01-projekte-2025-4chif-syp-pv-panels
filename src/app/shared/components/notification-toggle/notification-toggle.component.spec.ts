import { MaterialModule } from '../../modules/material.module';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NotificationToggleComponent } from './notification-toggle.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('NotificationToggleComponent', () => {
  let component: NotificationToggleComponent;
  let fixture: ComponentFixture<NotificationToggleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationToggleComponent ],
      imports: [ BrowserAnimationsModule, MaterialModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
