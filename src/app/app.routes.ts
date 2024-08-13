import { Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { provideHttpClient } from '@angular/common/http';

export const routes: Routes = [
    {path: '', component:GameComponent}
];
