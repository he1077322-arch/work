const CACHE_NAME = 'furas3amal-cache-v1';
const urlsToCache = [
    '/dashboard.html',
    '/style.css',
    '/script.js',
    '/app-icon.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// تثبيت العامل الخدمي وتخزين الملفات الأساسية
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// اعتراض الطلبات وخدمتها من الذاكرة المؤقتة أولاً
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // العودة بالرد المخزن مؤقتاً إذا وُجد
                if (response) {
                    return response;
                }
                // وإلا، تابع طلب الشبكة العادي
                return fetch(event.request);
            }
        )
    );
});