# UI Primitive Inventory

**Before building a new UI primitive, check this list.** Reusing an existing primitive is almost always the right call. Only create a new one if no existing primitive can be configured to fit.

Each entry: selector → location → quick description → key inputs.

## Layout & containers

| Selector | Path | Description |
|---|---|---|
| `ml-card` | `shared/ui/card/` | Rounded surface for sections/cards. Inputs: `surface` (`default`/`alt`), `padding` (`none`/`sm`/`md`/`lg`), `extraClass`. Slots default content. |
| `ml-action-card` | `shared/ui/action-card/` | Card with optional gradient accent header, body, and footer slot. Input: `accent` (boolean). Slot selectors: `[accent]`, default, `[footer]`. |
| `ml-page-header` | `shared/ui/page-header/` | Standard h1 page title inside the max-w-7xl container. Input: `title` (required). Slot for subtitle. |
| `ml-breadcrumb` | `shared/ui/breadcrumb/` | Breadcrumb nav. Input: `items: { label, link? }[]`. |

## Buttons & links

| Selector | Path | Description |
|---|---|---|
| `ml-button` | `shared/ui/button/` | Native button. Inputs: `name` (required), `type` (`primary`/`secondary`/`secondary-outlined`), `isDisabled`, `isProcessing`. |
| `ml-link-button` | `shared/ui/link-button/` | Anchor styled as button (internal `routerLink` or external `href`). Inputs: `routerLink`/`href`, `target`, `type` (`primary`/`primary-outlined`), `size` (`md`/`lg`). |

## Form controls (all implement ControlValueAccessor)

| Selector | Path | Description |
|---|---|---|
| `ml-input` | `shared/ui/input/` | Text-like input (text/email/password/tel/number/date/search). Inputs: `label` (required), `inputType`, `placeholder`, `required`, `readonly`, `maxLength`, `errors`. |
| `ml-select` | `shared/ui/select/` | Native select with label. Inputs: `label` (required), `required`, `errors`. Output: `selectionChange`. Project options into slot. |
| `ml-form-field` | `shared/ui/form-field/` | Generic field wrapper (label + error display). Use when you need a non-input/select control with the same chrome. |
| `ml-password-input` | `shared/ui/password-input/` | Password input with show/hide toggle. |

## Feedback & status

| Selector | Path | Description |
|---|---|---|
| `ml-badge` | `shared/ui/badge/` | Pill badge. Inputs: `color` (required: `green`/`yellow`/`red`/`blue`/`indigo`/`gray`), `label` (required), `pulse`, `size` (`sm`/`md`). |
| `ml-alert` | `shared/ui/alert/` | Banner alert with icon. Input: `type` (required: `success`/`error`/`warning`/`info`). Slot for body. |
| `ml-spinner` | `shared/ui/spinner/` | Loading spinner. |
| `ml-toast` | `shared/ui/toast/` | Toast notifications — driven by `ToastService.success/error/warning/info(title, message)`. Don't instantiate manually; call the service. |

## Domain-specific

| Selector | Path | Description |
|---|---|---|
| `ml-cart` | `shared/ui/cart/` | Shopping cart sidebar/widget. |
| `ml-loyalty-meter` | `shared/ui/loyalty-meter/` | Progress meter for loyalty points. |
| `ml-product-quantity` | `shared/ui/product-quantity/` | Quantity selector (+/- stepper). |
| `ml-purchase-option` | `shared/ui/purchase-option/` | Subscription vs one-time purchase option card. |
| `ml-payment-method` | `shared/ui/payment-method/` | Saved payment method card. |
| `ml-star-rating` | `shared/ui/star-rating/` | Star rating display/input. |
| `ml-reviews-list` | `shared/ui/reviews-list/` | List of product reviews. |
| `ml-review-skeleton` | `shared/ui/review-skeleton/` | Skeleton loader for a review item. |
| `ml-accordion` | `shared/ui/accordion/` | Collapsible accordion. |
| `ml-cookies-banner` | `shared/ui/cookies-banner/` | GDPR cookie banner. |
| `ml-urgency-bar` | `shared/ui/urgency-bar/` | Marketing urgency banner. |
| `ml-black-friday-bar` | `shared/ui/black-friday-bar/` | Campaign banner. |
| `ml-flow-widget-add-card` | `shared/ui/flow-widget-add-card/` | Flow payment "add card" widget. |
| `ml-inline-modal` | `shared/ui/inline-modal/` | Inline modal pattern (no MatDialog). |
| `app-modal` (note: `app-` prefix) | `shared/ui/modal/` | Material Dialog wrapper. Use via `ModalService`. |
| `app-monthly-reward-modal` | `shared/ui/monthly-reward-modal/` | Monthly loyalty reward modal. |
| `app-verification-payment-modal` | `shared/ui/verification-payment-modal/` | Payment verification modal. |
| `app-tooltip` | `shared/ui/tooltip/` | Tooltip (used inside `group hover:` containers). |

## Services worth knowing

Pages typically inject one or more of:

- `AuthService` — current user, login state
- `SeoService` — set title/description/robots
- `ToastService` — `.success/.error/.warning/.info(title, message)`
- `ModalService` — open `app-modal` dialogs
- `CartService` — cart state
- `ProductService`, `OrderService`, `SubscriptionService` — domain data
- `HotjarService`, `MetaAnalyticsService`, `TiktokAnalyticsService` — analytics
- `ProfileCompletionService` — aggregated dashboard data for `/cuenta/mi-cuenta`

All live under `src/app/shared/services/`.

## Models & interfaces

- Data shapes live in `src/app/shared/models/*.model.ts` (Product, Cart, Order, Subscription, Flow, Summary).
- API/DTO shapes live in `src/app/shared/interfaces/*.interfaces.ts`.
- Reuse these — don't redeclare local interfaces for the same concept inside a page.
