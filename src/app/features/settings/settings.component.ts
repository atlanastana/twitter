import {Component, OnDestroy, OnInit} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {Router} from "@angular/router";
import {User} from "../../core/models/user.model";
import {UserService} from "../../core/services/user.service";
import {ListErrorsComponent} from "../../shared/list-errors.component";
import {Errors} from "../../core/models/errors.model";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";

interface SettingsForm {
  image: FormControl<string>;
  username: FormControl<string>;
  bio: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: "app-settings-page",
  templateUrl: "./settings.component.html",
  imports: [ListErrorsComponent, ReactiveFormsModule],
  standalone: true,
})
export class SettingsComponent implements OnInit, OnDestroy {
  user!: User;                                         //ПОЛ-ВЬ
  settingsForm = new FormGroup<SettingsForm>({//ИНИЦИАЛИЗАЦИЯ ФОРМЫ
    image: new FormControl("", {nonNullable: true}),
    username: new FormControl("", {nonNullable: true}),
    bio: new FormControl("", {nonNullable: true}),
    email: new FormControl("", {nonNullable: true}),
    password: new FormControl("", {validators: [Validators.required], nonNullable: true,}),
  });
  errors: Errors | null = null;   //ОБРАБОТКА ОШИБКИ
  isSubmitting = false;           //ЧТОБЫ НЕ БЫЛО СКЛИКИВАНИЯ
  destroy$ = new Subject<void>(); //

  constructor(
    private readonly router: Router,
    private readonly userService: UserService
  ) {
  }

  ngOnInit(): void {
    this.userService.getCurrentUser()
      .subscribe(item => {
        this.settingsForm.setValue({
          image: item.user.image,
          username: item.user.username,
          bio: item.user.bio,
          email: item.user.email,
          password: ""
        })
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {//ВСЁ ПОНЯТНО
    this.userService.logout();
  }

  submitForm() {//ВСЁ ПОНЯТНО
    this.isSubmitting = true;
    this.userService
      .update(this.settingsForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({user}) => {
          void this.router.navigate(["/profile/", user.username])
        },
        error: (err) => {
          this.errors = err;
          this.isSubmitting = false;
        },
      });
  }
}
