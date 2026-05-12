import { Component, inject } from "@angular/core";

import { Router } from "@angular/router";
import { MonthlyRewardModalService } from "../../services/monthly-reward-modal.service";
import { environment } from "../../../../environments/env";
import { InlineModalComponent } from "../inline-modal/inline-modal.component";
import { ButtonComponent } from "../button/button.component";

@Component({
  selector: "app-monthly-reward-modal",
  imports: [InlineModalComponent, ButtonComponent],
  templateUrl: "./monthly-reward-modal.component.html",
})
export class MonthlyRewardModalComponent {
  modalService = inject(MonthlyRewardModalService);
  private router = inject(Router);
  ENV = environment;

  closeModal(): void {
    this.modalService.close();
  }

  onBackdropClick(event: MouseEvent): void {
    // Cerrar al hacer clic en el backdrop
    this.closeModal();
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }

  navigateToWebshop(): void {
    this.closeModal();
    this.router.navigate(["/loyalty-webshop"]);
  }

  navigateToCredits(): void {
    this.closeModal();
    this.router.navigate(["/cuenta/credito"]);
  }
}
