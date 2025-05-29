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

# Final Integration & Polish Implementation Guide

## Task
Integrate all components and features to ensure the Hadith Narrator Checker MVP works seamlessly across the application with optimal performance.

## Implementation Guide

### Step 1: Integrate Search Input with Backend Action

1. **Connect Search Input to Backend:**
   - In `app/app/page.tsx`, ensure the search input component is connected to the backend action.
   - Import the server action from `app/actions/hadith.ts` to handle the hadith text processing.

   ```typescript
   import { processHadithText } from '@/app/actions/hadith';
   ```

2. **Handle Form Submission:**
   - Bind the form submission to trigger the backend action.
   - Use `React.useState` to manage the input text and handle the form submission.

   ```typescript
   const [hadithInput, setHadithInput] = React.useState('');

   const handleSubmit = async (event: React.FormEvent) => {
     event.preventDefault();
     try {
       const result = await processHadithText(hadithInput);
       // Handle the result, e.g., update state with narrators
     } catch (error) {
       console.error('Error processing hadith:', error);
     }
   };
   ```

3. **Update State with Results:**
   - Upon successful processing, update the state with the list of narrators returned from the backend.

   ```typescript
   const [narrators, setNarrators] = React.useState<Narrator[]>([]);

   const handleSubmit = async (event: React.FormEvent) => {
     // ... existing code
     const result = await processHadithText(hadithInput);
     setNarrators(result.narrators);
   };
   ```

### Step 2: Ensure State Management Across Components

1. **Pass State Between Components:**
   - Ensure that the state is correctly passed from the search input to the narrator list and profile components.
   - Use React context or props to manage state across components.

   ```typescript
   <NarratorList narrators={narrators} onSelectNarrator={setSelectedNarrator} />
   ```

2. **Manage Selected Narrator State:**
   - Maintain a state for the selected narrator to drive the profile panel.

   ```typescript
   const [selectedNarrator, setSelectedNarrator] = React.useState<Narrator | null>(null);
   ```

### Step 3: Validate Authentication Integration

1. **Ensure Authentication for Bookmarking and Search History:**
   - Use the existing authentication system to protect routes and manage user-specific features like bookmarking and search history.
   - Check user authentication status before allowing bookmarking.

   ```typescript
   import { useSession } from 'next-auth/react';

   const { data: session } = useSession();
   ```

2. **Implement Conditional Rendering:**
   - Conditionally render components based on authentication status.

   ```typescript
   {session ? (
     <BookmarkButton narratorId={selectedNarrator?.id} />
   ) : (
     <p>Please sign in to bookmark narrators.</p>
   )}
   ```

### Step 4: UI Review and Styling Consistency

1. **Ensure Consistent Styling:**
   - Review all components to ensure they use `shadcn/ui` components and Tailwind CSS classes like `bg-primary` and `text-primary-foreground`.

2. **Responsive Design:**
   - Verify that all components are responsive and adjust correctly on different screen sizes.

3. **UI Polish:**
   - Ensure all UI elements are visually appealing and consistent with the overall theme.
   - Use `Lucide React` for icons and ensure they are used consistently across the application.

### Step 5: Finalize and Test Integration

1. **Cross-Component Testing:**
   - Test the entire flow from hadith input to narrator profile display to ensure seamless integration.
   - Verify that state updates correctly and UI components render as expected.

2. **Debug Logging:**
   - Add detailed debug logs to track the flow and identify any issues.

   ```typescript
   console.log('Submitting hadith:', hadithInput);
   console.log('Received narrators:', narrators);
   ```

3. **Performance Optimization:**
   - Ensure fast load times by optimizing component rendering and minimizing unnecessary re-renders.

By following these steps, you will ensure that the Hadith Narrator Checker MVP is fully integrated, polished, and ready for use. The application should provide a seamless user experience with efficient state management and responsive design.