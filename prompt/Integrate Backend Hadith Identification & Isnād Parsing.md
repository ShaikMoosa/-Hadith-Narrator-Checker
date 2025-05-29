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

# Task 3: Integrate Backend Hadith Identification & Isnād Parsing

## Task Overview
Implement a server action to process hadith text submitted by users, identify the matching canonical hadith from collections, and extract the isnād (chain of narrators).

## Implementation Guide

### Step 1: Set Up the Server Action

1. **Create a New Server Action File**
   - Location: `app/actions/hadith.ts`
   - Purpose: This file will handle the processing of hadith text, including identification and isnād extraction.

2. **Import Required Libraries**
   - Use the `hadith-api` library to find a matching hadith from verified collections.
   - Use the `isnad-parser` library to extract the chain of narrators.
   - Import any necessary utilities for text processing, such as Camel Tools for Arabic text normalization.

3. **Define the Server Action Function**
   - Name the function `processHadithText`.
   - Accept a single parameter: `hadithText` (string).

4. **Implement Input Validation and Normalization**
   - Validate that `hadithText` is not empty and is a valid string.
   - Normalize the text using Camel Tools to handle Arabic text preprocessing.

5. **Integrate Hadith Identification Logic**
   - Use the `hadith-api` to search for the canonical hadith that matches the input text.
   - Handle any potential errors or exceptions during the API call.

6. **Extract Isnād Using Isnād Parser**
   - Once a hadith is identified, use the `isnad-parser` to extract the isnād (chain of narrators).
   - Ensure the isnād is returned as an ordered list/array of narrator IDs or names.

7. **Return a Structured Response**
   - Construct an object containing:
     - Matched hadith details (ID, original text, source, chapter, etc.).
     - An ordered list/array of narrator references.
   - Return this object as the response of the server action.

### Step 2: Implement Debug Logging

1. **Add Debug Logs for Each Major Step**
   - Log the initial input received for processing.
   - Log the normalized text after preprocessing.
   - Log the results of the hadith identification process.
   - Log the extracted isnād details.
   - Log any errors encountered during processing.

2. **Use a Consistent Logging Format**
   - Include timestamps and log levels (e.g., INFO, ERROR) for each log entry.
   - Example log entry: `[INFO] [2023-10-01T12:00:00Z] Hadith text received for processing: "Sample hadith text"`

### Step 3: Connect the Server Action to the Frontend

1. **Update the Hadith Search Input Component**
   - Location: `app/app/page.tsx`
   - Bind the `onSubmit` event of the search form to call the `processHadithText` server action.
   - Pass the user-entered hadith text to the server action.

2. **Handle the Server Action Response**
   - Update the component state with the returned hadith details and isnād.
   - Ensure the UI reflects the results, such as displaying the list of narrators.

### Step 4: Ensure Error Handling and User Feedback

1. **Implement Error Handling in the Server Action**
   - Catch and log any errors during the hadith identification and isnād extraction processes.
   - Return a user-friendly error message if the process fails.

2. **Provide User Feedback in the UI**
   - Display a loading indicator while the server action is processing.
   - Show success or error messages based on the server action response.

### Example Code Snippet

```typescript
// app/actions/hadith.ts
import { hadithApi } from 'hadith-api';
import { isnadParser } from 'isnad-parser';
import { normalizeArabicText } from 'camel-tools';

export async function processHadithText(hadithText: string) {
  console.log(`[INFO] [${new Date().toISOString()}] Hadith text received for processing: "${hadithText}"`);

  // Validate and normalize input
  if (!hadithText) {
    console.error(`[ERROR] [${new Date().toISOString()}] Invalid hadith text input.`);
    throw new Error('Invalid hadith text input.');
  }
  const normalizedText = normalizeArabicText(hadithText);
  console.log(`[INFO] [${new Date().toISOString()}] Normalized hadith text: "${normalizedText}"`);

  try {
    // Identify the hadith
    const hadithDetails = await hadithApi.findHadith(normalizedText);
    console.log(`[INFO] [${new Date().toISOString()}] Hadith identified: ${JSON.stringify(hadithDetails)}`);

    // Extract isnād
    const isnad = isnadParser.extractIsnad(hadithDetails.text);
    console.log(`[INFO] [${new Date().toISOString()}] Isnād extracted: ${JSON.stringify(isnad)}`);

    return {
      hadithDetails,
      isnad,
    };
  } catch (error) {
    console.error(`[ERROR] [${new Date().toISOString()}] Error processing hadith text: ${error.message}`);
    throw new Error('Failed to process hadith text.');
  }
}
```

This guide provides a detailed breakdown of the steps required to implement the backend hadith identification and isnād parsing feature, ensuring clear logging and error handling throughout the process.