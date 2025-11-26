# 29 - Offline Support with Service Worker

**Priority:** 🟡 High
**Effort:** High (2-3 weeks)
**Impact:** Medium
**Dependencies:** None

## Problem
No service worker, no offline fallback. App completely unusable without internet connection. No caching of assets or data. Poor experience on unstable connections.

## Requirements
1. Implement service worker with Workbox
2. Cache critical app shell (HTML, CSS, JS)
3. Cache static assets (images, fonts)
4. Implement offline fallback page
5. Show online/offline status indicator
6. Queue failed requests for retry when online
7. Cache user's recent CVs for offline viewing
8. Implement background sync for pending actions
9. Show cached vs live data indicators
10. Provide offline-capable features subset
11. Update cache on app updates
12. Configure appropriate cache strategies per resource type

## Acceptance Criteria
- [ ] Service worker registered and active
- [ ] App shell cached for offline use
- [ ] Offline fallback page functional
- [ ] Online/offline indicator visible
- [ ] Failed requests queued and retried
- [ ] Recent CVs viewable offline
- [ ] Background sync working
- [ ] Cache updates on app version change
- [ ] Graceful degradation in offline mode
- [ ] User testing confirms improved experience

## Technical Considerations
- Use Workbox for service worker management
- Implement appropriate cache strategies (Cache First, Network First, Stale While Revalidate)
- Handle service worker updates carefully
- Test offline scenarios thoroughly
- Consider cache size limits
- Monitor service worker errors

## Files Affected
- `public/sw.js` (service worker)
- `src/lib/offline-queue.ts` (request queue)
- `src/hooks/useOnlineStatus.ts` (online status hook)
- `next.config.ts` (PWA configuration)

## Testing Requirements
- Test complete offline scenarios
- Test connection loss during operations
- Verify cache strategies work correctly
- Test service worker updates
