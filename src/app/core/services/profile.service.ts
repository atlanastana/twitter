import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";
import { Profile } from "../models/profile.model";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class ProfileService {
  constructor(private readonly http: HttpClient) {}

  get(username: string): Observable<Profile> {//ПОЛУЧАЕМ ДАННЫЕ ПРОФИЛЯ
    return this.http.get<{ profile: Profile }>("/profiles/" + username).pipe(
      map((data: { profile: Profile }) => data.profile),
      shareReplay(1)//ПОВТОРНЫЙ ЗАПРОС ПРИ ОШИБКЕ
    );
  }

  follow(username: string): Observable<Profile> {//ПОДПИСКА НА ПОЛ-ВЯ
    return this.http
      .post<{ profile: Profile }>("/profiles/" + username + "/follow", {})
      .pipe(map((data: { profile: Profile }) => data.profile));
  }

  unfollow(username: string): Observable<Profile> {//ОТПИСКА ОТ ПОЛ-ВЯ
    return this.http
      .delete<{ profile: Profile }>("/profiles/" + username + "/follow")
      .pipe(map((data: { profile: Profile }) => data.profile));
  }
}
