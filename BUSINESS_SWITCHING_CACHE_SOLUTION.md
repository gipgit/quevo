# Business Switching Cache Solution

## Problem Description

When users switch businesses in the dashboard, server-side components (like services, products, etc.) would continue to show data from the previous business until a manual page refresh. This happened because:

1. **Next.js Server-Side Caching**: Server-side components fetch data based on the business ID from cookies
2. **Race Condition**: When switching businesses, the client-side context updates but server-side components still use cached data
3. **Navigation Issues**: When switching businesses and then navigating to different pages, the cache invalidation wasn't working properly

## Solution Overview

We implemented a **multi-layered, aggressive cache invalidation system** that ensures fresh data is always loaded when switching businesses.

## Architecture

### 1. Business Context (`business-context.tsx`)
- **Cache Buster**: Generates timestamp-based cache buster when business switches
- **Cookie Management**: Sets and verifies business ID cookie
- **Session Storage**: Stores business switch timestamp for cross-page detection

### 2. CacheBusterWrapper (`CacheBusterWrapper.tsx`)
- **Direct Detection**: Immediately detects when business changes on current page
- **Hard Refresh**: Uses `window.location.reload()` for guaranteed cache clearing
- **Loading States**: Shows loading spinner during refresh

### 3. NavigationInterceptor (`NavigationInterceptor.tsx`)
- **Navigation-Aware**: Detects when user navigates to different pages after business switch
- **Business Change Detection**: Tracks business changes during navigation
- **Immediate Refresh**: Forces hard refresh when business changes during navigation

### 4. useForceRefreshOnBusinessChange Hook (`useForceRefreshOnBusinessChange.ts`)
- **Simple Detection**: Single-purpose hook that forces refresh on business change
- **Multiple Layers**: Added to both dashboard layout and individual page wrappers
- **Redundant Protection**: Ensures no business changes are missed

### 5. BusinessSelectionModal (`BusinessSelectionModal.tsx`)
- **Immediate Refresh**: Forces page refresh right after business switch
- **No Waiting**: Doesn't rely on other components to handle the refresh
- **Direct Approach**: Ensures fresh data is loaded immediately

## Implementation Details

### Business Context Enhancements
```typescript
// Added cache buster state
const [cacheBuster, setCacheBuster] = useState(`?v=${Date.now()}`)

// Enhanced switchBusiness function
const switchBusiness = useCallback(async (businessId: string) => {
  // Set all state updates synchronously
  setCurrentBusiness(business)
  sessionStorage.setItem("currentBusinessId", business.business_id)
  
  // Set cookie immediately and verify it
  setCurrentBusinessIdCookie(business.business_id)
  
  // Update cache buster to force server-side refetch
  setCacheBuster(`?v=${Date.now()}`)
  
  // Store switch timestamp
  sessionStorage.setItem("businessSwitchTime", Date.now().toString())
  
  // Navigate to dashboard
  router.push("/dashboard")
}, [businesses, router])
```

### CacheBusterWrapper
```typescript
useEffect(() => {
  if (pathname.startsWith('/dashboard') && pathname !== '/dashboard/select-business') {
    const currentBusinessId = currentBusiness?.business_id
    
    // Check if business has actually changed
    if (currentBusinessId && lastBusinessId.current && 
        currentBusinessId !== lastBusinessId.current && !hasRefreshed.current) {
      
      console.log('CacheBusterWrapper: Business changed, refreshing page')
      hasRefreshed.current = true
      setIsRefreshing(true)
      
      // Force a hard refresh immediately
      window.location.reload()
    }
    
    // Update the last business ID
    if (currentBusinessId) {
      lastBusinessId.current = currentBusinessId
    }
  }
}, [pathname, currentBusiness])
```

### NavigationInterceptor
```typescript
useEffect(() => {
  if (pathname.startsWith('/dashboard') && pathname !== '/dashboard/select-business') {
    const currentBusinessId = currentBusiness?.business_id
    
    // Check if this is a navigation to a different page
    const isNavigation = lastPathname.current && lastPathname.current !== pathname
    
    // Check if business has changed since last render
    const businessChanged = lastBusinessId.current && currentBusinessId && 
                           lastBusinessId.current !== currentBusinessId
    
    // If navigating to new page and business changed, force refresh
    if (isNavigation && businessChanged) {
      console.log('NavigationInterceptor: Business changed during navigation')
      window.location.reload()
    }
    
    // Update refs
    if (currentBusinessId) {
      lastBusinessId.current = currentBusinessId
    }
    lastPathname.current = pathname
  }
}, [pathname, currentBusiness])
```

### useForceRefreshOnBusinessChange Hook
```typescript
export function useForceRefreshOnBusinessChange() {
  const { currentBusiness } = useBusiness()
  const pathname = usePathname()
  const lastBusinessId = useRef<string | null>(null)
  const hasRefreshed = useRef(false)

  useEffect(() => {
    if (pathname.startsWith('/dashboard') && pathname !== '/dashboard/select-business') {
      const currentBusinessId = currentBusiness?.business_id
      
      // Check if business has changed
      if (currentBusinessId && lastBusinessId.current && 
          currentBusinessId !== lastBusinessId.current && !hasRefreshed.current) {
        
        console.log('useForceRefreshOnBusinessChange: Business changed')
        hasRefreshed.current = true
        window.location.reload()
      }
      
      // Update the last business ID
      if (currentBusinessId) {
        lastBusinessId.current = currentBusinessId
      }
    }
  }, [currentBusiness, pathname])

  // Reset refresh flag when pathname changes
  useEffect(() => {
    hasRefreshed.current = false
  }, [pathname])
}
```

### BusinessSelectionModal Enhancement
```typescript
const handleBusinessSelect = async (businessId: string) => {
  if (selectingBusiness) return
  
  setSelectingBusiness(businessId)
  
  try {
    await switchBusiness(businessId)
    onClose()
    
    // Force a hard refresh to ensure fresh data
    console.log("Forcing page refresh to ensure fresh data")
    window.location.reload()
  } catch (error) {
    console.error("Error switching business:", error)
    setSelectingBusiness(null)
    alert("Failed to switch business. Please try again.")
  }
}
```

## Integration Points

### Dashboard Layout
```typescript
// Multiple layers of protection
<>
  <NavigationInterceptor />
  <div className="...">
    <CacheBusterWrapper>
      {children}
    </CacheBusterWrapper>
  </div>
</>

// Initialize hooks
useBusinessSwitchTracker()
useForceRefreshOnBusinessChange()
```

### Individual Page Wrappers
```typescript
// Add to services, products, etc. wrappers
export default function ServicesWrapper({ services: initialServices }) {
  // Force refresh on business change
  useForceRefreshOnBusinessChange()
  
  // Existing logic...
}
```

## Key Benefits

1. **Guaranteed Fresh Data**: Multiple layers ensure no business change is missed
2. **Immediate Action**: No delays or waiting periods
3. **Simple Logic**: Direct approach with hard refresh strategy
4. **Redundant Protection**: Multiple detection mechanisms
5. **Better UX**: Loading states and visual feedback
6. **Future-Proof**: Works with any new dashboard pages

## Debugging

The solution includes comprehensive logging:

```typescript
console.log('CacheBusterWrapper: Business changed, refreshing page')
console.log(`From: ${lastBusinessId.current} To: ${currentBusinessId}`)
console.log('NavigationInterceptor: Business changed during navigation')
console.log('useForceRefreshOnBusinessChange: Business changed')
console.log("Forcing page refresh to ensure fresh data")
```

## Maintenance

### Adding New Dashboard Pages
1. Add `useForceRefreshOnBusinessChange()` hook to the page wrapper
2. Ensure the page uses server-side data fetching with business ID from cookie
3. The existing layers will automatically handle cache invalidation

### Troubleshooting
1. Check browser console for debug logs
2. Verify business ID cookie is set correctly
3. Ensure all hooks are properly initialized
4. Check that page wrappers include the force refresh hook

## Performance Considerations

- **Hard Refresh**: Uses `window.location.reload()` which is aggressive but guaranteed to work
- **Multiple Hooks**: Redundant detection ensures reliability over performance
- **Minimal Overhead**: Hooks only run when business changes, not on every render
- **User Experience**: Brief loading state during refresh is acceptable for data consistency

## Future Improvements

1. **Selective Refresh**: Could implement more granular cache invalidation for specific data types
2. **Optimistic Updates**: Could show new business data immediately while refreshing in background
3. **Smart Caching**: Could implement business-aware caching strategies
4. **Performance Monitoring**: Could add metrics to track refresh frequency and impact

## Conclusion

This solution provides a robust, multi-layered approach to ensuring fresh data when switching businesses. While it uses aggressive refresh strategies, it guarantees data consistency and provides a reliable user experience. The redundant detection mechanisms ensure that no business change is missed, making it a production-ready solution.
