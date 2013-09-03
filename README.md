# jQuery.scroll-paging #
jQuery plugin for infinite scroll pagination

Version 0.8

*Copyright (c) 2013 Dmitry Serpakov*

*Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)*

## Highlights: ##

* easy to use
* vertical pagination in both sides
* callback provide scrolling direction
* separate callback to visualize pagination block

## Usage ##

Include the js-files into your page:

```
#!javascript

<script src="jquery.js" type="text/javascript"></script>
<script src="jquery.scroll-paging.min.js" type="text/javascript"></script>
```

Define you pagination:


```
#!javascript

var scrollPaging = $(window).scrollPaging(
	$('#content'), // scrolling container
	{ // options
		items: '> li', // content items
		offset: 50, // offset length before loading will be triggered
		startPage: 1, // start page
		currentPage: 1, // current loaded page
		endPage: 10, // total amount of pages
		load: function(p, type) { // loading callback (p: current page, type: before/after)
			// ATTENTION callback needs $.Deferred.promise() as a return value
			return $.get('http://example.com/content', {p: p}, function(html) {
				// up scroll direction - insert before 
				if (type == 'before') {
					$('#content').prepend(html);
				}
				// down scroll direction - insert after 
				if (type == 'after') {
					$('#content').append(html);
				}
			}, 'html');
		},
		paging: function (p) { // paging callback (p: current page)
			// set page to your pagination block
			$('#pager').text(p);
			
			// push page number to history
			pushHistory(document.title, window.location.pathname + '#' + p);
		}
	}
);
```

## Parameters ##

*$.fn.scrollPaging = function(container, options) {...}*

* scrolling container for bind

* options

## Options ##

### items ###
*Type: number*

Offset length before loading will be triggered

### offset ###
*Type: number*

Offset length before loading will be triggered

### startPage ###
*Type: number*

Start page

### currentPage ###
*Type: number*

Current loaded page

### endPage ###
*Type: number*

Total amount of pages

### load ###
*Type: function*

Loading callback.

Parameters:

* **p** - current page

* **type** - insert direction (before/after)

### paging ###
*Type: function*

Paging callback

Parameters:

* **p** - current page

## Methods ##

### destroy() ###

Destroy scrollPaging instance

```
#!javascript

scrollPaging.destroy();
```

### refresh() ###

Refresh scrollPaging instance (binds)

```
#!javascript

scrollPaging.refresh();
```