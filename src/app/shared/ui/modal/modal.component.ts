import { Component, inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ButtonComponent } from "../button/button.component";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { environment } from "../../../../environments/env";

@Component({
  selector: "app-modal",
  imports: [ButtonComponent],
  templateUrl: "./modal.component.html",
  styleUrl: "./modal.component.css",
  animations: [
    trigger("fadeInOut", [
      state(
        "inactive",
        style({
          opacity: 0,
          transform: "translateY(-100%)",
        }),
      ),
      state(
        "active",
        style({
          opacity: 1,
          transform: "translateY(0)",
        }),
      ),
      transition("inactive => active", [animate("2000ms ease-in-out")]),
      transition("active => inactive", [animate("2000ms ease-in-out")]),
    ]),
  ],
})
export class ModalComponent {
  ENV = environment;
  private _dialogRef = inject(MatDialogRef<ModalComponent>);

  public data: ModalData = inject(MAT_DIALOG_DATA);

  animationState: "active" | "inactive" = "inactive";
  modalType = ModalTypeEnum;

  close(): void {
    this.animationState = "inactive";
    this._dialogRef.close();
  }

  activate() {
    this.animationState = "active";
  }
}

export enum ModalTypeEnum {
  CONFIRMATION = 2,
  COOKIES = 3,
}

export interface ModalData {
  title: string;
  message: string;
  type: ModalTypeEnum;
}
