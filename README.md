#jquery.iframeAd

This is a plugin to support inserting iframe ads into placeholder dom elements. The plugin will accept a string, generate an iframe, inject that string into the new iframe and based on the options, the iframe size can be set or will auto resize once the content of the iframe is loaded.


##How to use:
    var strAd = '<scr'+'ipt src="http://ad.doubleclick.net/ADJ/publisher/..."></scr'+'ipt>'
    $('.AdPlaceholderClass').iframeAdLoad(strAd);

##TODO
* add css for advertisement label (follows Suit CSS)
* listen/trigger events
* convert this to a more agnostic implementation
* better documentation