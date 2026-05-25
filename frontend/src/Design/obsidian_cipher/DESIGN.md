---
name: Obsidian Cipher
colors:
  surface: '#111318'
  surface-dim: '#111318'
  surface-bright: '#37393e'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#c2c6d8'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#8c90a1'
  outline-variant: '#424656'
  surface-tint: '#b3c5ff'
  primary: '#b3c5ff'
  on-primary: '#002b75'
  primary-container: '#0066ff'
  on-primary-container: '#f8f7ff'
  inverse-primary: '#0054d6'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#ffb3ad'
  on-tertiary: '#68000a'
  tertiary-container: '#d63135'
  on-tertiary-container: '#fff6f5'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#001849'
  on-primary-fixed-variant: '#003fa4'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#111318'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system is engineered for a high-stakes fintech and cybersecurity environment where trust, precision, and state-of-the-art intelligence are paramount. The brand personality is authoritative yet discreet—acting as a silent, powerful guardian for sensitive financial data.

The aesthetic follows a **Deep Dark-Mode Minimalism** mixed with **Glassmorphism**. It prioritizes high-density information visualized through clean hierarchies. The emotional response should be one of absolute security and futuristic sophistication. Visual weight is carried by "light-emitting" elements (primary actions and AI insights) against a vast, structured void of deep navies and blacks.

## Colors
The palette is rooted in a "True Dark" foundation to maximize contrast and reduce visual fatigue during long-term monitoring. 

- **Primary (Trust Blue):** Used exclusively for high-priority actions, confirmations, and security status indicators.
- **AI/Insights (Deep Purple):** Identifies generative AI features, predictive analytics, and automated insights. Use this to differentiate "system-calculated" data from "human-input" data.
- **Risk/Alerts (Vivid Red):** Reserved strictly for critical vulnerabilities, fraud detection, and system failures.
- **Backgrounds:** A layered approach using `#0A0C10` for the base canvas and `#11141D` for elevated containers.

## Typography
This design system utilizes **Inter** for all standard UI communication to ensure maximum legibility and a neutral, professional tone. **JetBrains Mono** is introduced for technical labels, code snippets, and cryptographic hashes to emphasize the platform's technical rigor.

Tighten letter-spacing on larger display sizes to maintain a "machined" look. All body text should utilize a slightly higher line-height than standard to ensure readability against dark backgrounds.

## Layout & Spacing
The layout employs a **Fluid Grid** model with a 12-column structure for desktop and a 4-column structure for mobile. Spacing follows a strict 4px/8px baseline grid to ensure mathematical precision in the UI.

Generous whitespace (the "Internal Margin") is a hallmark of this design system, preventing the interface from feeling cluttered despite high data density. Sidebars should be fixed-width (280px) while content areas expand fluidly to accommodate multi-pane dashboards.

## Elevation & Depth
Depth is expressed through **Tonal Layers** and **Glassmorphism**, rather than traditional heavy shadows.

1.  **Level 0 (Canvas):** `#0A0C10` – The base foundation.
2.  **Level 1 (Cards/Panels):** `#11141D` – Subtle 1px border (`rgba(255,255,255,0.08)`).
3.  **Level 2 (Modals/Overlays):** A semi-transparent blur (Backdrop-filter: blur(20px)) with a slightly brighter surface tint.
4.  **Glow Effects:** Use soft, diffused primary or secondary color glows (20-40% opacity) behind critical AI insights or active security states to draw the eye without creating visual noise.

## Shapes
The design system uses **Soft (0.25rem)** roundedness to maintain a precise, professional edge. This "near-sharp" aesthetic suggests military-grade hardware and high-end financial tools. 

- **Standard Buttons/Inputs:** 4px (0.25rem)
- **Cards & Dashboard Widgets:** 8px (0.5rem)
- **AI-Specific Tooltips:** Can use 12px (0.75rem) to slightly soften the presence of "intelligent" features compared to the rigid system components.

## Components
- **Buttons:** Primary buttons use a solid Trust Blue fill. Secondary buttons use a ghost style with a subtle white-transparency border. 
- **AI Chips:** Feature a subtle gradient border from Trust Blue to Deep Purple, often accompanied by a "pulsing" 2px dot to indicate live processing.
- **Input Fields:** Darker than the surface background with a high-contrast white caret. Focus states should trigger a 1px Blue glow.
- **Micro-animations:** Use "shimmer" loading states for data tables. Status indicators for "System Secure" should have a slow, rhythmic "breathing" opacity animation.
- **Charts:** Use thin 1.5px strokes for line graphs. Area charts should use a vertical gradient fading into the background to emphasize the glassmorphic aesthetic.
- **Risk Indicators:** Use a high-contrast Red label with JetBrains Mono text for immediate visibility in fraud monitoring views.