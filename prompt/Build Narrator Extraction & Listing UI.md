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

# Task 4: Build Narrator Extraction & Listing UI

## Task Overview
- **User Story**: As a user, after performing a search, I want to see an ordered list of narrators extracted from my submitted hadith.
- **Objective**: Display an ordered list of narrators within the search results area after a hadith identification request returns.

## Implementation Guide

### Step 1: Set Up State Management
1. **Define State for Narrators**:
   - In `app/app/page.tsx`, ensure you have a state slice to manage the list of narrators.
   - Use `React.useState` to create a state variable `narrators` initialized as an empty array.

   ```typescript
   const [narrators, setNarrators] = React.useState<Narrator[]>([]);
   ```

2. **Update State on Search Completion**:
   - When the hadith identification request (from Task 3) completes, update the `narrators` state with the returned array of narrators.

### Step 2: Create the NarratorList Component
1. **Component Setup**:
   - Create a new file `components/app/NarratorList.tsx`.
   - Import necessary components from `shadcn/ui` and Tailwind CSS classes.

2. **Component Structure**:
   - Use a `List` or `Card` component from `shadcn/ui` to render each narrator.
   - Each card should display:
     - The narrator's name in Arabic and transliteration (if available).
     - A credibility badge indicating "Trustworthy" or "Weak".

3. **Example Component Code**:
   ```typescript
   import React from 'react';
   import { Card, Badge } from '@/components/ui';
   import { Narrator } from '@/types';

   interface NarratorListProps {
     narrators: Narrator[];
     onSelectNarrator: (narrator: Narrator) => void;
   }

   const NarratorList: React.FC<NarratorListProps> = ({ narrators, onSelectNarrator }) => {
     return (
       <div className="space-y-4">
         {narrators.map((narrator) => (
           <Card key={narrator.id} onClick={() => onSelectNarrator(narrator)} className="cursor-pointer">
             <div className="flex justify-between items-center">
               <div>
                 <h3 className="text-lg font-bold">{narrator.nameArabic}</h3>
                 {narrator.nameTransliteration && (
                   <p className="text-sm text-gray-500">{narrator.nameTransliteration}</p>
                 )}
               </div>
               <Badge className={`bg-${narrator.credibility === 'trustworthy' ? 'green' : 'red'}-500`}>
                 {narrator.credibility}
               </Badge>
             </div>
           </Card>
         ))}
       </div>
     );
   };

   export default NarratorList;
   ```

### Step 3: Integrate NarratorList into the Main Page
1. **Import and Use the Component**:
   - In `app/app/page.tsx`, import `NarratorList` and render it within the main container.
   - Pass the `narrators` state and a handler function `onSelectNarrator` to manage the selection of a narrator.

   ```typescript
   import NarratorList from '@/components/app/NarratorList';

   const handleSelectNarrator = (narrator: Narrator) => {
     // Logic to handle narrator selection, e.g., open a profile panel
   };

   return (
     <div className="container mx-auto p-4">
       {/* Other components like search input */}
       <NarratorList narrators={narrators} onSelectNarrator={handleSelectNarrator} />
     </div>
   );
   ```

### Step 4: Add Debug Logging
1. **Log State Changes**:
   - Add `console.log` statements to track changes in the `narrators` state and when a narrator is selected.

   ```typescript
   React.useEffect(() => {
     console.log('Narrators updated:', narrators);
   }, [narrators]);

   const handleSelectNarrator = (narrator: Narrator) => {
     console.log('Narrator selected:', narrator);
     // Additional logic
   };
   ```

### Step 5: Styling and Responsiveness
1. **Ensure Responsive Design**:
   - Use Tailwind CSS classes to ensure the `NarratorList` is responsive.
   - Use utility classes like `space-y-4`, `flex`, `justify-between`, and `items-center` for layout.

2. **Consistent Styling**:
   - Apply Tailwind CSS variable-based colors such as `bg-primary` and `text-primary-foreground` to maintain consistency with the overall app theme.

By following these steps, you will successfully implement the Narrator Extraction & Listing UI, providing users with a clear and interactive way to view narrators extracted from their hadith submissions.