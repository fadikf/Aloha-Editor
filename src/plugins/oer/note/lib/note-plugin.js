// Generated by CoffeeScript 1.6.3
(function() {
  define(['aloha', 'aloha/plugin', 'jquery', 'aloha/ephemera', 'ui/ui', 'ui/button', 'semanticblock/semanticblock-plugin', 'css!note/css/note-plugin.css'], function(Aloha, Plugin, jQuery, Ephemera, UI, Button, semanticBlock) {
    var TYPE_CONTAINER, notishClasses, types;
    TYPE_CONTAINER = jQuery('<span class="type-container dropdown aloha-ephemera">\n    <a class="type" href="#" data-toggle="dropdown"></a>\n    <ul class="dropdown-menu">\n    </ul>\n</span>');
    notishClasses = {};
    types = [];
    return Plugin.create('note', {
      defaults: [
        {
          label: 'Note',
          cls: 'note',
          hasTitle: true
        }
      ],
      getLabel: function($element) {
        var type, _i, _len;
        for (_i = 0, _len = types.length; _i < _len; _i++) {
          type = types[_i];
          if ($element.is(type.selector)) {
            return type.label;
          }
        }
      },
      activate: function($element) {
        var _this = this;
        return jQuery.each(types, function(i, type) {
          var $body, $title, typeContainer;
          if ($element.is(type.selector)) {
            $title = $element.children('.title');
            $title.attr('hover-placeholder', 'Add a title (optional)');
            $title.aloha();
            $body = $element.contents().not($title);
            typeContainer = TYPE_CONTAINER.clone();
            if (types.length > 1) {
              jQuery.each(types, function(i, dropType) {
                var $option;
                $option = jQuery('<li><a href="#"></a></li>');
                $option.appendTo(typeContainer.find('.dropdown-menu'));
                $option = $option.children('a');
                $option.text(dropType.label);
                typeContainer.find('.type').on('click', function() {
                  return jQuery.each(types, function(i, dropType) {
                    if ($element.attr('data-type') === dropType.type) {
                      return typeContainer.find('.dropdown-menu li').each(function(i, li) {
                        jQuery(li).removeClass('checked');
                        if (jQuery(li).children('a').text() === dropType.label) {
                          return jQuery(li).addClass('checked');
                        }
                      });
                    }
                  });
                });
                return $option.on('click', function(e) {
                  var $newTitle, key;
                  e.preventDefault();
                  if (dropType.hasTitle) {
                    if (!$element.children('.title')[0]) {
                      $newTitle = jQuery("<" + (dropType.titleTagName || 'span') + " class='title'></" + (dropType.titleTagName || 'span'));
                      $element.append($newTitle);
                      $newTitle.aloha();
                    }
                  } else {
                    $element.children('.title').remove();
                  }
                  if (dropType.type) {
                    $element.attr('data-type', dropType.type);
                  } else {
                    $element.removeAttr('data-type');
                  }
                  typeContainer.find('.type').text(dropType.label);
                  for (key in notishClasses) {
                    $element.removeClass(key);
                  }
                  return $element.addClass(dropType.cls);
                });
              });
            } else {
              typeContainer.find('.dropdown-menu').remove();
              typeContainer.find('.type').removeAttr('data-toggle');
            }
            typeContainer.find('.type').text(type.label);
            typeContainer.prependTo($element);
            return $body = $('<div>').addClass('body').addClass('aloha-block-dropzone').attr('placeholder', "Type the text of your " + (type.label.toLowerCase()) + " here.").appendTo($element).aloha().append($body);
          }
        });
      },
      deactivate: function($element) {
        var $body, hasTextChildren,
          _this = this;
        $body = $element.children('.body');
        hasTextChildren = $body.children().length !== $body.contents().length;
        $body = $body.contents();
        if (hasTextChildren) {
          $body = $body.wrap('<p></p>').parent();
        }
        $element.children('.body').remove();
        jQuery.each(types, function(i, type) {
          var $title, $titleElement;
          if ($element.is(type.selector) && type.hasTitle) {
            $titleElement = $element.children('.title');
            $title = jQuery("<" + (type.titleTagName || 'span') + " class=\"title\"></" + type.titleTagName + ">");
            if ($titleElement.length) {
              $title.append($titleElement.contents());
              $titleElement.remove();
            }
            return $title.prependTo($element);
          }
        });
        return $element.append($body);
      },
      selector: '',
      init: function() {
        var _this = this;
        types = this.settings;
        jQuery.each(types, function(i, type) {
          var className, hasTitle, label, newTemplate, tagName, titleTagName, typeName;
          className = type.cls || (function() {
            throw 'BUG Invalid configuration of note plugin. cls required!';
          })();
          typeName = type.type;
          hasTitle = !!type.hasTitle;
          label = type.label || (function() {
            throw 'BUG Invalid configuration of note plugin. label required!';
          })();
          tagName = type.tagName || 'div';
          titleTagName = type.titleTagName || 'div';
          if (typeName) {
            type.selector = "." + className + "[data-type='" + typeName + "']";
          } else {
            type.selector = "." + className + ":not([data-type])";
          }
          if (_this.selector.length) {
            _this.selector += "," + type.selector;
          } else {
            _this.selector = type.selector;
          }
          notishClasses[className] = true;
          newTemplate = jQuery("<" + tagName + "></" + tagName);
          newTemplate.addClass(className);
          if (typeName) {
            newTemplate.attr('data-type', typeName);
          }
          if (hasTitle) {
            newTemplate.append("<" + titleTagName + " class='title'></" + titleTagName);
          }
          UI.adopt("insert-" + className + typeName, Button, {
            click: function() {
              return semanticBlock.insertAtCursor(newTemplate.clone());
            }
          });
          if ('note' === className && !typeName) {
            return UI.adopt("insertNote", Button, {
              click: function() {
                return semanticBlock.insertAtCursor(newTemplate.clone());
              }
            });
          }
        });
        return semanticBlock.register(this);
      }
    });
  });

}).call(this);
