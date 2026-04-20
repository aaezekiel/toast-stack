# Toast Stack

A toast component for React. Dark card, stacking, progress ring, hover-to-expand, and auto-dismiss.

## Installation

```bash
npm install toast-stack
```

## Usage

```tsx
// layout.tsx
import 'toast-stack/styles.css'
import { Toaster } from 'toast-stack'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

```tsx
// my-component.tsx
'use client'

import { toast } from 'toast-stack'

export default function MyComponent() {
  return (
    <button onClick={() => toast('Event has been created')}>
      Show toast
    </button>
  )
}
```

## Types

```tsx
toast('Default toast')
toast.success('Event has been created')
toast.error('Event has not been created')
toast.warning('Storage is almost full')
toast.info('Update available')
```

## Documentation

[aaezekiel.co/notes/toast-stack](https://aaezekiel.co/notes/toast-stack)

## License

MIT
