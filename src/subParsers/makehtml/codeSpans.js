/**
 *
 *   *  Backtick quotes are used for <code></code> spans.
 *
 *   *  You can use multiple backticks as the delimiters if you want to
 *     include literal backticks in the code span. So, this input:
 *
 *         Just type ``foo `bar` baz`` at the prompt.
 *
 *       Will translate to:
 *
 *         <p>Just type <code>foo `bar` baz</code> at the prompt.</p>
 *
 *    There's no arbitrary limit to the number of backticks you
 *    can use as delimters. If you need three consecutive backticks
 *    in your code, use four for delimiters, etc.
 *
 *  *  You can use spaces to get literal backticks at the edges:
 *
 *         ... type `` `bar` `` ...
 *
 *       Turns to:
 *
 *         ... type <code>`bar`</code> ...
 */
showdown.subParser('makehtml.codeSpans', function (text, options, globals) {
  'use strict';

  let startEvent = new showdown.helper.Event('makehtml.codeSpans.onStart', text);
  startEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);

  startEvent = globals.converter.dispatch(startEvent);

  text = startEvent.output;

  if (showdown.helper.isUndefined((text))) {
    text = '';
  }

  let pattern = /(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm;

  text = text.replace(pattern,
    function (wholeMatch, m1, m2, c) {
      let otp,
          attributes = {};

      c = c.replace(/^([ \t]*)/g, '');	// leading whitespace
      c = c.replace(/[ \t]*$/g, '');	// trailing whitespace

      let captureStartEvent = new showdown.helper.Event('makehtml.codeSpans.onCapture', c);
      captureStartEvent
        .setOutput(null)
        ._setGlobals(globals)
        ._setOptions(options)
        .setRegexp(pattern)
        .setMatches({
          code: c
        })
        .setAttributes({});
      captureStartEvent = globals.converter.dispatch(captureStartEvent);

      // if something was passed as output, it takes precedence
      // and will be used as output
      if (captureStartEvent.output && captureStartEvent.output !== '') {
        otp = m1 + captureStartEvent.output;
      } else {
        c = captureStartEvent.matches.code;
        c = showdown.subParser('makehtml.encodeCode')(c, options, globals);
        otp = m1 + '<code' + showdown.helper._populateAttributes(attributes) + '>' +  c + '</code>';
      }

      let beforeHashEvent = new showdown.helper.Event('makehtml.codeSpans.onHash', otp);
      beforeHashEvent
        .setOutput(otp)
        ._setGlobals(globals)
        ._setOptions(options);

      beforeHashEvent = globals.converter.dispatch(beforeHashEvent);
      otp = beforeHashEvent.output;
      return showdown.subParser('makehtml.hashHTMLSpans')(otp, options, globals);
    }
  );

  let afterEvent = new showdown.helper.Event('makehtml.codeSpans.onEnd', text);
  afterEvent
    .setOutput(text)
    ._setGlobals(globals)
    ._setOptions(options);

  return afterEvent.output;
});
