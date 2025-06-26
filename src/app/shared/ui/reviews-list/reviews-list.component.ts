import { Component, Input, OnInit, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../services/review.service';
import { SinceDatePipe } from '../../pipes/since-date.pipe';
import { ToastService } from '../../services/toast.service';
import { Review } from '../../interfaces/review.interfaces';
import { ReviewSkeletonComponent } from '../review-skeleton/review-skeleton.component';

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  starDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  percentages: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

@Component({
    selector: 'app-reviews-list',
    standalone: true,
    imports: [CommonModule, SinceDatePipe, ReviewSkeletonComponent],
    template: `
    <div class="divide-y divide-gray-200 max-h-[34.5rem] overflow-y-scroll bg-white rounded-lg">

        @if (onLoadReviews()) {
    @for (review of allReviews; track review.id) {
        <div  class="py-6 px-4">
            <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-14 rounded-full object-cover"
                height="56px" viewBox="0 -960 960 960" width="56px" fill="#434343">
                <path d="M480-481q-66 0-108-42t-42-108q0-66 42-108t108-42q66 0 108 42t42 108q0 66-42 108t-108 42ZM160-160v-94q0-38 19-65t49-41q67-30 128.5-45T480-420q62 0 123 15.5t127.92 44.69q31.3 14.13 50.19 40.97Q800-292 800-254v94H160Zm60-60h520v-34q0-16-9.5-30.5T707-306q-64-31-117-42.5T480-360q-57 0-111 11.5T252-306q-14 7-23 21.5t-9 30.5v34Zm260-321q39 0 64.5-25.5T570-631q0-39-25.5-64.5T480-721q-39 0-64.5 25.5T390-631q0 39 25.5 64.5T480-541Zm0-90Zm0 411Z" />
            </svg>
            <div class="ml-4">
                <h4 class="text-sm font-semibold text-gray-900">
                {{ review.user?.first_name }} {{ review.user?.last_name}}
                <span class="text-gray-600 font-light text-xs">
                    ({{ review.created_at | sinceDate }})
                </span>
                </h4>
                <div class="mt-1 flex items-center">
                <div *ngFor="let star of getStarsArray(review.stars)" class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                        class="flex-shrink-0 h-5 w-5"
                        [class.text-yellow-400]="star.filled"
                        [class.text-gray-300]="!star.filled">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </div>
                </div>
            </div>
            </div>

            <div *ngIf="review.review" class="mt-4 space-y-6 text-base italic">
            <p class="mt-4 text-gray-700 text italic">
                {{ review.review }}
            </p>
            </div>
            </div>
    }}
    @else {
        <app-review-skeleton></app-review-skeleton>
    }
    </div>
    
  `
})
export class ReviewsListComponent implements OnInit {
    @Input() productId!: string;
    
    // Outputs para enviar estadísticas al componente padre
    reviewsLoaded = output<boolean>();
    reviewStats = output<ReviewStats>();
    
    onLoadReviews = signal<boolean>(false);

    private _reviewService = inject(ReviewService);
    private _toastService = inject(ToastService);

    allReviews: Review[] = [];
    isLoading = false;

    // Reviews estáticas
    private staticReviews: Review[] = [
        {
            id: 'static-1',
            user_id: 'user-1',
            product_id: this.productId,
            user: {
                id: 'user-1',
                first_name: 'Hugo',
                last_name: 'Cortez L.',
                email: 'hugo.cortez@example.com'
            },
            stars: 5,
            review: 'La creatina es un golazo, no cae pesada como otras. Me gusta mucho que me pueda suscribir una vez y olvidarme de comprarla cada tanto.',
            created_at: new Date('2025-01-08').toISOString(),
            updated_at: new Date('2025-01-08').toISOString(),
            isAproved: true,
            is_delete: false,
            is_static: true
        },
        {
            id: 'static-3',
            user_id: 'user-3',
            product_id: this.productId,
            user: {
                id: 'user-3',
                first_name: 'Luis',
                last_name: 'Fernandez S.',
                email: 'luis.fernandez@example.com'
            },
            stars: 5,
            review: 'Buena creatina, la uso antes de entrenar y no me ha traído efectos secundarios ni nada, Pd: amo su diseño.',
            created_at: new Date('2025-01-06').toISOString(),
            updated_at: new Date('2025-01-06').toISOString(),
            isAproved: true,
            is_delete: false,
            is_static: true
        },
        {
            id: 'static-4',
            user_id: 'user-4',
            product_id: this.productId,
            user: {
                id: 'user-4',
                first_name: 'Juan',
                last_name: 'Alvarado L.',
                email: 'juan.alvarado@example.com'
            },
            stars: 5,
            review: 'Me llego antes de lo esperado, la creatina se ve de calidad y es fácil de llevar al gimnasio.',
            created_at: new Date('2025-01-05').toISOString(),
            updated_at: new Date('2025-01-05').toISOString(),
            isAproved: true,
            is_delete: false,
            is_static: true
        },
        {
            id: 'static-5',
            user_id: 'user-5',
            product_id: this.productId,
            user: {
                id: 'user-5',
                first_name: 'Alonso',
                last_name: 'Roldan M.',
                email: 'alonso.roldan@example.com'
            },
            stars: 4,
            review: 'Es buena. La comence a tomar con los desayunos y me siento con más energía y puedo entrenar más duro.',
            created_at: new Date('2025-01-04').toISOString(),
            updated_at: new Date('2025-01-04').toISOString(),
            isAproved: true,
            is_delete: false,
            is_static: true
        },
        {
            id: 'static-6',
            user_id: 'user-6',
            product_id: this.productId,
            user: {
                id: 'user-6',
                first_name: 'Marcos',
                last_name: 'Mendez N.',
                email: 'marcos.mendez@example.com'
            },
            stars: 4,
            review: 'Una de las mejores creatinas que he probado, no me ha dado ningún efecto secundario y disuelve muy bien.',
            created_at: new Date('2024-12-27').toISOString(),
            updated_at: new Date('2024-12-27').toISOString(),
            isAproved: true,
            is_delete: false,
            is_static: true
        }
    ];

    ngOnInit() {
        this.loadReviews();
    }

    private loadReviews() {
        this.isLoading = true;

        // Obtener reviews de la API
        this._reviewService.getReviewsByProduct(this.productId, true).subscribe({
            next: (response) => {
                // Combinar reviews de la API con las estáticas
                const apiReviews = response.data.reviews || [];

                // Marcar las reviews de la API como dinámicas
                const dynamicReviews = apiReviews.map(review => ({
                    ...review,
                    is_static: false
                }));

                // Combinar y ordenar por fecha (más recientes primero)
                this.allReviews = [...dynamicReviews, ...this.staticReviews]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                console.log('Reviews cargadas:', this.allReviews);
                
                // Calcular y emitir estadísticas
                this.calculateAndEmitStats();
            },
            error: (error) => {
                console.error('Error al cargar reviews:', error);

                // Si hay error con la API, usar solo las reviews estáticas
                this.allReviews = this.staticReviews.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );

                // Calcular y emitir estadísticas con reviews estáticas
                this.calculateAndEmitStats();

                this._toastService.error(
                    'Error',
                    'No se pudieron cargar algunas reseñas. Mostrando reseñas disponibles.'
                );
            },
            complete: () => {
                this.isLoading = false;
                this.onLoadReviews.set(true);
                this.reviewsLoaded.emit(true);
            }
        });
    }

    getStarsArray(stars: number): { filled: boolean; index: number }[] {
        return Array.from({ length: 5 }, (_, index) => ({
            filled: index < stars,
            index: index + 1
        }));
    }

    /**
     * Calcula las estadísticas de las reviews y las envía al componente padre
     */
    private calculateAndEmitStats() {
        if (this.allReviews.length === 0) return;

        const totalReviews = this.allReviews.length;
        
        // Contar distribución de estrellas
        const starDistribution = {
            5: this.allReviews.filter(r => r.stars === 5).length,
            4: this.allReviews.filter(r => r.stars === 4).length,
            3: this.allReviews.filter(r => r.stars === 3).length,
            2: this.allReviews.filter(r => r.stars === 2).length,
            1: this.allReviews.filter(r => r.stars === 1).length,
        };

        // Calcular porcentajes
        const percentages = {
            5: totalReviews > 0 ? Math.round((starDistribution[5] / totalReviews) * 100) : 0,
            4: totalReviews > 0 ? Math.round((starDistribution[4] / totalReviews) * 100) : 0,
            3: totalReviews > 0 ? Math.round((starDistribution[3] / totalReviews) * 100) : 0,
            2: totalReviews > 0 ? Math.round((starDistribution[2] / totalReviews) * 100) : 0,
            1: totalReviews > 0 ? Math.round((starDistribution[1] / totalReviews) * 100) : 0,
        };

        // Calcular promedio con más precisión
        const totalStars = this.allReviews.reduce((sum, review) => sum + review.stars, 0);
        const averageRating = totalReviews > 0 ? Number((totalStars / totalReviews).toFixed(1)) : 0;

        const stats: ReviewStats = {
            totalReviews,
            averageRating,
            starDistribution,
            percentages
        };

        // Emitir estadísticas
        this.reviewStats.emit(stats);
        console.log('Review stats emitted:', stats);
    }
} 