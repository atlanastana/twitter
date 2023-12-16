import {
  Directive,
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  ViewRef,
} from "@angular/core";
import {UserService} from "../core/services/user.service";

@Directive({
  selector: "[appShowAuthed]",
  standalone: true,
})
export class ShowAuthedDirective implements OnInit {
  @Input() set appShowAuthed(condition: boolean) { //СЭТТЕР
    this.condition = condition;
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private userService: UserService,
    private viewContainer: ViewContainerRef//ViewContainerRef-ссылка на контейнер родитель
  ) {
  }

  condition: boolean = false; //ФЛАЖОК - АВТОРИЗОВАН ИЛИ НЕТ

  authRef: ViewRef | undefined;//НУЖНО ЧТОБЫ ОТОБРАЗИТЬ ТЭГИ

  ngOnInit() {
    this.userService.isAuthenticated.subscribe((isAuthenticated: boolean) => {
      if ((isAuthenticated && this.condition) || (!isAuthenticated && !this.condition)) {
        if (!this.authRef) {
          this.authRef = this.viewContainer.createEmbeddedView(this.templateRef);
        }
      } else {
        this.viewContainer.clear();
      }
    });
  }

}
