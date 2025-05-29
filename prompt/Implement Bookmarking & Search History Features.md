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

# Implement Bookmarking & Search History Features

## Task Overview
Implement bookmarking functionality for narrators and a search history feature for users. This will allow users to bookmark narrators for easy access later and review their last 10 hadith searches.

## Implementation Guide

### Bookmarking Feature

1. **Create Bookmark Button in NarratorProfile Component**
   - **Location**: `components/app/NarratorProfile.tsx`
   - **UI Details**:
     - Add a `Bookmark` button within the `NarratorProfile` component.
     - Use a `Button` component from `shadcn/ui` with Tailwind classes for styling (e.g., `bg-primary`, `text-primary-foreground`).
     - Use a `Lucide React` icon to visually indicate the bookmark state (e.g., a filled or outlined star).

2. **Handle Bookmark State**
   - **State Management**:
     - Add a local state to manage the bookmark status of the narrator.
     - Example:
       ```typescript
       const [isBookmarked, setIsBookmarked] = useState(false);
       ```

3. **Implement Bookmark Action**
   - **Location**: `app/actions/hadith.ts`
   - **Functionality**:
     - Create a server action to handle bookmarking.
     - Use Supabase to insert or delete a bookmark entry in the `bookmark` table.
     - Example:
       ```typescript
       import { createSupabaseAdminClient } from '@/utils/supabase/server';

       export async function toggleBookmark(narratorId: number, userId: string, isBookmarked: boolean) {
         const supabase = await createSupabaseAdminClient();
         if (isBookmarked) {
           await supabase.from('bookmark').delete().eq('narrator_id', narratorId).eq('user_id', userId);
         } else {
           await supabase.from('bookmark').insert({ narrator_id: narratorId, user_id: userId });
         }
       }
       ```

4. **Connect UI with Bookmark Action**
   - **Event Handling**:
     - On button click, call the `toggleBookmark` function.
     - Update the local `isBookmarked` state based on the action result.
     - Example:
       ```typescript
       const handleBookmarkClick = async () => {
         await toggleBookmark(narratorId, userId, isBookmarked);
         setIsBookmarked(!isBookmarked);
       };
       ```

### Search History Feature

1. **Display Recent Searches in Home/Search Page**
   - **Location**: `components/app/RecentSearches.tsx`
   - **UI Details**:
     - Create a horizontal scroll list to display recent searches.
     - Use `shadcn/ui` components for the list and Tailwind classes for styling.

2. **Fetch Recent Searches**
   - **Data Fetching**:
     - Use Supabase to fetch the latest 10 searches from the `search` table for the authenticated user.
     - Example:
       ```typescript
       import { createSupabaseClient } from '@/utils/supabase/client';

       export async function fetchRecentSearches(userId: string) {
         const supabase = await createSupabaseClient();
         const { data, error } = await supabase
           .from('search')
           .select('*')
           .eq('user_id', userId)
           .order('searched_at', { ascending: false })
           .limit(10);
         if (error) throw error;
         return data;
       }
       ```

3. **Integrate Recent Searches with UI**
   - **State Management**:
     - Add a state to manage the list of recent searches.
     - Example:
       ```typescript
       const [recentSearches, setRecentSearches] = useState<Search[]>([]);
       ```

   - **Component Integration**:
     - Fetch recent searches on component mount and update the state.
     - Render the list using a map function over the `recentSearches` state.
     - Example:
       ```typescript
       useEffect(() => {
         const loadRecentSearches = async () => {
           const searches = await fetchRecentSearches(userId);
           setRecentSearches(searches);
         };
         loadRecentSearches();
       }, []);
       ```

### UI Feedback and Responsiveness

- **Toast Notifications**:
  - Use toast notifications to provide feedback on bookmark actions (e.g., "Narrator bookmarked" or "Bookmark removed").
  - Ensure notifications are styled consistently with the app theme.

- **Responsive Design**:
  - Ensure that both the bookmark button and recent searches list are responsive.
  - Use Tailwind's responsive utilities to adjust layouts for different screen sizes.

By following these steps, you will implement a bookmarking feature for narrators and a search history feature for users, enhancing the user experience by allowing easy access to frequently used data.