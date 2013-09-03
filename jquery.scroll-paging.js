/**
 * jQuery.scroll-paging - jQuery plugin for infinite scroll pagination
 * Version: 0.8
 * https://github.com/divampo/jQuery.scroll-paging
 * https://bitbucket.org/divampo/jquery.scroll-paging/wiki/Home
 *
 * Copyright (c) 2013 Dmitry Serpakov
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
 *
 * Date: September 3rd, 2013
 */
;(function( $ ) {
	// constructor
	$.scrollPaging = function(elem, container, opts) {
		this.$o = $(elem),
		this.$container = $(container),
		this.options = $.extend(true, $.scrollPaging.defaults, opts),
		this.last_scroll_position = null,
		this.cache_page = null;

		this.options.offset = parseInt(this.options.offset);

		this._init();
	};

	// public destroy scrollPaging instance
	$.scrollPaging.prototype.destroy = function () {
		var th = this;
		$(window).off('scroll', this.$o, function() {
			th._action();
		});
		$(window).unbind('load', function() {
			if (this.options.currentPage > this.options.startPage) {
				this._loadPrev();
			}
		});
		for (var i in this.options.class) {
			this.$container.find(this.options.items).removeClass(this.options.class[i]);
		}
		$.removeData(this.$container.find(this.options.items), 'page');
	}

	// public refresh scrollPaging instance
	$.scrollPaging.prototype.refresh = function () {
		this.destroy();
		this._init();
	}

	// default values
	$.scrollPaging.defaults = {
		items: '> li',
		offset: 50,
		startPage: 1,
		currentPage: 1,
		endPage: 1,
		load: function (p, type) {
			return $.Deferred(function (deferred) {
				deferred.resolve(p, type);
			}).promise();
		},
		paging: function (p) {
			console.log(p);
		},
		class: {
			first: 'first-scroll-item',
			last : 'last-scroll-item',
			page : 'page-scroll-item'
		}
	};

	// private initialization + bind
	$.scrollPaging.prototype._init = function () {
		if (this.options.startPage == this.options.endPage) { // only one page
			return false;
		} else if (this.options.startPage == this.options.currentPage) { // first page
			this.$container.find(this.options.items).first().addClass(this.options.class.first);
		}  else if (this.options.currentPage >= this.options.endPage) { // last page
			this.$container.find(this.options.items).last().addClass(this.options.class.last);
		}
		this.$container.find(this.options.items).first().addClass(this.options.class.page).data('page', this.options.currentPage).attr('data-page', this.options.currentPage);
		this.$container.find(this.options.items).last().addClass(this.options.class.page).data('page', this.options.currentPage + 1).attr('data-page', this.options.currentPage + 1);

		var th = this;
		$(window).on('scroll', this.$o, function() {
			th._action();
		});

		// load previous content
		$(window).bind('load', function() {
			if (this.options.currentPage > this.options.startPage) {
				this._loadPrev();
			}
		});
	};

	// private scroll process action
	$.scrollPaging.prototype._action = function () {
		var th = this,
			direction = this._getDirection(),
			$last = this.$container.find(this.options.items).last(),
			$first = this.$container.find(this.options.items).first(),
			current_pages = [];

		// try to load next page
		if (
			direction == 1 // scroll down
				&& !$last.is('.' + this.options.class.last) // is not last item
				&& $last.position().top + $last.outerHeight() - this.options.offset <= $(window).scrollTop() + $(window).height()  // step over bottom threshold
				&& $last.data('loading') != 1 // is not loading
			) {
			this._loadNext();
		}
		// try to load prev page
		if (
			direction == -1 // scroll up
				&& !$first.is('.' + this.options.class.first) // is not first item
				&& $first.position().top + this.options.offset > $(window).scrollTop()  // step over upper threshold
				&& $first.data('loading') != 1 // is not loading
			) {
			this._loadPrev();
		}

		// select which pages are visible depending on scroll direction
		this.$container.find(this.options.items).filter('.' + this.options.class.page).each(function (n, item) {
			var $item = $(item);
			if (
				direction == 1 // scroll down
					&& !$item.is('.' + th.options.class.last) // is not last item
					&& $item.position().top + $item.outerHeight() <= $(window).scrollTop() + $(window).height() // full item is visible from bottom
				) {
				current_pages.push(parseInt($item.data('page')));
			}

			if (
				direction == -1 // scroll up
					&& !$item.is('.' + th.options.class.first) // is not first item
					&& $item.position().top >= $(window).scrollTop() // full item is visible from top
				) {
				current_pages.push(parseInt($item.data('page')) - 1); // minus 1 because we ALREADY PASS current page
			}
		});

		// fire paging() with page number depending on scroll direction
		var p = null;
		if (current_pages.length > 0) {
			if (direction == 1) {
				p = Math.max.apply(null, current_pages);
			}
			if (direction == -1) {
				p = Math.min.apply(null, current_pages);
			}

			if (p != this.cache_page) {
				this.options.paging(p);
				this.cache_page = p;
			}
		}
	};

	// private load next page (insert after)
	$.scrollPaging.prototype._loadNext = function() {
		var th = this,
			$last = this.$container.find(this.options.items).last();

		$last.data('loading', 1);
		this.options.load($last.data('page'), 'after')
			.done(function() {
				if ($last.data('page') >= th.options.endPage) { // last page
					th.$container.find(th.options.items).last().addClass(th.options.class.last);
				}
				th.$container.find(th.options.items).last()
					.addClass(th.options.class.page)
					.data('page', $last.data('page') + 1).attr('data-page', $last.data('page') + 1);
				$last.data('loading', 0);
			})
			.fail(function () { // fallback method to finish loading if nothing was added
				th.$container.find(th.options.items).last()
					.addClass(th.options.class.last)
					.addClass(th.options.class.page)
					.data('page', $last.data('page') + 1).attr('data-page', $last.data('page') + 1);

				th.options.endPage = $last.data('page');
				$last.data('loading', 0);
			});
	}

	// private load previous page (insert before)
	$.scrollPaging.prototype._loadPrev = function() {
		var th = this,
			$first = this.$container.find(this.options.items).first();

		$first.data('loading', 1);
		var cache_block_height = this.$container.outerHeight();
		this.options.load($first.data('page') - 1, 'before')
			.done(function() {
				if ($first.data('page') - 1 <= th.options.startPage) { // last page
					th.$container.find(th.options.items).first().addClass(th.options.class.first);
				}
				th.$container.find(th.options.items).first()
					.addClass(th.options.class.page)
					.data('page', $first.data('page') - 1).attr('data-page', $first.data('page') - 1);

				// fix scrolling to last user position
				$(window).scrollTop($(window).scrollTop() + (th.$container.outerHeight() - cache_block_height));
				$first.data('loading', 0);
			})
			.fail(function () { // fallback method to finish loading if nothing was added
				th.$container.find(th.options.items).first()
					.addClass(th.options.class.first)
					.addClass(th.options.class.page)
					.data('page', $first.data('page') - 1).attr('data-page', $first.data('page') - 1);

				th.options.startPage = $first.data('page');
				$first.data('loading', 0);
			});
	};

	// private get scroll direction
	$.scrollPaging.prototype._getDirection = function () {
		var d = 0;
		if (this.last_scroll_position != undefined) {
			d = this.last_scroll_position > this.$o.scrollTop() ? -1 : 1;
		}
		this.last_scroll_position = this.$o.scrollTop();
		return d;
	};

	// construct
	$.fn.scrollPaging = function(container, opts) {
		return new $.scrollPaging(this, container, opts);
	}
}( jQuery ));