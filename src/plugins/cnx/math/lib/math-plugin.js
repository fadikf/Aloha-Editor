// Generated by CoffeeScript 1.3.3
(function() {

  define(['aloha', 'aloha/plugin', 'jquery', 'popover', 'ui/ui', 'css!../../../cnx/math/css/math.css'], function(Aloha, Plugin, jQuery, Popover, UI) {
    var Bootstrap_Tooltip_hide, EDITOR_HTML, LANGUAGES, MATHML_ANNOTATION_ENCODINGS, SELECTOR, TOOLTIP_TEMPLATE, buildEditor, cleanupFormula, insertMath, makeCloseIcon, monkeyPatch, triggerMathJax;
    EDITOR_HTML = '<div class="math-editor-dialog">\n    <div class="math-container">\n        <pre><span></span><br></pre>\n        <textarea type="text" class="formula" rows="1"\n                  placeholder="Insert your math notation here"></textarea>\n    </div>\n    <span>This is:</span>\n    <label class="radio inline">\n        <input type="radio" name="mime-type" value="math/asciimath"> ASCIIMath\n    </label>\n    <label class="radio inline">\n        <input type="radio" name="mime-type" value="math/tex"> LaTeX\n    </label>\n    <label class="radio inline mime-type-mathml">\n        <input type="radio" name="mime-type" value="math/mml"> MathML\n    </label>\n    <div class="footer">\n        <button class="btn btn-primary done">Done</button>\n    </div>\n</div>';
    LANGUAGES = {
      'math/asciimath': {
        open: '`',
        close: '`'
      },
      'math/tex': {
        open: '[TEX_START]',
        close: '[TEX_END]'
      },
      'math/mml': {
        raw: true
      }
    };
    MATHML_ANNOTATION_ENCODINGS = {
      'TeX': 'math/tex',
      'ASCIIMath': 'math/asciimath'
    };
    TOOLTIP_TEMPLATE = '<div class="aloha-ephemera tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>';
    Bootstrap_Tooltip_hide = function(originalHide) {
      return function() {
        var r;
        this.$element.trigger('hide-tooltip');
        r = originalHide.bind(this)();
        this.$element.trigger('hidden-tooltip');
        return r;
      };
    };
    monkeyPatch = function() {
      var proto;
      if (!(jQuery.ui && jQuery.ui.tooltip)) {
        console && console.warn('Monkey patching Bootstrap tooltips to generate events');
        proto = jQuery.fn.tooltip.Constructor.prototype;
        return proto.hide = Bootstrap_Tooltip_hide(proto.hide);
      }
    };
    monkeyPatch();
    insertMath = function() {
      var $el, $tail, range;
      $el = jQuery('<span class="math-element"></span>');
      range = Aloha.Selection.getRangeObject();
      if (range.isCollapsed()) {
        GENTICS.Utils.Dom.insertIntoDOM($el, range, Aloha.activeEditable.obj);
        return triggerMathJax($el, function() {
          $el.trigger('show');
          return makeCloseIcon($el);
        });
      } else {
        $tail = jQuery('<span class="aloha-ephemera math-trailer" />');
        $el.text('`' + range.getText() + '`');
        GENTICS.Utils.Dom.removeRange(range);
        GENTICS.Utils.Dom.insertIntoDOM($el.add($tail), range, Aloha.activeEditable.obj);
        return triggerMathJax($el, function() {
          var r, sel;
          makeCloseIcon($el);
          sel = window.getSelection();
          r = sel.getRangeAt(0);
          r.selectNodeContents($tail.parent().get(0));
          r.setEndAfter($tail.get(0));
          r.setStartAfter($tail.get(0));
          sel.removeAllRanges();
          sel.addRange(r);
          r = new GENTICS.Utils.RangeObject();
          r.update();
          return Aloha.Selection.rangeObject = r;
        });
      }
    };
    UI.adopt('insertMath', null, {
      click: function() {
        return insertMath();
      }
    });
    triggerMathJax = function($el, cb) {
      return MathJax.Hub.Queue(["Typeset", MathJax.Hub, $el[0], cb]);
    };
    cleanupFormula = function($editor, $span, destroy) {
      if (destroy == null) {
        destroy = false;
      }
      $span.trigger('hide');
      if (destroy || jQuery.trim($editor.find('.formula').val()).length === 0) {
        $span.find('.math-element-destroy').tooltip('destroy');
        return $span.remove();
      }
    };
    buildEditor = function($span) {
      var $annotation, $editor, $formula, $tmp, formula, keyDelay, keyTimeout, lang, mimeType, radios,
        _this = this;
      $editor = jQuery(EDITOR_HTML);
      $editor.find('.done').on('click', function() {
        return cleanupFormula($editor, $span);
      });
      $editor.find('.remove').on('click', function() {
        return cleanupFormula($editor, $span, true);
      });
      $formula = $editor.find('.formula');
      mimeType = $span.find('script[type]').attr('type') || 'math/asciimath';
      mimeType = mimeType.split(';')[0];
      formula = $span.find('script[type]').html();
      if (mimeType === 'math/mml') {
        $tmp = jQuery('<div></div>').html($span.find('script[type]').text());
        $annotation = $tmp.find('annotation');
        lang = $annotation.attr('encoding');
        if (MATHML_ANNOTATION_ENCODINGS[lang]) {
          mimeType = MATHML_ANNOTATION_ENCODINGS[lang];
          formula = $annotation.text();
        }
      }
      $editor.find("input[name=mime-type][value='" + mimeType + "']").attr('checked', true);
      $formula.val(formula);
      $editor.find('.math-container pre span').text(formula);
      if (mimeType !== 'math/mml') {
        $editor.find("label.mime-type-mathml").remove();
      }
      keyTimeout = null;
      keyDelay = function() {
        var formulaWrapped;
        formula = jQuery(this).val();
        mimeType = $editor.find('input[name=mime-type]:checked').val();
        if (LANGUAGES[mimeType].raw) {
          $span[0].innerHTML = formula;
        } else {
          formulaWrapped = LANGUAGES[mimeType].open + formula + LANGUAGES[mimeType].close;
          $span.text(formulaWrapped);
        }
        triggerMathJax($span, function() {
          var $math;
          $math = $span.find('math');
          if ($math[0]) {
            $annotation = $math.find('annotation');
            if (!($annotation[0] != null)) {
              $annotation = jQuery('<annotation></annotation>').prependTo($math);
            }
            $annotation.attr('encoding', mimeType);
            $annotation.text(formula);
            return makeCloseIcon($span);
          }
        });
        $span.data('math-formula', formula);
        return $formula.trigger('focus');
      };
      $formula.on('input', function() {
        clearTimeout(keyTimeout);
        setTimeout(keyDelay.bind(this), 500);
        return $editor.find('.math-container pre span').text($editor.find('.formula').val());
      });
      radios = $editor.find('input[name=mime-type]');
      radios.on('click', function() {
        radios.attr('checked', false);
        jQuery(this).attr('checked', true);
        clearTimeout(keyTimeout);
        return setTimeout(keyDelay.bind($formula), 500);
      });
      return $editor;
    };
    makeCloseIcon = function($el) {
      var closer;
      closer = jQuery('<a class="math-element-destroy aloha-ephemera" title="Delete math">&nbsp;</a>');
      if (jQuery.ui && jQuery.ui.tooltip) {
        closer.tooltip();
      } else {
        closer.tooltip({
          placement: 'bottom',
          template: TOOLTIP_TEMPLATE
        });
      }
      return $el.append(closer);
    };
    Aloha.bind('aloha-editable-created', function(e, editable) {
      return editable.obj.bind('keydown', 'ctrl+m', function(evt) {
        insertMath();
        return evt.preventDefault();
      });
    });
    Aloha.bind('aloha-editable-activated', function(event, data) {
      var editable;
      editable = data.editable;
      jQuery(editable.obj).on('click.matheditor', '.math-element, .math-element *', function(evt) {
        var $el, range;
        $el = jQuery(this);
        if (!$el.is('.math-element')) {
          $el = $el.parents('.math-element');
        }
        $el.contentEditable(false);
        range = new GENTICS.Utils.RangeObject();
        range.startContainer = range.endContainer = $el[0];
        range.startOffset = range.endOffset = 0;
        Aloha.Selection.rangeObject = range;
        Aloha.trigger('aloha-selection-changed', range);
        return evt.stopPropagation();
      });
      editable.obj.find('.math-element').each(function() {
        return makeCloseIcon(jQuery(this));
      });
      editable.obj.on('click.matheditor', '.math-element-destroy', function(e) {
        var $el;
        jQuery(e.target).tooltip('destroy');
        $el = jQuery(e.target).closest('.math-element');
        $el.trigger('hide').tooltip('destroy').remove();
        return e.preventDefault();
      });
      if (jQuery.ui && jQuery.ui.tooltip) {
        return editable.obj.tooltip({
          items: ".math-element",
          content: 'Click anywhere in math to edit it',
          template: TOOLTIP_TEMPLATE
        });
      } else {
        return editable.obj.tooltip({
          selector: '.math-element',
          placement: 'top',
          title: 'Click anywhere in math to edit it',
          trigger: 'hover',
          template: TOOLTIP_TEMPLATE
        });
      }
    });
    SELECTOR = '.math-element';
    return Popover.register({
      selector: SELECTOR,
      populator: buildEditor,
      placement: 'top',
      markerclass: 'math-popover',
      focus: function($popover) {
        return setTimeout(function() {
          return $popover.find('.formula').trigger('focus');
        }, 10);
      }
    });
  });

}).call(this);
