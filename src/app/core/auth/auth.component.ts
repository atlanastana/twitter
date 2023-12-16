import {Component, OnDestroy, OnInit} from "@angular/core";
import {
  Validators,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
} from "@angular/forms";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {NgIf} from "@angular/common";
import {ListErrorsComponent} from "../../shared/list-errors.component";
import {Errors} from "../models/errors.model";
import {UserService} from "../services/user.service";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

interface AuthForm {
  email: FormControl<string>;
  password: FormControl<string>;
  username?: FormControl<string>;
}

@Component({
  selector: "app-auth-page",
  templateUrl: "./auth.component.html",
  imports: [RouterLink, NgIf, ListErrorsComponent, ReactiveFormsModule],
  standalone: true,
})
export class AuthComponent implements OnInit, OnDestroy {
  authType = "";                 //LOGIN либо REGISTER
  title = "";                    //Sign либо Sign up
  errors: Errors = {errors: {}}; //ДЛЯ ОТОБРАЖЕНИЯ ОШИБКИ
  isSubmitting = false;          //ЧТОБЫ МНОГО РАЗ НА КНОПКУ "ОТПРАВИТЬ" НЕ НАЖАЛИ
  authForm: FormGroup<AuthForm>; //ФОРМА
  destroy$ = new Subject<void>();//

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userService: UserService
  ) {
    // ИНИЦИАЛИЗАЦИЯ ФОРМЫ
    this.authForm = new FormGroup<AuthForm>({
      email: new FormControl("", {validators: [Validators.required], nonNullable: true,}),
      password: new FormControl("", {validators: [Validators.required], nonNullable: true,}),
    });
  }

  ngOnInit(): void { //СЛЕДИМ ЗА УРЛОМ
    this.authType = this.route.snapshot.url.at(-1)!.path;//БЕРЕМ С УРЛА ЛОГИН ИЛИ РЕГИСТР
    this.title = this.authType === "login" ? "Sign in" : "Sign up";
    if (this.authType === "register") {
      this.authForm.addControl("username",
        new FormControl("", {validators: [Validators.required], nonNullable: true,}));
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.errors = {errors: {}};

    let observable = this.authType === "login"
      ? this.userService.login(this.authForm.value as { email: string; password: string })
      : this.userService.register(this.authForm.value as { email: string; password: string; username: string; });

    observable.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.router.navigate(["/"]),
      error: (err) => {
        this.errors = err;
        this.isSubmitting = false;
      },
    });
  }
}
