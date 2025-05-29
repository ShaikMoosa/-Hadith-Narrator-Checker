We are building a next js project based on an existing next js template that have auth, payment built already, below are rules you have to follow:

<frontend rules>
1. MUST Use 'use client' directive for client-side components; In Next.js, page components are server components by default, and React hooks like useEffect can only be used in client components.
2. The UI has to look great, using polished component from shadcn, tailwind when possible; Don't recreate shadcn components, make sure you use 'shadcn@latest add xxx' CLI to add components
3. MUST adding debugging log & comment for every single feature we implement
4. Make sure to concatenate strings correctly using backslash
7. Use stock photos from picsum.photos where appropriate, only valid URLs you know exist
8. Don't update shadcn components unless otherwise specified
9. Configure next.config.js image remotePatterns to enable stock photos from picsum.photos
11. MUST implement the navigation elements items in their rightful place i.e. Left sidebar, Top header
12. Accurately implement necessary grid layouts
13. Follow proper import practices:
   - Use @/ path aliases
   - Keep component imports organized
   - Update current src/app/page.tsx with new comprehensive code
   - Don't forget root route (page.tsx) handling
   - You MUST complete the entire prompt before stopping
</frontend rules>

<styling_requirements>
- You ALWAYS tries to use the shadcn/ui library.
- You MUST USE the builtin Tailwind CSS variable based colors as used in the examples, like bg-primary or text-primary-foreground.
- You DOES NOT use indigo or blue colors unless specified in the prompt.
- You MUST generate responsive designs.
- The React Code Block is rendered on top of a white background. If v0 needs to use a different background color, it uses a wrapper element with a background color Tailwind class.
</styling_requirements>

<frameworks_and_libraries>
- You prefers Lucide React for icons, and shadcn/ui for components.
- You MAY use other third-party libraries if necessary or requested by the user.
- You imports the shadcn/ui components from "@/components/ui"
- You DOES NOT use fetch or make other network requests in the code.
- You DOES NOT use dynamic imports or lazy loading for components or libraries. Ex: const Confetti = dynamic(...) is NOT allowed. Use import Confetti from 'react-confetti' instead.
- Prefer using native Web APIs and browser features when possible. For example, use the Intersection Observer API for scroll-based animations or lazy loading.
</frameworks_and_libraries>

# Implementation Guide: Build Overall App Layout & Core UI Shell

## Task Overview
Create a consistent and fully styled application layout to facilitate easy navigation and access to features. This involves updating the `app/app/page.tsx` to serve as the authenticated homepage, integrating the existing `Header` component, and setting up a responsive layout shell.

## Implementation Steps

### Step 1: Update the Homepage Layout

1. **File Location**: Open `app/app/page.tsx`.

2. **Import Required Components**:
   - Import the `Header` component from `components/app/Header.tsx`.
   - Import necessary UI components from `@/components/ui`.

3. **Setup the Layout Structure**:
   - Use a top-level container to wrap the entire page content. This container should ensure responsiveness and consistent padding/margins.
   - Define a central area within this container to house the hadith search input and other future components.

4. **Integrate the Header**:
   - Place the `Header` component at the top of the page layout. Ensure it uses the `shadcn/ui` styling and Tailwind classes like `bg-primary` and `text-primary-foreground` to match the overall app theme.

5. **Define Placeholder Areas**:
   - Create placeholder sections for the “Hadith-Text Search” form and the “Narrator Details” sections. These should be clearly defined but not use any placeholder third-party components.

### Step 2: Implement Responsive Design

1. **Responsive Wrapper**:
   - Use a wrapper element with Tailwind classes to ensure the layout is responsive. For example, use classes like `flex`, `flex-col`, `items-center`, and `justify-center` to center content vertically and horizontally.

2. **Tailwind CSS Styling**:
   - Apply Tailwind CSS classes to ensure the layout is visually appealing and consistent with the app's theme. Use classes like `bg-primary`, `text-primary-foreground`, `p-4`, and `m-4` for padding and margins.

### Step 3: Define State Management

1. **State Slices**:
   - Define state slices for future components using `React.useState`. These include:
     - `hadithInput`: A string to hold the input text for the hadith search.
     - `narrators`: An array to store the list of narrators (initially empty).
     - `selectedNarrator`: An object to store the currently selected narrator (initially null).

2. **Example State Initialization**:
   ```typescript
   const [hadithInput, setHadithInput] = React.useState<string>('');
   const [narrators, setNarrators] = React.useState<Narrator[]>([]);
   const [selectedNarrator, setSelectedNarrator] = React.useState<Narrator | null>(null);
   ```

### Step 4: Integrate UI Components

1. **Central Container**:
   - Within the central container, define areas for the hadith search input and future components like the “Recent Searches” carousel and narrator list.

2. **Use shadcn/ui Primitives**:
   - Utilize `shadcn/ui` primitives for boxes, containers, and headings. Ensure these components are imported from `@/components/ui`.

### Step 5: Debug Logging

1. **Add Debug Logs**:
   - Implement detailed debug logs to track the state changes and component rendering. Use `console.log` statements to log the initial state and any updates to the state variables.

2. **Example Debug Log**:
   ```typescript
   console.log('Initial hadithInput:', hadithInput);
   console.log('Updated narrators:', narrators);
   ```

By following these steps, you will create a cohesive and responsive layout for the application, ensuring that future components can be easily integrated and styled consistently.