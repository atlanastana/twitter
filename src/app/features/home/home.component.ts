import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TagsService } from "../../core/services/tags.service";
import { ArticleListConfig } from "../../core/models/article-list-config.model";
import { AsyncPipe, NgClass, NgForOf } from "@angular/common";
import { ArticleListComponent } from "../../shared/article-helpers/article-list.component";
import { takeUntil, tap } from "rxjs/operators";
import { Subject } from "rxjs";
import { UserService } from "../../core/services/user.service";
import { LetDirective } from "@rx-angular/template/let";
import { ShowAuthedDirective } from "../../shared/show-authed.directive";

@Component({
  selector: "app-home-page",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
  imports: [
    NgClass,
    ArticleListComponent,
    AsyncPipe,
    LetDirective,
    NgForOf,
    ShowAuthedDirective,
  ],
  standalone: true,
})
export class HomeComponent implements OnInit, OnDestroy {
  tags$ = inject(TagsService).getAll().pipe(tap(() => (this.tagsLoaded = true)));//ЗАГРУЖАЕМ ТЭГИ
  tagsLoaded = false; //ФЛАЖОК ЗАГРУЗКИ ТЭГОВ
  destroy$ = new Subject<void>();
  isAuthenticated = false; //АВТОРИЗОВАН ИЛИ НЕТ
  listConfig: ArticleListConfig = {
    type: "all",
    filters: {},
  };

  constructor(
    private readonly router: Router,
    private readonly userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.isAuthenticated
      .pipe(
        tap((isAuthenticated) => {
          if (isAuthenticated) {
            this.setListTo("feed");
          } else {
            this.setListTo("all");
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(
        (isAuthenticated: boolean) => (this.isAuthenticated = isAuthenticated)
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setListTo(type: string = "", filters: Object = {}): void {
    // ЕСЛИ ПОЛ-ВЬ НЕ ЗАРЕГАН ПЕРЕКИДЫВАЕТ НА ЛОГИН
    if (type === "feed" && !this.isAuthenticated) {
      void this.router.navigate(["/login"]);
      return;
    }
    // Otherwise, set the list object
    this.listConfig = { type: type, filters: filters };
  }
}
