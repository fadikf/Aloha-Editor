// Generated by CoffeeScript 1.3.3
(function() {

  define(['aloha', 'jquery', 'aloha/plugin', 'image/image-plugin', 'ui/ui', 'semanticblock/semanticblock-plugin', 'css!assorted/css/image.css'], function(Aloha, jQuery, AlohaPlugin, Image, UI, semanticBlock) {
    var DIALOG_HTML, WARNING_IMAGE_PATH, activate, deactivate, setEditText, setThankYou, setWidth, showModalDialog, uploadImage;
    WARNING_IMAGE_PATH = '/../plugins/oer/image/img/warning.png';
    DIALOG_HTML = '<form class="plugin image modal hide fade" id="linkModal" tabindex="-1" role="dialog" aria-labelledby="linkModalLabel" aria-hidden="true" data-backdrop="false">\n  <div class="modal-header">\n    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\n    <h3>Insert image</h3>\n  </div>\n  <div class="modal-body">\n    <div class="image-options">\n        <div class="image-selection">\n          <div class="dia-alternative">\n            <a class="upload-image-link">Choose an image to upload</a>\n          </div>\n          <div class="dia-alternative">\n            OR\n          </div>\n          <div class="dia-alternative">\n            <a class="upload-url-link">get image from the Web</a>\n          </div>\n        </div>\n        <div class="placeholder preview hide">\n          <img class="preview-image"/>\n        </div>\n    </div>\n    <input type="file" class="upload-image-input" />\n    <input type="url" class="upload-url-input" placeholder="Enter URL of image ..."/>\n    <div class="image-alt">\n      <div class="forminfo">\n        <i class="icon-warning"></i><strong>Describe the image for someone who cannot see it.</strong> This description can be read aloud, making it possible for visually impaired learners to understand the content.\n      </div>\n      <div>\n        <textarea name="alt" type="text" placeholder="Enter description ..."></textarea>\n      </div>\n    </div>\n  </div>\n  <div class="modal-footer">\n    <button type="submit" disabled="true" class="btn btn-primary action insert">Save</button>\n    <button class="btn action cancel">Cancel</button>\n  </div>\n</form>';
    showModalDialog = function($el) {
      var $imageselect, $placeholder, $submit, $uploadImage, $uploadUrl, deferred, dialog, editing, imageAltText, imageSource, loadLocalFile, root, setImageSource, settings,
        _this = this;
      settings = Aloha.require('assorted/assorted-plugin').settings;
      root = Aloha.activeEditable.obj;
      dialog = jQuery(DIALOG_HTML);
      $imageselect = dialog.find('.image-selection');
      $placeholder = dialog.find('.placeholder.preview');
      $uploadImage = dialog.find('.upload-image-input').hide();
      $uploadUrl = dialog.find('.upload-url-input').hide();
      $submit = dialog.find('.action.insert');
      imageSource = $el.attr('src');
      imageAltText = $el.attr('alt');
      if (imageSource) {
        dialog.find('.action.insert').removeAttr('disabled');
      }
      editing = Boolean(imageSource);
      dialog.find('[name=alt]').val(imageAltText);
      if (/^https?:\/\//.test(imageSource)) {
        $uploadUrl.val(imageSource);
        $uploadUrl.show();
      }
      if (editing) {
        dialog.find('.image-options').hide();
      }
      (function(img, baseurl) {
        return img.onerror = function() {
          var errimg;
          errimg = baseurl + WARNING_IMAGE_PATH;
          if (img.src !== errimg) {
            return img.src = errimg;
          }
        };
      })(dialog.find('.placeholder.preview img')[0], Aloha.settings.baseUrl);
      setImageSource = function(href) {
        imageSource = href;
        return $submit.removeAttr('disabled');
      };
      loadLocalFile = function(file, $img, callback) {
        var reader;
        reader = new FileReader();
        reader.onloadend = function() {
          if ($img) {
            $img.attr('src', reader.result);
          }
          setImageSource(reader.result);
          if (callback) {
            return callback(reader.result);
          }
        };
        return reader.readAsDataURL(file);
      };
      dialog.find('.upload-image-link').on('click', function(evt) {
        evt.preventDefault();
        $placeholder.hide();
        $uploadUrl.hide();
        $uploadImage.click();
        return $uploadImage.show();
      });
      dialog.find('.upload-url-link').on('click', function(evt) {
        evt.preventDefault();
        $placeholder.hide();
        $uploadImage.hide();
        return $uploadUrl.show().focus();
      });
      $uploadImage.on('change', function() {
        var $previewImg, files;
        files = $uploadImage[0].files;
        if (files.length > 0) {
          if (settings.image.preview) {
            $previewImg = $placeholder.find('img');
            loadLocalFile(files[0], $previewImg);
            $placeholder.show();
            return $imageselect.hide();
          } else {
            return loadLocalFile(files[0]);
          }
        }
      });
      $uploadUrl.on('change', function() {
        var $previewImg, url;
        $previewImg = $placeholder.find('img');
        url = $uploadUrl.val();
        setImageSource(url);
        if (settings.image.preview) {
          $previewImg.attr('src', url);
          $placeholder.show();
          return $imageselect.hide();
        }
      });
      deferred = $.Deferred();
      dialog.on('submit', function(evt) {
        var altAdded;
        evt.preventDefault();
        altAdded = (!$el.attr('alt')) && dialog.find('[name=alt]').val();
        $el.attr('src', imageSource);
        $el.attr('alt', dialog.find('[name=alt]').val());
        if (altAdded) {
          setThankYou($el.parent());
        } else {
          setEditText($el.parent());
        }
        deferred.resolve({
          target: $el[0],
          files: $uploadImage[0].files
        });
        $el.parents('.media').removeClass('aloha-ephemera');
        return dialog.modal('hide');
      });
      dialog.on('click', '.btn.action.cancel', function(evt) {
        evt.preventDefault();
        if (!editing) {
          $el.parents('.semantic-container').remove();
        }
        deferred.reject({
          target: $el[0]
        });
        return dialog.modal('hide');
      });
      dialog.on('hidden', function(event) {
        if (deferred.state() === 'pending') {
          deferred.reject({
            target: $el[0]
          });
        }
        return dialog.remove();
      });
      return jQuery.extend(true, deferred.promise(), {
        show: function(title) {
          if (title) {
            dialog.find('.modal-header h3').text(title);
          }
          return dialog.modal('show');
        }
      });
    };
    uploadImage = function(file, callback) {
      var f, plugin, settings, xhr;
      plugin = this;
      settings = Aloha.require('assorted/assorted-plugin').settings;
      xhr = new XMLHttpRequest();
      if (xhr.upload) {
        if (!settings.image.uploadurl) {
          throw new Error("uploadurl not defined");
        }
        xhr.onload = function() {
          var url;
          if (settings.image.parseresponse) {
            url = parseresponse(xhr);
          } else {
            url = JSON.parse(xhr.response).url;
          }
          return callback(url);
        };
        xhr.open("POST", settings.image.uploadurl, true);
        xhr.setRequestHeader("Cache-Control", "no-cache");
        f = new FormData();
        f.append(settings.image.uploadfield || 'upload', file, file.name);
        return xhr.send(f);
      }
    };
    UI.adopt('insertImage-oer', null, {
      click: function() {
        var newEl, promise, template;
        template = $('<span class="media aloha-ephemera"><img /></span>');
        semanticBlock.insertAtCursor(template);
        newEl = template.find('img');
        promise = showModalDialog(newEl);
        promise.done(function(data) {
          if (data.files.length) {
            newEl.addClass('aloha-image-uploading');
            return uploadImage(data.files[0], function(url) {
              jQuery(data.target).attr('src', url);
              return newEl.removeClass('aloha-image-uploading');
            });
          }
        });
        return promise.show();
      }
    });
    $('body').bind('aloha-image-resize', function() {
      return setWidth(Image.imageObj);
    });
    setWidth = function(image) {
      var wrapper;
      wrapper = image.parents('.image-wrapper');
      if (wrapper.length) {
        return wrapper.css('width', image.css('width'));
      }
    };
    setThankYou = function(wrapper) {
      var editDiv;
      editDiv = wrapper.children('.image-edit');
      editDiv.html('<i class="icon-edit"></i> Thank You!').removeClass('passive');
      editDiv.css('background', 'lightgreen');
      return editDiv.animate({
        backgroundColor: 'white',
        opacity: 0
      }, 2000, 'swing', function() {
        return setEditText(wrapper);
      });
    };
    setEditText = function(wrapper) {
      var alt, editDiv;
      alt = wrapper.children('img').attr('alt');
      editDiv = wrapper.children('.image-edit').css('opacity', 1);
      if (alt) {
        return editDiv.html('<i class="icon-edit"></i>').addClass('passive');
      } else {
        editDiv.html('<i class="icon-warning"></i><span class="warning-text">Description missing</span>').removeClass('passive');
        editDiv.off('mouseenter').on('mouseenter', function(e) {
          return editDiv.find('.warning-text').text('Image is missing a description for the visually impaired. Click to provide one.');
        });
        return editDiv.off('mouseleave').on('mouseleave', function(e) {
          return editDiv.find('.warning-text').text('Description missing');
        });
      }
    };
    activate = function(element) {
      var edit, img, wrapper;
      wrapper = $('<div class="image-wrapper">').css('width', element.css('width'));
      edit = $('<div class="image-edit">');
      img = element.find('img');
      element.children().remove();
      img.appendTo(element).wrap(wrapper);
      setEditText(element.children('.image-wrapper').prepend(edit));
      return element.find('img').load(function() {
        return setWidth($(this));
      });
    };
    deactivate = function(element) {
      var img;
      img = element.find('img');
      element.children().remove();
      element.append(img);
      element.attr('data-alt', img.attr('alt') || '');
      return element.parents('.semantic-container').wrap('<p>');
    };
    return AlohaPlugin.create('oer-image', {
      init: function() {
        semanticBlock.activateHandler('.media', activate);
        semanticBlock.deactivateHandler('.media', deactivate);
        return semanticBlock.registerEvent('click', '.aloha-oer-block .image-edit', function() {
          var img, promise;
          img = $(this).siblings('img');
          promise = showModalDialog(img);
          return promise.show('Edit image');
        });
      }
    });
  });

}).call(this);
