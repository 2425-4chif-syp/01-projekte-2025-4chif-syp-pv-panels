import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { School3dComponent } from './school3d/school3d.component';
import { ModelmenuComponent } from './school3d/modelmenu/modelmenu.component';
import { VideoFeedComponent } from './video-feed/video-feed.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({ declarations: [
        School3dComponent,
        ModelmenuComponent,
        VideoFeedComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [
        School3dComponent,
        ModelmenuComponent,
        VideoFeedComponent
    ], imports: [CommonModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class ThreeDModule { }