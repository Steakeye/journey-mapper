
var dialog = function() {
  var $dialog = $('.dialog'),
    $container = $dialog.find('.dialog__inner'),
    $Contents = $container.find('.dialog__content'),
    contentShowing = '.dialog__content:not([hidden])',
    $doc = $(document),
    $body = $('body'),
    $returnFocus;

  /**
   * Hide dialog and return focus to previously active element.
   */
  function hide() {
    // set showing content "hidden" attr
    setHidden($(contentShowing), true);

    // un-fix body the position so that it can scroll
    $body.removeClass('scroll-off');

    // 'hide' $dialog
    $dialog.addClass('dialog--hidden');

    // return focus to the active element before  was shown
    if ($returnFocus && $returnFocus.length) {
      $returnFocus.focus();
    }
  }

  /**
   * Show dialog, container & content.
   * @param {Event} e - optional event (not passed in init()...
   *                    passed by dom elements which display / close dialog
   *                    using data-dialog-action=[open|close] and data-dialog-target="dialog__content-id"
   */
  function show(e) {
    // get content to be shown - from event if it is passed, or from element with attribute hidden=false
    var $content = !e ? $Contents.filter(function() { return getHidden($(this)); }) : getContentToShow(e);

    if (!!$content && $content.length) {
      // set currently focussed element for return focus on dialog hide
      $returnFocus = $(document.activeElement);

      // fix body position
      $body.addClass('scroll-off');

      // 'show' $dialog
      $dialog.removeClass('dialog--hidden');

      // set $dialog size (with height dimension relative to content height)
      setDimensions($content);

      // shift focus to showing content
      $(contentShowing).focus();
    }
  }

  /**
   * Get the content element to be shown in the dialog
   * @param {Event} e - optional event passed by dom event trigger from element with [data-dialog-action="open | close"] attribute)
   * @returns {HTMLElement}
   */
  function getContentToShow(e) {
    var $content, $target;

    // if event is passed by dom event trigger
    // from element with [data-dialog-action="open | close"] and [data-dialog-target] attributes
    if (e && e.target && $(e.target).data('dialogTarget') && $(e.target).data('dialogAction')) {
      // get element which triggered the event
      $target = $(e.target);

      // get target element to be opened /closed
      $content = $('#' + $target.data('dialogTarget'));

      // if the target element exists
      if ($content.length) {
        // set the target element hidden attribute
        setHidden($content, $target.data('dialogAction') !== 'open');
      }
    }

    // return the target element or undefined
    return $content;
  }

  /**
   * Set the dimensions of the  dialog's inner container to fit the view-port, with scrolling for smaller resolutions.
   * @param {HTMLElement} $element - content element
   */
  function setDimensions($element) {
    // distance from top of view-port (less the top and bottom border)
    var offset = Math.floor($container.offset().top) - ($container.css('border-width').replace('px', '') * 2),

        // iterate  content to calc the max height of required for tallest content
        maxHeight = Math.max.apply(null, $Contents.map(
          function() {
            // content height
            var thisHeight = Math.min.apply(null, [$(this).outerHeight(false), $element.outerHeight(false)]);

            // return the greater of the content or  dialog height
            return thisHeight > $dialog.outerHeight(false) ? $dialog.outerHeight(false) : thisHeight;
          }).get()),

        // if maxHeight is less than the window height less the offset, use maxHeight, else use maxHeight less offset
        containerHeight = maxHeight < $(window).height() - offset ? maxHeight : maxHeight - offset;

    // if calc height is > 0
    if (containerHeight) {
      $container.css({'max-height': containerHeight + 'px'});
    }
  }

  /**
   * Set the dimensions of the  dialog element to fit the view-port
   */
  function setDialogDimensions() {
    // set height and width to mask to fill up the whole document
    $dialog.css({width: $doc.width() + 'px', height: $doc.height() + 'px'});
  }

  /**
   * Window resize event handler to re-calculate the dialog element's dimensions
   * @param {Function} setMaskDimensions - callback function
   */
  $(window).on('resize', function() {
    // stretch opacity mask to fit page
    setDialogDimensions();
  });

  $('[disabled]').on('click', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
  });

  /**
   * Event handler to capture [esc] key press in dialog
   **/
  $dialog.on('keyup', contentShowing, function(e) {
    // escape key press to close dialog
    if ($(contentShowing).length && e.which === 27) {
      // send google analytics event - assume the same value data-journey-click value as the close button
      var $closeButton = $(contentShowing).find('[data-dialog-action="close"]');

      hide();
    }
  });

  /**
   * Event handler to capture tab key press in dialog - needs to be in doc context to capture tab outside dialog.
   */
  $doc.on('keydown', function(e) {
    // if there is showing content in the  dialog and the tab key is pressed
    if ($(contentShowing).length && e.which === 9) {
      e.preventDefault();

      var $src = $(e.target), // the element losing focus by the tab key press
        isBack = e.shiftKey, // is the shift key being held down (is the focus moving to previous or next element in tab order)
        $tabs = $(contentShowing).find('[tabindex="1"]').addBack(), // the elements in the content's tab order
        inc = $tabs.index($src) + (isBack ? -1 : 1), // incremental value to move through the tab order by
        $focus; // element to move focus to

      // if focus has moved out of dialog bring it back
      if (inc < 0) {
        // if increment is negative move back in tab order, move to last element in the tab order
        $focus = $tabs.last();
      }
      else if (inc > $tabs.length - 1) {
        // if increment is greater than the number of elements in the tab order, move to first element in the tab order
        $focus = $tabs.first();
        $container.scrollTop(0);
      }
      else {
        // else use the increment to move to the element in the tab order by index
        $focus = $tabs.eq(inc);
      }

      $focus.focus();
    }
  });

  /**
   * Event handler for document click to return focus to dialog when content showing.
   */
  $doc.on('click', function(e) {
    // if content is showing in the , and doesn't contain the element clicked on
    if ($(contentShowing).length && !$(contentShowing).find($(e.target)).length) {

      // if the shown content contains a element which is in the tab order
      if ($(contentShowing).find('[tabindex="1"]:focus').length) {
        // move the focus to it
        $(contentShowing).find('[tabindex="1"]:focus').focus();
      } else {
        // move the focus to the content element itself
        $(contentShowing).focus();
        e.stopPropagation();
      }
    }
  });

  /**
   * Event handler for hiding dialog & content.
   */
  $body.find($Contents).addBack().on('click', '[data-dialog-action="close"]', function(e) {
    e.preventDefault();
    e.stopPropagation();

    // hide the 
    hide();
  });

  /**
   * Event handler for showing dialog & content.
   */
  $body.find($Contents).addBack().on('click', '[data-dialog-action="open"]', function(e) {
    // stop default event and propagation
    e.preventDefault();
    e.stopPropagation();

    // hide the content showing in the 
    setHidden($(contentShowing), true);

    //show the 
    show(e);
  });

  /**
   * Set the value of the "hidden" attributes
   * @param {HTMLElement} $el
   * @param {boolean} isHidden
   */
  function setHidden($el, isHidden) {
    // if not hidden
    if (!isHidden) {
      // remove the "hidden" attribute
      $el.removeAttr('hidden');
    }
    else {
      // set the "hidden" attribute (as string for IE compat)
      $el.attr('hidden', 'true');
    }

    // set the aria-hidden attribute
    $el.attr('aria-hidden', isHidden);
  }

  /**
   * Get the value of the "hidden" attribute
   * @returns {boolean|string}
   */
  function getHidden($el) {
    return $el.attr('hidden');
  }

  function init(){
    // initialize if the  dialog and  dialog content exist
    if ($dialog.length && $Contents.length) {
      // set the dimensions of the  dialog element
      setDialogDimensions();

      // if there is  content to show (when page loads)
      if ($(contentShowing).length) {
        show();
      }
    }
  }

  return {
    init: init
  };
};
