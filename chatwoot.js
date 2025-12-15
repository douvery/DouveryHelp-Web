// chatwoot.js
(function () {
  window.chatwootSettings = {
    position: "right",
    type: "expanded_bubble",
    launcherTitle: "Chatea con nosotros",
  };

  var BASE_URL = "https://app.chatwoot.com";
  var g = document.createElement("script");
  var s = document.getElementsByTagName("script")[0];

  g.src = BASE_URL + "/packs/js/sdk.js";
  g.async = true;

  s.parentNode.insertBefore(g, s);

  g.onload = function () {
    window.chatwootSDK.run({
      websiteToken: "ztSuqatJP8fsEeqMKSBNhEi6",
      baseUrl: BASE_URL,
    });
  };
})();
