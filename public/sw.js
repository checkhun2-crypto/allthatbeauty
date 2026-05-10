/* eslint-disable no-restricted-globals */
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', (event) => {
  const d = event.data
  if (d?.type === 'SHOW_NOTIFICATION' && d.title) {
    event.waitUntil(
      self.registration.showNotification(d.title, {
        body: d.body ?? '',
        icon: '/vite.svg',
        badge: '/vite.svg',
      }),
    )
  }
})
