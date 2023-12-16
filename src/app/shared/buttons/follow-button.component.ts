import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from "@angular/core";
import {Router} from "@angular/router";
import {switchMap, takeUntil} from "rxjs/operators";
import {EMPTY, Subject} from "rxjs";
import {ProfileService} from "../../core/services/profile.service";
import {UserService} from "../../core/services/user.service";
import {Profile} from "../../core/models/profile.model";
import {NgClass} from "@angular/common";

@Component({
  selector: "app-follow-button",
  templateUrl: "./follow-button.component.html",
  imports: [NgClass],
  standalone: true,
})
export class FollowButtonComponent implements OnDestroy { //КНОПКА ПОДПИСКИ
  @Input() profile!: Profile;//ПРИНИМАЕМ ПРОФИЛЬ ОТ РОДИТЕЛЯ
  @Output() toggle = new EventEmitter<Profile>(); //ОТПРАВЛЯЕМ ДЕЙСТВИЕ НАВЕРХ
  isSubmitting = false; //ЧТОБЫ НЕ БЫЛО СКЛИКИВАНИЯ
  destroy$ = new Subject<void>();

  constructor(
    private readonly profileService: ProfileService,
    private readonly router: Router,
    private readonly userService: UserService
  ) {
  }

  toggleFollowing(): void {
    this.isSubmitting = true;

    this.userService.isAuthenticated
      .pipe(
        switchMap((isAuthenticated: boolean) => {
          if (!isAuthenticated) { //ЕСЛИ ПОЛ-ВЬ НЕ ЗАРЕГИСТРИРОВАН
            void this.router.navigate(["/login"]);
            return EMPTY; //ПОХОДУ ЧТОБЫ subscribe ОСТАНОВИТЬ
          }
          //ЕСЛИ ЗАРЕГАНЫ ИДЁМ ДАЛЬШЕ
          if (!this.profile.following) {
            return this.profileService.follow(this.profile.username);
          } else {
            return this.profileService.unfollow(this.profile.username);
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (profile) => {
          this.isSubmitting = false;
          this.toggle.emit(profile);
        },
        error: () => (this.isSubmitting = false),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
