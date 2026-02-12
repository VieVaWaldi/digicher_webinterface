# DIGICHer WebApp

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on the VM

## Patches

This project uses [patch-package](https://github.com/ds300/patch-package) to fix upstream bugs. Patches are in the `patches/` directory and are applied automatically on `npm install` via the `postinstall` script.

### `@luma.gl/core@9.2.6`

Fixes a race condition where the `ResizeObserver` callback fires before the WebGL device is fully initialized, causing `Cannot read properties of undefined (reading 'maxTextureDimension2D')`. The patch adds a safe fallback of 8192 (standard max texture size) when `device.limits` is not yet available. This can be removed once the bug is fixed upstream in luma.gl.

## Unsorted

### Prefetch data 

ToDo:
* When user visits any page of heritage monitor, it should first load the data of the scenario we landed at (if its one), 
* and after that preload data for all other scenarios.

### Filter persistence across navigation: Url Parameters

Using URL Parameters to share Filters across pages.but la

**URL Length Limits**

- Safe limit: ~2000 characters (works everywhere)
- Modern browsers: 8000+ chars, Chrome handles up to ~2MB

Handling Many Topics

**A few strategies**

1. Use IDs instead of names: ?topics=1,5,23,45 instead of ?topics=archaeology,museums,heritage
2. Limit selections: UX-wise, maybe 10 topics max is reasonable anyway?
3. Compress: Base64 encoded JSON (ugly URLs but short)

**Clean Encapsulation**

// useFilters.ts                                                                                                                                                                                                      
const filters = useFilters(); // reads from URL

filters.query        // "berlin"                                                                                                                                                                                      
filters.topics       // [1, 5, 23]                                                                                                                                                                                    
filters.setTopics([1, 5, 23, 99]); // updates URL

// Switching scenarios - filters come along automatically                                                                                                                                                             
router.push(`/scenarios/funding?${filters.toQueryString()}`);                                                                                                                                                         
                                                                 

