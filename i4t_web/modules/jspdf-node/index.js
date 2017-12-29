var jsPDF = require('jspdf');
var fs = require('fs');

var plugins = ['acroform', 'addhtml', 'addimage', 'annotations', 'autoprint', 'canvas', 'cell', 'context2d', 'from_html',
    'javascript', 'outline', 'png_support', 'prevent_scale_to_fit', 'split_text_to_size', 'standard_fonts_metrics', 'svg',
    'total_pages', 'viewerpreferences', 'xmp_metadata'];

plugins.map(function (plugin) {
    require('./plugins/' + plugin + '.js');
});

jsPDF.API.save = function (filename, callback) {
    fs.writeFile(filename, this.output(), callback);
}

module.exports = jsPDF;