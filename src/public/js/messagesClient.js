// Client-side global message helper
(function (window, document) {
  function showMessage(type, text) {
    var cls = 'alert-info';
    if (type === 'error') cls = 'alert-danger';
    if (type === 'success') cls = 'alert-success';

    var container = document.getElementById('global-messages');
    if (!container) {
      console.warn('global-messages container not found');
      return;
    }

    var div = document.createElement('div');
    div.className = 'alert ' + cls + ' mb-2';
    div.innerHTML = text;
    container.insertBefore(div, container.firstChild);

    setTimeout(function () {
      try {
        div.parentNode && div.parentNode.removeChild(div);
      } catch (e) {}
    }, 8000);
  }

  window.showMessage = showMessage;
})(window, document);
