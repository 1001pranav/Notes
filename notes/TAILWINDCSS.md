# Complete Tailwind CSS Guide: Basics to Hero with Next.js

## Table of Contents
1. [What is Tailwind CSS?](#what-is-tailwind-css)
2. [Setup with Next.js](#setup-with-nextjs)
3. [Core Concepts](#core-concepts)
4. [Basic Utilities](#basic-utilities)
5. [Layout & Spacing](#layout--spacing)
6. [Typography](#typography)
7. [Colors & Backgrounds](#colors--backgrounds)
8. [Responsive Design](#responsive-design)
9. [Flexbox & Grid](#flexbox--grid)
10. [Advanced Features](#advanced-features)
11. [Best Practices](#best-practices)
12. [Hero-Level Techniques](#hero-level-techniques)

## What is Tailwind CSS?

Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build custom designs directly in your markup. Instead of writing custom CSS, you compose designs using pre-built classes.

**Traditional CSS:**
```css
.button {
  background-color: blue;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}
```

**Tailwind approach:**
```html
<button class="bg-blue-500 text-white px-4 py-2 rounded">
  Click me
</button>
```

## Setup with Next.js

### Method 1: Create New Next.js Project with Tailwind

```bash
npx create-next-app@latest my-project --typescript --tailwind --eslint
cd my-project
npm run dev
```

### Method 2: Add Tailwind to Existing Next.js Project

1. **Install Tailwind CSS**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

2. **Configure tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

3. **Add Tailwind directives to CSS**
Create or update `styles/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

4. **Import in _app.js or layout.js**
```javascript
import '../styles/globals.css'
```

## Core Concepts

### Utility-First Philosophy
- Build complex components from a constrained set of primitive utilities
- Every utility class has a single purpose
- Responsive modifiers, hover states, and other variants

### Design System Built-In
- Consistent spacing scale (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64)
- Color palette with consistent naming
- Typography scale
- Responsive breakpoints

## Basic Utilities

### Spacing
```html
<!-- Padding -->
<div class="p-4">Padding all sides</div>
<div class="px-4 py-2">Padding x-axis and y-axis</div>
<div class="pt-4 pr-2 pb-4 pl-2">Individual sides</div>

<!-- Margin -->
<div class="m-4">Margin all sides</div>
<div class="mx-auto">Center horizontally</div>
<div class="mt-8 mb-4">Top and bottom margin</div>
```

### Sizing
```html
<!-- Width -->
<div class="w-full">Full width</div>
<div class="w-1/2">Half width</div>
<div class="w-64">Fixed width (16rem)</div>
<div class="w-screen">Screen width</div>

<!-- Height -->
<div class="h-32">Fixed height</div>
<div class="h-screen">Screen height</div>
<div class="min-h-screen">Minimum screen height</div>
```

## Layout & Spacing

### Display
```html
<div class="block">Block element</div>
<div class="inline">Inline element</div>
<div class="inline-block">Inline-block element</div>
<div class="flex">Flex container</div>
<div class="grid">Grid container</div>
<div class="hidden">Hidden element</div>
```

### Position
```html
<div class="relative">Relative positioning</div>
<div class="absolute top-0 right-0">Absolute positioning</div>
<div class="fixed bottom-4 right-4">Fixed positioning</div>
<div class="sticky top-0">Sticky positioning</div>
```

## Typography

### Text Sizing
```html
<p class="text-xs">Extra small text</p>
<p class="text-sm">Small text</p>
<p class="text-base">Base text</p>
<p class="text-lg">Large text</p>
<p class="text-xl">Extra large text</p>
<p class="text-2xl">2x large text</p>
<h1 class="text-6xl">6x large heading</h1>
```

### Text Styling
```html
<p class="font-thin">Thin weight</p>
<p class="font-normal">Normal weight</p>
<p class="font-bold">Bold weight</p>
<p class="italic">Italic text</p>
<p class="underline">Underlined text</p>
<p class="text-center">Centered text</p>
<p class="text-left">Left aligned</p>
<p class="text-right">Right aligned</p>
```

## Colors & Backgrounds

### Text Colors
```html
<p class="text-gray-500">Gray text</p>
<p class="text-blue-600">Blue text</p>
<p class="text-red-500">Red text</p>
<p class="text-green-600">Green text</p>
```

### Background Colors
```html
<div class="bg-white">White background</div>
<div class="bg-gray-100">Light gray background</div>
<div class="bg-blue-500">Blue background</div>
<div class="bg-gradient-to-r from-blue-500 to-purple-600">Gradient</div>
```

### Borders
```html
<div class="border">Default border</div>
<div class="border-2 border-blue-500">Thick blue border</div>
<div class="border-t-4 border-red-500">Top border only</div>
<div class="rounded">Rounded corners</div>
<div class="rounded-full">Fully rounded</div>
```

## Responsive Design

Tailwind uses a mobile-first approach with breakpoints:
- `sm`: 640px and up
- `md`: 768px and up  
- `lg`: 1024px and up
- `xl`: 1280px and up
- `2xl`: 1536px and up

```html
<!-- Responsive text sizes -->
<h1 class="text-2xl md:text-4xl lg:text-6xl">
  Responsive heading
</h1>

<!-- Responsive layout -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Grid items -->
</div>

<!-- Hide/show on different screens -->
<div class="block md:hidden">Mobile only</div>
<div class="hidden md:block">Desktop only</div>
```

## Flexbox & Grid

### Flexbox
```html
<!-- Flex container -->
<div class="flex items-center justify-between">
  <div>Left item</div>
  <div>Right item</div>
</div>

<!-- Flex direction -->
<div class="flex flex-col">Vertical stack</div>
<div class="flex flex-row">Horizontal stack</div>

<!-- Flex alignment -->
<div class="flex items-center">Center items vertically</div>
<div class="flex justify-center">Center items horizontally</div>
<div class="flex items-center justify-center">Center both ways</div>

<!-- Flex grow/shrink -->
<div class="flex">
  <div class="flex-1">Grows to fill space</div>
  <div class="flex-none">Fixed size</div>
</div>
```

### Grid
```html
<!-- Grid container -->
<div class="grid grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- Items -->
</div>

<!-- Grid spanning -->
<div class="grid grid-cols-4 gap-4">
  <div class="col-span-2">Spans 2 columns</div>
  <div>Item</div>
  <div>Item</div>
</div>
```

## Advanced Features

### States & Variants
```html
<!-- Hover states -->
<button class="bg-blue-500 hover:bg-blue-700 transition-colors">
  Hover me
</button>

<!-- Focus states -->
<input class="border focus:border-blue-500 focus:ring-2 focus:ring-blue-200">

<!-- Active states -->
<button class="bg-gray-200 active:bg-gray-300">
  Click me
</button>

<!-- Group hover -->
<div class="group hover:bg-gray-100">
  <p class="group-hover:text-blue-600">Changes on parent hover</p>
</div>
```

### Animations & Transitions
```html
<!-- Transitions -->
<div class="transition-all duration-300 ease-in-out">
  Smooth transitions
</div>

<!-- Transforms -->
<div class="transform hover:scale-105 hover:rotate-1">
  Hover to transform
</div>

<!-- Built-in animations -->
<div class="animate-pulse">Pulsing animation</div>
<div class="animate-spin">Spinning animation</div>
<div class="animate-bounce">Bouncing animation</div>
```

### Custom Properties with @apply
In your CSS file:
```css
@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
  }
  
  .card {
    @apply bg-white shadow-lg rounded-lg p-6;
  }
}
```

## Best Practices

### 1. Component Extraction
Don't repeat long class strings. Extract components:

```jsx
// ❌ Repetitive
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Button 1
</button>
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Button 2
</button>

// ✅ Component extraction
const Button = ({ children, ...props }) => (
  <button 
    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    {...props}
  >
    {children}
  </button>
)
```

### 2. Use CSS-in-JS for Dynamic Styles
```jsx
const Button = ({ variant = 'primary' }) => {
  const baseClasses = "font-bold py-2 px-4 rounded transition-colors"
  const variantClasses = {
    primary: "bg-blue-500 hover:bg-blue-700 text-white",
    secondary: "bg-gray-300 hover:bg-gray-400 text-gray-800"
  }
  
  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      Click me
    </button>
  )
}
```

### 3. Consistent Spacing Scale
Stick to Tailwind's spacing scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64

### 4. Mobile-First Design
Always start with mobile styles, then add responsive modifiers:
```html
<div class="p-4 md:p-8 lg:p-12">
  Mobile: 1rem padding
  Tablet: 2rem padding  
  Desktop: 3rem padding
</div>
```

## Hero-Level Techniques

### 1. Advanced Custom Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ]
}
```

### 2. Advanced Responsive Patterns
```html
<!-- Container queries simulation -->
<div class="grid grid-cols-1 lg:grid-cols-3">
  <div class="lg:col-span-2">
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <!-- Nested responsive grid -->
    </div>
  </div>
  <div class="space-y-4">
    <!-- Sidebar -->
  </div>
</div>
```

### 3. Complex State Management
```jsx
const AdvancedButton = ({ isLoading, isDisabled, variant }) => {
  const getClasses = () => {
    const base = "relative px-6 py-3 rounded-lg font-medium transition-all duration-200"
    
    if (isDisabled) {
      return `${base} bg-gray-300 text-gray-500 cursor-not-allowed`
    }
    
    if (isLoading) {
      return `${base} bg-blue-400 text-white cursor-wait`
    }
    
    const variants = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
      secondary: "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
    }
    
    return `${base} ${variants[variant]}`
  }
  
  return (
    <button className={getClasses()}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        </div>
      )}
      <span className={isLoading ? 'invisible' : ''}>
        Click me
      </span>
    </button>
  )
}
```

### 4. Performance Optimization
```javascript
// Use PurgeCSS in production (built into Tailwind 3+)
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  // Only include used utilities in production build
}
```

### 5. Custom Directives and Plugins
```javascript
// Custom plugin
const plugin = require('tailwindcss/plugin')

module.exports = {
  plugins: [
    plugin(function({ addUtilities, addComponents, theme }) {
      const newUtilities = {
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      }
      
      addUtilities(newUtilities)
    })
  ]
}
```

### 6. Advanced Animation Patterns
```css
@layer utilities {
  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
```

### 7. Complex Layout Patterns
```jsx
const ComplexLayout = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Header */}
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation content */}
      </nav>
    </header>
    
    {/* Main content */}
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Sticky sidebar content */}
          </div>
        </aside>
        
        {/* Content area */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow rounded-lg p-6">
            {/* Main content */}
          </div>
        </div>
      </div>
    </main>
  </div>
)
```

## Next Steps

1. **Practice with real projects** - Build components and layouts
2. **Explore Tailwind UI** - Official component library for inspiration
3. **Learn Headless UI** - Unstyled, accessible components that pair well with Tailwind
4. **Master the config** - Customize Tailwind to match your design system
5. **Study modern designs** - Analyze how popular sites use utility-first approaches

## Useful Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI](https://tailwindui.com/) - Official component library
- [Headless UI](https://headlessui.dev/) - Unstyled components
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/item
