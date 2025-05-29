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

# Task 6: Add Scholarly Opinions & Source References Integration

## Task Overview
- **User Story**: As a user, I want to sort and review detailed scholarly opinions and view source references for each narrator.
- **Objective**: Extend the NarratorProfile panel to include a detailed Opinions tab, allowing users to view and sort scholarly opinions and source references.

## Implementation Guide

### Step 1: Extend the NarratorProfile Component

1. **File Location**: `components/app/NarratorProfile.tsx`
2. **Objective**: Add a new tab for "Opinions" within the existing NarratorProfile component.

#### Actions:
- Import necessary components from `shadcn/ui` for Tabs and List/Table.
- Add a new tab labeled "Opinions" to the existing Tabs component.
- Ensure the tab content area is ready to display a sortable list of scholarly opinions.

### Step 2: Fetch Scholarly Opinions Data

1. **Data Source**: Supabase `opinion` table.
2. **Objective**: Retrieve scholarly opinions related to the selected narrator.

#### Actions:
- Use the existing Supabase client utilities to fetch opinions based on the `narrator_id`.
- Implement a function to fetch data when the "Opinions" tab is activated.

```typescript
import { createSupabaseClient } from '@/utils/supabase/client';

async function fetchOpinions(narratorId: number) {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('opinion')
    .select('*')
    .eq('narrator_id', narratorId);

  if (error) {
    console.error('Error fetching opinions:', error);
    return [];
  }

  return data;
}
```

### Step 3: Render Scholarly Opinions

1. **Objective**: Display the fetched opinions in a sortable list/table format.

#### Actions:
- Use `shadcn/ui` List or Table components to render the opinions.
- Each row should display:
  - Scholar name
  - Verdict (styled badge for "Trustworthy" or "Weak")
  - Explanation/reason text
  - Clickable source reference

```typescript
import { List, ListItem, Badge } from '@/components/ui';

function OpinionsList({ opinions }) {
  return (
    <List>
      {opinions.map((opinion) => (
        <ListItem key={opinion.id}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">{opinion.scholar}</h3>
              <p>{opinion.reason}</p>
              <a href="#" className="text-primary">{opinion.source_ref}</a>
            </div>
            <Badge className={`bg-${opinion.verdict === 'trustworthy' ? 'green' : 'red'}-500`}>
              {opinion.verdict}
            </Badge>
          </div>
        </ListItem>
      ))}
    </List>
  );
}
```

### Step 4: Implement Sorting Functionality

1. **Objective**: Allow users to sort the opinions by scholar name or verdict.

#### Actions:
- Use React state to manage the active sort criteria.
- Implement sorting logic within the component.

```typescript
import React, { useState } from 'react';

function SortableOpinionsList({ opinions }) {
  const [sortCriteria, setSortCriteria] = useState('scholar');

  const sortedOpinions = [...opinions].sort((a, b) => {
    if (sortCriteria === 'scholar') {
      return a.scholar.localeCompare(b.scholar);
    }
    return a.verdict.localeCompare(b.verdict);
  });

  return (
    <div>
      <div className="flex justify-end">
        <button onClick={() => setSortCriteria('scholar')}>Sort by Scholar</button>
        <button onClick={() => setSortCriteria('verdict')}>Sort by Verdict</button>
      </div>
      <OpinionsList opinions={sortedOpinions} />
    </div>
  );
}
```

### Step 5: Integrate with NarratorProfile State

1. **Objective**: Ensure the Opinions tab interacts correctly with the NarratorProfile component state.

#### Actions:
- Update the `NarratorProfileState` to include the active tab and opinions data.
- Ensure the Opinions tab fetches data when activated and updates the component state.

```typescript
export interface NarratorProfileState {
  activeTab: "biography" | "opinions" | "sourceReferences";
  opinions: Opinion[];
  setActiveTab: (tab: "biography" | "opinions" | "sourceReferences") => void;
  setOpinions: (opinions: Opinion[]) => void;
}
```

### Debug Logging

- Add console logs to track data fetching and sorting operations.
- Example: `console.log('Fetching opinions for narrator:', narratorId);`

### Conclusion

By following these steps, you will successfully integrate scholarly opinions and source references into the NarratorProfile component, providing users with a detailed and sortable view of scholarly opinions related to narrators. Ensure that all UI components are styled using Tailwind CSS classes and shadcn/ui components for consistency.