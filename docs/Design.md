# Design System Strategy: The Visionary Professional

## 1. Overview & Creative North Star: "The Clinical Lens"
This design system moves beyond the standard medical dashboard to create a high-end, "Editorial Clinical" experience. Our Creative North Star is **"The Clinical Lens"**—a concept where the interface mimics the clarity, precision, and layering of ophthalmic equipment.

Instead of a flat, rigid grid, we utilize **intentional asymmetry** and **tonal depth** to guide the practitioner's eye. We break the "template" look by treating the sidebar as a solid anchor and the main stage as a series of floating, translucent layers. The goal is to provide a sense of calm authority and hyper-clarity for a Brazilian Optometry setting.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep oceanic professionalisms and high-visibility clinical accents.

* **Primary (#006573):** Used for high-intent actions.
* **Secondary (#4b5b7e):** Used for navigational grounding and secondary metadata.
* **Surface (#f4f7f6):** The "Air"—our soft gray canvas that reduces eye strain during long shifts.

### The "No-Line" Rule
**Strict Prohibition:** Do not use 1px solid borders to section off content.
Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` (#eef1f0) card sitting on a `surface` (#f4f7f6) background. If a container needs to stand out, use a shift in depth, not a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers:
1. **Base:** `surface` (#f4f7f6) – The main background.
2. **Sectioning:** `surface-container-low` (#eef1f0) – Large layout areas.
3. **Actionable Cards:** `surface-container-lowest` (#ffffff) – To create "pop" and focus.
4. **Persistent Sidebar:** `on-secondary-fixed` (#233454) – A deep, high-contrast anchor.

### The "Glass & Gradient" Rule
To elevate the "out-of-the-box" feel, use **Glassmorphism** for floating overlays (e.g., dropdowns or tooltips) using `surface-container-lowest` at 80% opacity with a `20px` backdrop-blur.
**Signature Texture:** Use a subtle linear gradient on the Primary CTA from `primary` (#006573) to `primary-container` (#50e1f9) at a 135-degree angle to simulate the refraction of light through a lens.

---

## 3. Typography: Precision & Readability
We pair **Manrope** (Display/Headlines) with **Inter** (Body/Labels) to balance editorial character with clinical utility.

* **Display & Headlines (Manrope):** High-end, geometric, and authoritative. Use `headline-md` (1.75rem) for patient names or primary diagnostic headers.
* **Body & Labels (Inter):** Highly legible. Use `body-md` (0.875rem) for all clinical notes and table data.
* **The Hierarchy Rule:** Brand identity is conveyed through high contrast in scale. A large `display-sm` header should sit near a much smaller, tracked-out `label-sm` (uppercase) to create a sophisticated, modern layout.

---

## 4. Elevation & Depth: Tonal Layering
We replace traditional box-shadows with **Tonal Layering** and **Ambient Light**.

* **The Layering Principle:** Place `surface-container-lowest` (#ffffff) elements on top of `surface-container` (#e5e9e8) to create a natural "lift."
* **Ambient Shadows:** For floating elements, use an extra-diffused shadow: `0 20px 40px rgba(26, 43, 75, 0.06)`. Note the tint: the shadow uses a transparent version of our deep navy, never pure black.
* **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline-variant` (#aaaead) at **15% opacity**. This provides a "suggestion" of a boundary without cluttering the visual field.

---

## 5. Components & EJS Patterns

### Layout (ejs-layout)
The `ejs-layout` should consist of a fixed `10` (2.5rem) width sidebar using `secondary_fixed_dim` and a fluid main content area. The header should be transparent until scrolled, then transition to a blurred glass state.

### Buttons (The Vibrancy Core)
* **Primary:** Background: `primary_fixed` (#50e1f9). Text: `on_primary_fixed` (#003840). Radius: `lg` (1rem). These are the "Cyan" pulses of the system.
* **Secondary:** Ghost-style with a `primary` (#006573) text color and no background.

### Cards & Lists
* **Forbid Dividers:** Use vertical white space `spacing-6` (1.5rem) to separate list items.
* **Rounding:** All cards must use `xl` (1.5rem) corner radius for a friendly, modern "Brazilian Clinic" feel.
* **Tables:** Header rows use `surface-container-high` (#dee3e2). Data rows use alternating `surface` and `surface-container-low` to maintain "No-Line" integrity.

### Clinical Status Badges
* **Positive (Exam Complete):** `primary_container` (#50e1f9) background with `on_primary_container` (#004d58) text.
* **Urgent (Re-exam):** `error_container` (#fb5151) with `on_error_container` (#570008) text.

---

## 6. Do’s and Don’ts

### Do:
* **Do** use asymmetrical spacing. Allow for more "air" on the right side of cards to create a sense of movement.
* **Do** use `9999px` rounding for search bars and status chips to contrast the `1.5rem` rounding of main containers.
* **Do** ensure all clinical data is at least `body-md` (0.875rem) for readability under clinic lighting.

### Don’t:
* **Don’t** use a 1px solid #CCCCCC border. It breaks the "Clinical Lens" premium feel.
* **Don’t** use pure black (#000000) for text. Always use `on_surface` (#2b2f2f) to keep the interface feeling soft.
* **Don’t** crowd the sidebar. Use `spacing-4` between nav items to maintain the "high-end" editorial density.