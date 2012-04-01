javascript:(function() {
    var url, version, doc, head, script;
    url = 'http://localhost/dailycloud/app/bookmarklet/';
    version = '1.0';
    doc = window.document;

    try {
        script = doc.createElement('scr' + 'ipt');
        script.setAttribute('src', url + 'snap.js?v=' + version);
        head = doc.getElementsByTagName('head')[0];
        head.appendChild(script);
    } catch(e) {
        alert('Please wait until the page has been loaded.');
    }
})();
