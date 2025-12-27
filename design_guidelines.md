# Design Guidelines: 캠핑난로 (Camping Heater Rental Service)

## Design Approach
**Reference-Based**: Warm, approachable aesthetic for outdoor/camping service with emphasis on trust and simplicity. Mobile-first single-page application with smooth scroll navigation.

## Core Design Elements

### Color Palette
- **Background**: `#F9F8F4` (Warm Beige)
- **Primary Text**: `#222222` (Dark Gray/Black)
- **Accent/Buttons**: `#654E32` (Dark Brown)
- **Card Background**: `#FFFFFF` (White)
- **Secondary Background**: `#EBE9E4` (Light Gray-Beige for pricing box)

### Typography
- **Font Family**: Pretendard or Noto Sans KR (Korean-optimized sans-serif)
- **Hierarchy**: Large hero titles, clear section headings (H2), readable body text
- **Emphasis**: Bold for labels and important information, gray for subtitles

### Spacing System
Tailwind units: `p-4`, `p-6`, `p-8`, `gap-4`, `gap-6`, `gap-8` for consistent rhythm.
Generous padding on mobile for touch-friendly interactions.

### Layout System
- **Mobile-First**: 375px-430px base, expand to desktop
- **Grid Patterns**: 
  - Feature cards: 1 column (mobile) → 2 columns (tablet) → 4 columns (desktop)
  - Process steps: 2 columns (mobile) → 4 columns (desktop)
  - Form: Full-width single column
- **Container**: Maximum width with centered alignment on desktop

## Component Library

### Navigation
- **Sticky Header**: Fixed to top on scroll
- **Logo**: Flame icon + "캠핑난로" text (left)
- **Menu**: 홈, 난로사용법, 빌리는법, 신청 (hamburger on mobile)
- **Smooth Scroll**: Anchor links to section IDs

### Hero Section
- **Title**: "따뜻한 캠핑의 시작" (large, centered)
- **Subtitle**: Gray descriptive text
- **CTA Buttons**: 
  - Primary: Brown background (`#654E32`), white text
  - Secondary: Transparent with gray border
- **Feature Cards** (4): White cards with circular icon backgrounds, rounded corners, subtle shadows

### Product Cards
- White background, clean layout
- Specs display: 평수, 연료통 크기, 가격
- Maintains beige tone consistency

### Process Steps
- **4 Steps**: Calendar, Box, CreditCard, Refresh icons
- White cards with brown circular icon backgrounds
- Clear step numbers and descriptions

### Pricing Box
- Full-width box, `#EBE9E4` background
- Product name: "도요토미 230 옴니" (emphasized)
- Pricing tiers clearly displayed:
  - 1박 2일: 20,000원 (large)
  - 1일 추가: +10,000원
  - 1주일: 70,000원

### Application Form
- White card, `rounded-xl`, `shadow-md`, generous padding
- **Fields**: 
  - Text inputs: Name, Phone (required), Email
  - Date pickers: Rental start/end dates (grid layout)
  - Select: Heater type (default: 도요토미 230 옴니)
  - Textarea: Additional requests (150px+ height)
- Input style: `#F9F8F4` background, rounded borders
- Submit button: Full width, `bg-[#654E32]`, 50px+ height for touch

### Footer
- **Contact Banner**: "1588-0000" emphasized above footer
- **3-Column Layout** (mobile stacks): Brand, CS Center, Location
- White/light gray background, top border
- Copyright: "© 2025 캠핑난로. All rights reserved." (centered, gray)

## Interactions
- Smooth transitions on button hover/click
- Rounded corners throughout (`rounded-lg`, `rounded-xl`)
- Subtle shadows on cards (`shadow-md`)
- No distracting animations (minimal Framer Motion if used)

## Icons
- **Library**: Lucide React
- **Usage**: Shield, Clock, Thermometer, Flame, Calendar, Box, CreditCard, Refresh/Cycle

## Images
Hero section can include warm camping imagery (optional background or featured visuals showing heaters in use). Product section requires heater product photos with clean backgrounds.