var pfx = ["webkit", "moz", "ms", "o", ""];

function runPrefixMethod(obj, method) {
    var p = 0, m, t;
    while (p < pfx.length && !obj[m]) {
        m = method;
        if (pfx[p] == "") {
            m = m.substr(0, 1).toLowerCase() + m.substr(1);
        }
        m = pfx[p] + m;
        t = typeof obj[m];
        if (t != "undefined") {
            pfx = [pfx[p]];
            return (t == "function" ? obj[m]() : obj[m]);
        }
        p++;
    }
}

function fullscreen() {
    if (runPrefixMethod(document, "FullScreen") || runPrefixMethod(document, "IsFullScreen")) {
        this.editorMap.cancelFullScreen()
        runPrefixMethod(document, "CancelFullScreen");
        this.editorMap.render()
    }
    else {
        this.editorMap.fullScreen()
        runPrefixMethod(this.editorMap.el.parentElement, "RequestFullScreen");
        this.editorMap.render()
    }
}