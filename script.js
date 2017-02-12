var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" [<!ENTITY nbsp "&#160;">]>';

//inspect the CSSStyleSheet
function getCss(element){
	var match, css = "";
  var fontsQueue = [];
	var sheets = document.styleSheets;

    // get css definition
    for (var i = 0; i < sheets.length; i++) {
    	var rules = sheets[i].cssRules;

    	 if (rules !== null) {

        	for (var j = 0, match; j < rules.length; j++, match = null) {
            	var rule = rules[j];
            	var selectorText;
              selectorText = rule.selectorText;
            	match = element.querySelector(selectorText);

            	// check if css class in svg
            	 if (match) {
		              var selector =  rule.selectorText;
		              var cssText  =  rule.style.cssText;
		              css += selector + " { " + cssText + " }\n";
          		} //end if
                else if(rule.cssText.match(/^@font-face/)) {
              // This regex will save extrnal link into first capture group
                  var fontUrlRegexp = /url\(["']?(.+?)["']?\)/;
                  var fontUrlMatch = rule.cssText.match(fontUrlRegexp);

                  var externalFontUrl = (fontUrlMatch && fontUrlMatch[1]) || '';
                  var fontUrlIsDataURI = externalFontUrl.match(/^data:/);
                  if (fontUrlIsDataURI) {
                    externalFontUrl = '';
                  }

                  if (externalFontUrl) {
                    fontsQueue.push({
                      text: rule.cssText,

                      fontUrlRegexp: fontUrlRegexp,
                      format: getFontMimeTypeFromUrl(externalFontUrl),
                      url: externalFontUrl
                    });
                  }
                  else {
                  // otherwise, use previous logic
                  css += rule.cssText + '\n';
                }
              }
              //check what is the width if the media query exist
               else if(rule.cssText.match(/^@media/) && window.matchMedia(rule.media.mediaText).matches) {
                  //current user media query
                  css += rule.cssText + '\n';

              }

            }
	        }

		  }

    return css;
}
//find out which font format the url is using
function getFontMimeTypeFromUrl(fontUrl) {
      var supportedFormats = {
        'woff2': 'font/woff2',
        'woff': 'font/woff',
        'otf': 'application/x-font-opentype',
        'ttf': 'application/x-font-ttf',
        'eot': 'application/vnd.ms-fontobject',
        'sfnt': 'application/font-sfnt',
        'svg': 'image/svg+xml'
      };
      var extensions = Object.keys(supportedFormats);
      for (var i = 0; i < extensions.length; ++i) {
        var extension = extensions[i];
        // TODO: This is not bullet proof, it needs to handle edge cases...
        if (fontUrl.indexOf('.' + extension) > 0) {
          return supportedFormats[extension];
        }
      }
}

//encode/decode doctype+svg
function reEncode(data) {
    data = encodeURIComponent(data);
    data = data.replace(/%([0-9A-F]{2})/g, function(match, p1) {
      var c = String.fromCharCode('0x'+p1);
      return c === '%' ? '%25' : c;
    });
    return decodeURIComponent(data);
}

// click event handler for download button
$('#download').on('click', function() {

	// clone svg for exporting
	var ts = document.querySelector("#tshirtsvg");
	var outer = document.createElement("div");
  var clone = ts.cloneNode(true);


	// handle external css
	var dCss = getCss(ts);
 	var s = document.createElement('style');
    s.setAttribute('type', 'text/css');
    s.innerHTML = "<![CDATA[\n" + dCss + "\n]]>";
    var defs = document.createElement('defs');
    defs.appendChild(s);
    clone.insertBefore(defs, clone.firstChild);


    // get uri for image
  var svg = clone.outerHTML;
 	var uri = 'data:image/svg+xml;base64,' + window.btoa(reEncode(doctype + svg));   //btoa -encodes a string in base-64.

	var image = new Image();

	// will invoke after image src set
    image.onload = function() {

      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      canvas.width = 550;
      canvas.height = 550;

      context.drawImage(image, 0, 0);

	  //convert to png
      var png = canvas.toDataURL('image/png', 0.8);

      // download png
      var a = document.createElement("a");
  	  a.download = "tShirt.png";
  	  a.href = png;
  	  a.click();

    };

	// set image uri
	image.src = uri;


});