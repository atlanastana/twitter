import {Component, Input, OnDestroy} from "@angular/core";
import {ArticlesService} from "../../core/services/articles.service";
import {ArticleListConfig} from "../../core/models/article-list-config.model";
import {Article} from "../../core/models/article.model";
import {ArticlePreviewComponent} from "./article-preview.component";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {LoadingState} from "../../core/models/loading-state.model";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: "app-article-list",
  styleUrls: ["article-list.component.css"],
  templateUrl: "./article-list.component.html",
  imports: [ArticlePreviewComponent, NgForOf, NgClass, NgIf],
  standalone: true,
})
export class ArticleListComponent implements OnDestroy {
  query!: ArticleListConfig; //ОБЪЕКТ {type: 'all', filters: {}}
  results: Article[] = []; //МАССИВ СТАТЕЙ
  currentPage = 1; //ТЕКУЩАЯ СТРАНИЦА
  totalPages: Array<number> = [];//ОБЩЕЕ КОЛ-ВО СТРАНИЦ
  loading = LoadingState.NOT_LOADED; //СТАТУС ЗАГРУЗКИ
  LoadingState = LoadingState;
  destroy$ = new Subject<void>();

  @Input() limit!: number;  //КОЛ-ВО СТАТЕЙ НА ОДНУ СТРАНИЦУ
  @Input()
  set config(config: ArticleListConfig) {
    if (config) {
      this.query = config;  //СОХРАНЯЕМ ПОЛУЧЕННЫЙ ОБЪЕКТ
      this.currentPage = 1; //ТЕКУЩЯЯ СТРАНИЦА
      this.runQuery();      //
    }
  }

  constructor(private articlesService: ArticlesService) {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setPageTo(pageNumber: number) {//СМЕНА ТЕКУЩЕЙ СТРАНИЦЫ
    this.currentPage = pageNumber;
    this.runQuery();
  }

  runQuery() {
    this.loading = LoadingState.LOADING; //ИДЁТ ЗАГРУЗКА
    this.results = [];                   //МАССИВ СТАТЕЙ

    // ДОБАВЛЯЕМ СВОЙСТВА В ОБЪЕКТ query
    if (this.limit) {
      this.query.filters.limit = this.limit;                           //ЛИМИТ СТАТЕЙ НА ОДНУ СТРАНИЦУ
      this.query.filters.offset = this.limit * (this.currentPage - 1); //С КАКОГО ЭЛЕМЕНТА НАЧИНАЕМ ОТЧЕТ 10 СТАТЕЙ
    }
    this.articlesService
      .query(this.query)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.loading = LoadingState.LOADED; //ЗАГРУЗКА ЗАВЕРШЕНА
        this.results = data.articles;       //МАССИВ СТАТЕЙ С СЕРВЕРА

        // ФОРМУЛА ОБЩЕГО КОЛ-ВА СТРАНИЦ
        this.totalPages = Array.from(
          new Array(Math.ceil(data.articlesCount / this.limit)),
          (val, index) => index + 1
        );
      });
  }
}
