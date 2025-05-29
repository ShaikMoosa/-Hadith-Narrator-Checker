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

# Implement Narrator Profile Panel

## Task
Create a detailed Narrator Profile Panel that displays comprehensive information about a narrator when selected from the narrator list.

## Implementation Guide

### Step 1: Create the NarratorProfile Component

1. **File Location**: Create a new file `components/app/NarratorProfile.tsx`.

2. **Component Structure**:
   - Use a modal or drawer from the `shadcn/ui` library to display the profile panel.
   - The panel should include a header with the narrator's name and credibility badge.
   - Implement tabs for "Biography", "Opinions", and "Source References".

3. **UI Elements**:
   - **Header**:
     - Display the narrator's full name in Arabic and transliteration.
     - Include a credibility badge styled with Tailwind classes (e.g., `bg-primary` for trustworthy, `bg-red-500` for weak).
   - **Tabs**:
     - Use `shadcn/ui` Tabs component to switch between sections.
     - Each tab should be styled with Tailwind classes like `text-primary-foreground`.

4. **State Management**:
   - Define local state for the active tab using `React.useState`.
   - Example:
     ```typescript
     const [activeTab, setActiveTab] = React.useState<"biography" | "opinions" | "sourceReferences">("biography");
     ```

### Step 2: Implement Biography Tab

1. **Content**:
   - Display biographical data such as birth/death year, region, teachers, students, and a text biography.

2. **Data Fetching**:
   - Fetch additional narrator metadata from Supabase using the `utils/supabase/user.ts` utilities.
   - Ensure data is fetched based on the narrator's unique ID.

3. **UI Styling**:
   - Use `shadcn/ui` components for layout and Tailwind classes for styling.
   - Example:
     ```typescript
     <div className="p-4 bg-primary text-primary-foreground">
       <h2 className="text-lg font-bold">Biography</h2>
       <p>{biography}</p>
     </div>
     ```

### Step 3: Implement Opinions Tab

1. **Content**:
   - Render a sortable list of scholarly opinions.
   - Each item should include the scholar's name, verdict, and explanation.

2. **Data Fetching**:
   - Fetch opinions from the Supabase `opinion` table, keyed by `narrator_id`.

3. **UI Styling**:
   - Use `shadcn/ui` List or Table components.
   - Implement client-side sorting using React state.

4. **Example**:
   ```typescript
   <div className="p-4">
     <h2 className="text-lg font-bold">Opinions</h2>
     <ul>
       {opinions.map(opinion => (
         <li key={opinion.id} className="flex justify-between">
           <span>{opinion.scholar}</span>
           <span className={`badge ${opinion.verdict === 'trustworthy' ? 'bg-green-500' : 'bg-red-500'}`}>{opinion.verdict}</span>
           <span>{opinion.reason}</span>
         </li>
       ))}
     </ul>
   </div>
   ```

### Step 4: Implement Source References Tab

1. **Content**:
   - List source references with details like source name and reference number.

2. **UI Styling**:
   - Use `shadcn/ui` components for layout.
   - Ensure each reference is clickable and styled with Tailwind classes.

3. **Example**:
   ```typescript
   <div className="p-4">
     <h2 className="text-lg font-bold">Source References</h2>
     <ul>
       {sourceReferences.map(ref => (
         <li key={ref.id} className="hover:underline">
           {ref.source_ref}
         </li>
       ))}
     </ul>
   </div>
   ```

### Step 5: Add Bookmark and Share Functionality

1. **Bookmark Button**:
   - Add a button to bookmark the narrator.
   - Use Supabase to save bookmarks in the `bookmark` table.

2. **Share Link**:
   - Implement a share button that copies the profile URL to the clipboard.

3. **UI Styling**:
   - Use `shadcn/ui` Button component and Tailwind classes for styling.
   - Example:
     ```typescript
     <button className="btn bg-primary text-primary-foreground" onClick={handleBookmark}>
       Bookmark
     </button>
     ```

### Step 6: Integrate with Narrator List

1. **Trigger Panel**:
   - Ensure the NarratorProfile panel opens when a narrator is clicked in the `NarratorList` component.

2. **Pass Data**:
   - Pass the selected narrator's data to the `NarratorProfile` component.

3. **Example Integration**:
   ```typescript
   <NarratorList onSelectNarrator={setSelectedNarrator} />
   {selectedNarrator && <NarratorProfile narrator={selectedNarrator} />}
   ```

### Debug Logging

- Add detailed debug logs at each step to track data fetching and state changes.
- Example:
  ```typescript
  console.log("Fetching biography for narrator ID:", narratorId);
  ```

By following these steps, you will create a comprehensive and interactive Narrator Profile Panel that enhances the user experience by providing detailed information about narrators in a structured and visually appealing manner.