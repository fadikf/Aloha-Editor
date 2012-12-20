// Generated by CoffeeScript 1.3.3
(function() {

  define(['aloha', 'aloha/plugin', 'jquery', 'popover', 'ui/ui', 'css!../../../cnx/math/css/math.css'], function(Aloha, Plugin, jQuery, Popover, UI) {
    var EDITOR_HTML, LANGUAGES, MATHML_ANNOTATION_ENCODINGS, SELECTOR, buildEditor, makeCloseIcon, triggerMathJax;
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
    UI.adopt('insertMath', null, {
      click: function() {
        var $el;
        $el = jQuery('<span class="math-element"></span>');
        makeCloseIcon($el);
        GENTICS.Utils.Dom.insertIntoDOM($el, Aloha.Selection.getRangeObject(), Aloha.activeEditable.obj);
        return triggerMathJax($el, function() {
          return $el.trigger('show');
        });
      }
    });
    triggerMathJax = function($el, cb) {
      return MathJax.Hub.Queue(["Typeset", MathJax.Hub, $el[0], cb]);
    };
    buildEditor = function($span) {
      var $annotation, $editor, $formula, $tmp, formula, keyDelay, keyTimeout, lang, mimeType, radios,
        _this = this;
      $editor = jQuery(EDITOR_HTML);
      $editor.find('.done').on('click', function() {
        $span.find('.math-element-destroy').tooltip('destroy');
        $span.trigger('hide');
        if (jQuery.trim($editor.find('.formula').val()).length === 0) {
          return $span.remove();
        }
      });
      $editor.find('.remove').on('click', function() {
        $span.find('.math-element-destroy').tooltip('destroy');
        $span.trigger('hide');
        return $span.remove();
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
            return $annotation.text(formula);
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
          placement: 'bottom'
        });
      }
      return $el.append(closer);
    };
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
          content: 'Click anywhere in math to edit it'
        });
      } else {
        return editable.obj.tooltip({
          selector: '.math-element',
          placement: 'top',
          title: 'Click anywhere in math to edit it',
          trigger: 'hover'
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
