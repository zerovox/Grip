//This gives us access to the variable primitives, the array of primitive functions
importScripts('/js/data/primitives.js')


function log(data){
    self.postMessage({log:data});
}

self.onmessage = function(event) {
    log(event.data.editor)
}

