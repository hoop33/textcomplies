/*!
 * TextComplies jQuery Plugin
 *
 * Copyright (c) 2011 Availity, LLC
 * Licensed under the MIT license
 *
 * Author: Robert Corbin, Robbie Rhoden, Rob Warner
 * Version: 1.0
 */
(function($) {
  var methods = {
    init : function(options) {
      var settings = {
        minLength : -1,
        minLengthText : "Must have at least # character%",
        maxLength : -1,
        maxLengthText : "Must have no more than # character%",
        numNumbers : -1,
        numNumbersText : "Must have at least # number%",
        numUppercaseLetters : -1,
        numUppercaseLettersText : "Must have at least # capital letter%",
        numLowercaseLetters : -1,
        numLowercaseLettersText : "Must have at least # lowercase letter%",
        numLetters : -1,
        numLettersText : "Must have at least # letter%",
        disallowed : null,
        disallowedText : "Can't contain @",
        matchField : null,
        matchFieldText : "Text entry matches",
        output : null,
        onComplies : null,
        onDefies : null
      };

      if (options) {
        $.extend(settings, options);
      }
      return this.each(function() {
        /**
         * Get a pointer to the field to check
         */
        var fieldForCompliance = $(this);

        /**
         * Test the text from the specified field for compliance with the configured options
         * @param text
         * @param options
         */
        function complies(text, options) {
          var results = {
            minLength : false,
            maxLength : false,
            numNumbers : false,
            numUppercaseLetters : false,
            numLowercaseLetters : false,
            numLetters : false,
            disallowed : false,
            matchField : false
          };
          results.minLength = options.minLength === -1 || (text.length >= options.minLength);
          results.maxLength = options.maxLength === -1 || (text.length <= options.maxLength);
          results.numNumbers = countComplies(options.numNumbers, text, /[0-9]/g);
          results.numLetters = countComplies(options.numLetters, text, /[a-zA-Z]/g);
          results.numUppercaseLetters = countComplies(options.numUppercaseLetters, text, /[A-Z]/g);
          results.numLowercaseLetters = countComplies(options.numLowercaseLetters, text, /[a-z]/g);
          results.disallowed = containsComplies(options.disallowed, text);
          results.matchField = options.matchField != null && text === $(options.matchField).val();
          return results;
        }

        /**
         * Returns whether all of the properties on an object (but not its inherited properties)
         * are true
         * @param obj
         */
        function allPropertiesTrue(obj) {
          var allTrue = true;
          for (var property in obj) {
            if (obj.hasOwnProperty(property) && !obj[property]) {
              allTrue = false;
              break;
            }
          }
          return allTrue;
        }

        /**
         * Builds an item in the list
         * @param option
         * @param result
         * @param message
         */
        function buildItem(option, result, message) {
          var item = null;
          if (!(option === null || option === -1 || option.length === 0)) {
            item = message.replace("#", option).replace("%", option === 1 ? "" : "s").replace("@", listWords(option));
          }
          return item === null ? '' : wrapItem(item, result);
        }

        function wrapItem(item, complies) {
          return '<li class="' + (complies ? "complies" : "defies") + '">' + item + '</li>';
        }

        /**
         * Returns whether the text has at least the specified number of matches for the regex
         * @param option
         * @param text
         * @param regex
         */
        function countComplies(option, text, regex) {
          var passes = true;
          if (option != -1) {
            var matches = text.match(regex);
            passes = (matches && (matches.length >= option));
          }
          return passes;
        }

        /**
         * Returns whether the specified text contains the characters
         * @param option
         * @param text
         */
        function containsComplies(option, text) {
          var passes = true;
          if (option != null) {
            for (var i = 0, n = option.length; i < n; i++) {
              if (text.indexOf(option[i]) != -1) {
                passes = false;
                break;
              }
            }
          }
          return passes;
        }

        /**
         * Returns an HTML version of a CSV list of the words in the specified array,
         * so that users can see a list of the specified words in a reader-friendly format.
         * A space is converted to the text <space>
         * @param arr
         */
        function listWords(arr) {
          var result = "";
          for (var i = 0, n = arr.length; i < n; i++) {
            result += arr[i];
            if (i < (n - 1)) {
              result += ",";
            }
          }
          result = result.replace(/ /g, "<space>").replace(/,/g, ", ").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          return result;
        }

        /**
         * Creates the compliance check function that runs the complies function and
         * builds the html output
         */
        var performComplianceCheck = function() {
          var results = complies(fieldForCompliance.val(), settings);
          if (settings.output) {
            var html = "<ul>";
            if (settings.minLength > -1 && settings.maxLength > -1) {
              html += buildItem(1, results.minLength && results.maxLength, "Must have " + settings.minLength + " - " + settings.maxLength + " characters");
            } else {
              html += buildItem(settings.minLength, results.minLength, settings.minLengthText);
              html += buildItem(settings.maxLength, results.maxLength, settings.maxLengthText);
            }
            html += buildItem(settings.numNumbers, results.numNumbers, settings.numNumbersText);
            html += buildItem(settings.numLetters, results.numLetters, settings.numLettersText);
            html += buildItem(settings.numUppercaseLetters, results.numUppercaseLetters, settings.numUppercaseLettersText);
            html += buildItem(settings.numLowercaseLetters, results.numLowercaseLetters, settings.numLowercaseLettersText);
            html += buildItem(settings.disallowed, results.disallowed, settings.disallowedText);
            html += buildItem(settings.matchField, results.matchField, settings.matchFieldText);
            html += "</ul>";
            $(settings.output).html(html);
          }
          var allTrue = allPropertiesTrue(results);
          if (allTrue && settings.onComplies != null) {
            settings.onComplies();
          } else if (!allTrue && settings.onDefies != null) {
            settings.onDefies();
          }
        };

        /**
         * Sets up the plugin to run on each keypress
         */
        $(this).bind('keyup.textComplies', performComplianceCheck);

        /**
         * If a matching field was specified, bind keypresses so that the matching
         * compliance is updated as they type in the matching field
         */
        if (options.matchField != null) {
          $(options.matchField).bind('keyup.textComplies', performComplianceCheck);
        }
      });
    },
    destroy : function(options) {
      return this.each(function() {
        $(this).unbind('.textComplies');
        var settings = {
          matchField : null
        };
        if (options) {
          $.extend(settings, options);
        }
        if (settings.matchField != null) {
          $(settings.matchField).unbind('.textComplies');
        }
      });
    }
  };

  $.fn.textComplies = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' +  method + ' does not exist on jQuery.textComplies');
    }
  };
})(jQuery);
