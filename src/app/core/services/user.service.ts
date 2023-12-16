import {Injectable} from "@angular/core";
import {Observable, BehaviorSubject} from "rxjs";
import {JwtService} from "./jwt.service";
import {map, distinctUntilChanged, tap, shareReplay} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {User} from "../models/user.model";
import {Router} from "@angular/router";

@Injectable({providedIn: "root"})
export class UserService {

  private currentUserSubject = new BehaviorSubject<User | null>(null); //ТЕКУЩИЙ ПОЛ-ВЬ
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  public isAuthenticated = this.currentUser.pipe(map((user) => !!user));//АВТОРИЗОВАН ИЛИ НЕТ

  constructor(
    private readonly http: HttpClient,
    private readonly jwtService: JwtService,
    private readonly router: Router
  ) {
  }

  //ВСЁ ПОНЯТНО
  login(credentials: { email: string, password: string }): Observable<{ user: User }> {
    return this.http
      .post<{ user: User }>("/users/login", {user: credentials})
      .pipe(tap(({user}) => this.setAuth(user)));
  }

  //ВСЁ ПОНЯТНО
  register(credentials: { username: string; email: string; password: string; }): Observable<{ user: User }> {
    return this.http
      .post<{ user: User }>("/users", {user: credentials})
      .pipe(tap(({user}) => this.setAuth(user)));
  }

  //ВСЁ ПОНЯТНО
  logout(): void {
    this.purgeAuth();
    void this.router.navigate(["/"]);
  }

  //ПОЛУЧАЕМ ДАННЫЕ ТЕКУЩЕГО ПОЛ-ВЯ
  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>("/user").pipe(
      tap({
        next: ({user}) => this.setAuth(user),
        error: () => this.purgeAuth(),
      }),
      shareReplay(1)//ПОВТОРНЫЙ ЗАПРОС ПРИ ОШИБКЕ
    );
  }

  update(user: Partial<User>): Observable<{ user: User }> {//ОБНОВЛЯЕМ ДАННЫЕ ПОЛ-ВЯ
    return this.http.put<{ user: User }>("/user", {user})
      .pipe(tap(({user}) => this.currentUserSubject.next(user)));
  }

  setAuth(user: User): void { //СОХРАНЯЕМ ТОКЕН И ТЕКУЩЕГО ПОЛ-ВЯ
    this.jwtService.saveToken(user.token);
    this.currentUserSubject.next(user);
  }

  purgeAuth(): void { //УДАЛЯЕМ ТОКЕН И ТЕКУШЕГО ПОЛ-ВЯ
    this.jwtService.destroyToken();
    this.currentUserSubject.next(null);
  }

}
