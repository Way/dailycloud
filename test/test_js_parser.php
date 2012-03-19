<?php
/**
 * TEST
 *
 * Request functionality
 */

// Enable autoloading, provide server settings and functions
require_once ('../server/autoload.php');

// Load test environment
$test = new Test(__FILE__);

//
// START TEST
//
?>

<style>
	.bold {
		font-weight: bold;
	}
</style>

<ul id="tests">
	<li>
		Squash WITH michi,me AT City Squash ON monday AT 21:00
	</li>
	<li>
		Lunch with John at 123 Main Street on Tuesday # lunch
	</li>
	<li>
		Test @ me # test, awesome ON 24.12.1987
	</li>
	<li>
		Full Date Test on today + 2 at local with me at 12 #complete, test
	</li>
	<li>
		Test w/ me
	</li>
	<li>
		test with me
	</li>
</ul>

<input type="text" id="input" style="width: 600px;" />
<button id="parse">
	Parse
</button>

<table id="result">
</table>

<script src="http://code.jquery.com/jquery-latest.js"></script>
<script>
	(function() {
		// Sort an array by the arrays keys
		function sortAssocArray(arr) {
			// Setup Arrays
			var sortedKeys = [];
			var sorted = [];

			// use index 1 to sort by value instead of key
			var index = 0;

			// Separate keys and sort them
			for (var i in arr) {
				sortedKeys.push(arr[i][index]);
			}
			sortedKeys.sort( function(a,b) {
				return a - b;
			});
			// Reconstruct sorted obj based on keys
			for (var i in sortedKeys) {
				for (var j in arr) {
					if (arr[j][index] === sortedKeys[i]) {
						sorted.push(arr[j]);
						break;
					}
				}
			}
			return sorted;
		}

		function parse(value, magicKeys) {
			// Before we start parsing trim the value, make it to lower case and reduce whitespaces
			value = $.trim(value.toLowerCase().replace(/\s+/g, ' '));
			var title = value;

			// Generate an array out of the magic keys
			var magicKeyArray = [];
			for (var key in magicKeys) {
				var m = magicKeys[key];
				for (var k in m.keys) {
					k = m.keys[k];
					if ($.inArray(k, magicKeyArray) < 0) {
						magicKeyArray.push(k);
					}
				}
			}

			// Find and store all matched magic keywords with their position in the parsed value
			var matchedKeys = [];
			for (var key in magicKeyArray) {
				var k = magicKeyArray[key];
				var regex = new RegExp('\\b[\w\\s]*(' + k + ')[\w\\s]*\\b', 'ig');

				var match, matches = [];
				while ((match = regex.exec(value)) !== null && matches.length < 100) {
					matches.push(match);
				}

				if (matches && matches.length > 0) {
					for (var i in matches) {
						match = matches[i];
						if (match && match.length > 1) {
							// raise index by 1 when the match starts with a whitespace
							var index = match.index;
							if (match[0].substring(0, 1) === ' ') {
								index++;
							}
							matchedKeys.push([index, match[1]]);
						}
					}
				}
			}

			// New empty date
			var data = {
				date: null,
				time: null,
				title: null,
				value: value,
				location: null,
				mates: null,
				tags: null
			};

			var sorted = sortAssocArray(matchedKeys);
			var adjustedValue = value;

			// Parse the found magic keywords with their values and fill the new dates values with that
			for (var i = 0, len = sorted.length; i < len; i++) {
				var m = sorted.shift();
				var index = m[0];
				var key = m[1];

				// start at the index of the matched keyword
				var start = index + key.length;

				// end at the index of the next matched keyword or if there is no next keyword at the end of the value
				var end = sorted.length > 0 ? sorted[0][0] : value.length;

				// Slice keyword matches token out of the value
				var val = $.trim(value.slice(start, end));

				// Run throuh all magic keys and set their potential matched keywords and their content to the new date
				$.each(magicKeys, function(id, mkey) {
					if ($.inArray(key, mkey.keys) > -1) {
						var match = mkey.regex.exec(val);
						if (match && !data[id]) {
							// set date value
							data[id] = val;

							// adjust title by removing matched magic keywords and their content
							val = val.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
							val = val.replace('+', '\\+');
							adjustedValue = $.trim(adjustedValue.replace(new RegExp(key + '[\\s]*' + val, 'i'), ''));
						}
					}
				});
			}

			// set title datat when all magic keys and their data were parsed
			data.title = adjustedValue;

			return data;
		}

		var magicKeys = {
			'mates': {
				keys: ['with', 'w/', 'by', '@'],
				// Alpha-numeric and some special characters separated by a comma and optional whitespace
				regex: /^[a-zA-Z0-9-_\.]+([, ]+[a-zA-Z0-9-_\.]+)*$/
			},
			'location': {
				keys: ['at', 'in'],
				// Alpha-numeric characters with spaces only
				regex: /^[a-zA-Z0-9 ]+$/
			},
			'time': {
				keys: ['at'],
				// digit and numeric values between 0 and 23 and time values from [0]0:00 to 23:59
				regex: /^([0-23]|[0-1][0-9]|[2][0-3])(:([0-5][0-9]){1,2})?$/
			},
			'date': {
				keys: ['on'],
				// Aplha-numeric and some special character including whitespace
				regex: /^[a-zA-Z0-9-+_\. ]+$/
			},
			'tags': {
				keys: ['#'],
				// Alpha-numeric and some special characters separated by a comma and optional whitespace
				regex: /^[a-zA-Z0-9-_\.]+([, ]+[a-zA-Z0-9-_\.]+)*$/
			},
		};

		$( function() {
			var input = $('#input')
			.bind('keydown', function() {
				$(this).data('value', $(this).val());
			})
			.bind('keyup', function() {
				if ($(this).val() == $(this).data('value')) {
					// Do nothing if the value didn't changed
					return;
				}

				var data = parse($(this).val(), magicKeys);

				// Create and fill result fields with their key and value pairs
				var result = $('#result').html('');
				$.each(data, function(key, val) {
					if (magicKeys[key]) {
						key = key + ' (' + magicKeys[key].keys.join(',') + ')';
					}
					result.append($('<tr>').append('<td>' + key + '</td>').append('<td class="bold">' + (val || '') + '</td>'));
				});
			}).focus();
			$('#tests').find('li').click( function() {
				input.val($.trim($(this).text())).trigger('keyup');
			});
			$('#parse').click( function() {
				input.trigger('keyup');
			});
		});
	})();
</script>