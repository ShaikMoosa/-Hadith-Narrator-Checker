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

# Implementation Guide: Homepage Hadith Search Input

## Task Overview
Implement a central input field on the homepage for users to paste or type a hadith, which the system will process upon submission.

## Implementation Steps

### Step 1: Set Up the Search Component

1. **Create the Search Component:**
   - In the `app/app/page.tsx`, add a new component for the hadith search input.
   - Use shadcn/ui components for the input field and button to ensure consistent styling.

2. **Design the Input Field:**
   - Use a large `textarea` or `input` field with a placeholder text "Paste hadith here…".
   - Ensure the input field is styled using Tailwind CSS classes like `bg-primary` and `text-primary-foreground` for consistency with the app theme.

3. **Add a Submit Button:**
   - Place a primary styled "Check" button directly below the input field.
   - Use shadcn/ui Button component for the button.

### Step 2: Implement Input Handling

1. **Manage Local State:**
   - Use `React.useState` to manage the input text state.
   - Initialize a state variable `hadithInput` to store the user's input.

   ```typescript
   const [hadithInput, setHadithInput] = React.useState<string>('');
   ```

2. **Handle Input Changes:**
   - Bind the input field to the `hadithInput` state.
   - Update the state on every change in the input field.

   ```typescript
   <textarea
     value={hadithInput}
     onChange={(e) => setHadithInput(e.target.value)}
     placeholder="Paste hadith here…"
     className="w-full p-4 bg-primary text-primary-foreground"
   />
   ```

### Step 3: Implement Submission Logic

1. **Bind Submission Events:**
   - Attach an `onClick` event to the "Check" button to handle form submission.
   - Also, bind the "Enter" key to trigger the submission logic.

   ```typescript
   const handleSubmit = () => {
     // Logic to process the hadith input
     console.log('Submitted hadith:', hadithInput);
   };

   <button
     onClick={handleSubmit}
     className="mt-4 bg-primary text-primary-foreground"
   >
     Check
   </button>
   ```

2. **Keyboard Event Handling:**
   - Add an event listener for the "Enter" key to trigger the `handleSubmit` function.

   ```typescript
   const handleKeyPress = (event: React.KeyboardEvent) => {
     if (event.key === 'Enter') {
       handleSubmit();
     }
   };

   <textarea
     onKeyPress={handleKeyPress}
     // other props
   />
   ```

### Step 4: Integrate Recent Searches Carousel

1. **Set Up Recent Searches Component:**
   - Below the search input, add a placeholder for the "Recent Searches" carousel.
   - Use a horizontal scroll list designed with shadcn/ui components.

2. **Prepare for Data Integration:**
   - Initially, the carousel will be empty but structured to accept data.
   - Plan to populate this component with the user's search history in future tasks.

### Debug Logging

- **Input Change Logging:**
  - Log the input value every time it changes to ensure the state is updated correctly.

  ```typescript
  console.log('Current input:', hadithInput);
  ```

- **Submission Logging:**
  - Log the hadith input upon submission to verify the correct data is being processed.

  ```typescript
  console.log('Submitted hadith:', hadithInput);
  ```

### Final Notes

- Ensure all components are responsive and styled using Tailwind CSS classes.
- Use shadcn/ui components for consistent UI elements.
- The search input and button should be centrally aligned and visually prominent on the page.
- Prepare the "Recent Searches" component for future data integration, ensuring it is styled and positioned correctly.

By following these steps, you will implement a functional and visually appealing hadith search input on the homepage, ready for further backend integration and user interaction enhancements.