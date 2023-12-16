import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class JwtService {
  getToken(): string { //ВОЗВРАЩАЕМ ТОКЕН
    return window.localStorage["jwtToken"];
  }

  saveToken(token: string): void { //СОХРАНЯЕМ ТОКЕН
    window.localStorage["jwtToken"] = token;
  }

  destroyToken(): void {//УДАЛЯЕМ ТОКЕН
    window.localStorage.removeItem("jwtToken");
  }
}
