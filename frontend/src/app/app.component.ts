import { Component } from '@angular/core';
import { UserService } from './services/user.service';
import './models/general/prototype';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'nevermore';
  loading = true;

  constructor(private userService: UserService){    
    window.addEventListener('message', (event) => {
      this.userService.saveToken(event.data.token);
      this.loading = false;
    });  
  }
}
