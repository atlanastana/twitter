import {Component, inject} from "@angular/core";
import {UserService} from "../services/user.service";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {AsyncPipe, NgIf} from "@angular/common";
import {ShowAuthedDirective} from "../../shared/show-authed.directive";

@Component({
  selector: "app-layout-header",
  templateUrl: "./header.component.html",
  imports: [RouterLinkActive, RouterLink, AsyncPipe, NgIf, ShowAuthedDirective],
  standalone: true,
})
export class HeaderComponent {
  currentUser$ = inject(UserService).currentUser; //ЧТОБ НЕ ПИСАТЬ КОНСТРУКТОР, БЕРЕМ ТОЛЬКО ТЕК-ГО ПОЛ-ВЯ

  constructor(private userService: UserService) {
  }

  logout(): void {//ВСЁ ПОНЯТНО
    this.userService.logout();
  }

}
