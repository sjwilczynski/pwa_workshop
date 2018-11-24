if (navigator && navigator.serviceWorker) {
  navigator.serviceWorker
    .register("service-worker.js", {
      scope: "."
    })
    .then(registration => {
      console.log("Service worker has been registered ", registration);
    })
    .catch(error => {
      console.log("Error during registering service worker", error);
    });
}
