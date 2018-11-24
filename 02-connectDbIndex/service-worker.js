importScripts("https://unpkg.com/dexie@2.0.3/dist/dexie.js");
const CACHE = "cache";
const precache = () => caches.open(CACHE).then(cache => cache.addAll(['/', 'index.html']));
const AWAIT_TIME = 1000;

isOld = function(timestamp) {
  return Date.now() - timestamp > 5*AWAIT_TIME
}

const db = new Dexie("DATABASE");
db.version(1).stores({
  request: "url, timestamp"
});

self.addEventListener("install", (event) => {
  event.waitUntil(precache());
  console.log("Service worker has been installed");
});

const fromNetwork = (req, timeout) =>
  new Promise((fulfill, reject) => {
    // Stop execution if takes more than timeout
    const timeoutId = setTimeout(reject, timeout);
    fetch(req).then(res => {
      // But in case we succeeded - clear timeout
      clearTimeout(timeoutId);
      // Resolve fetched data
      fulfill(res);
    }, reject);
  });


  const fromCache = request => {
  // Open cache storage
  //console.log('In cache ', request)
  return caches.open(CACHE).then(cache =>
    // Check if the request is already present in cache
    cache.match(request).then(
      match =>
        // Return cache or reject promise
        match || Promise.reject("no-match")
    )
  );}

self.addEventListener("fetch",  (event) => {
  event.respondWith(async function() {
    const url = event.request.url;
    const database = db.request
    entry = await database.get(url)
    if(entry) {
      var timestamp = entry.timestamp
    }
    let response
    if(!timestamp || isOld(timestamp)) {
      console.log("Old timestamp or no entry in db: ", url)
      response = await fromNetwork(event.request, AWAIT_TIME)
      caches.open(CACHE).then(cache => cache.add(url));
      await database.put({url : url, timestamp : Date.now()})
    } else {
      //console.log(timestamp, isOld(timestamp))
      console.log("Getting from cache", url)
      response = await fromCache(event.request)
    }
    //console.log(response)
    return response
  }())
});
