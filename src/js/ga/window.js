// Assign GAjs as window property
var pkg = window.GAjs = GAjs;

// Copy all properties onto namespace (ES3 safe for loop)
for (var key in GAjs) {
    if (GAjs.hasOwnProperty(key)) {
        pkg[key] = GAjs[key];
    }
}
