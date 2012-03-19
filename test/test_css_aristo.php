<?php
/**
* TEST
*
* Request functionality
*/

// Enable autoloading, provide server settings and functions
require_once ('../server/autoload.php');

// Start session
Session::init();

// Load test environment
$test = new Test(__FILE__);

//
// START TEST
//

?>

<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8" />
		<title>jQuery UI Aristo Theme Demo Page</title>
		<!--<link type="text/css" href="css/Aristo/jquery-ui-1.8.7.custom.css" rel="stylesheet" />-->
		<link type="text/css" href="../server/ui/css.php" rel="stylesheet" />
		<script src="http://code.jquery.com/jquery-1.6.1.min.js"></script>
		<script src="http://code.jquery.com/ui/1.8.13/jquery-ui.min.js"></script>
		<script>
			$( function() {

				// Autocomplete
				var countryList = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burma", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Greenland", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Mongolia", "Morocco", "Monaco", "Mozambique", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Samoa", "San Marino", " Sao Tome", "Saudi Arabia", "Senegal", "Serbia and Montenegro", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];
				$("#countries").autocomplete({
					source: countryList
				});

				// Accordion
				$(".accordion").accordion({
					header: "h3"
				});

				// Tabs
				$('#tabs').tabs();

				// Dialog
				$('#dialog').dialog({
					autoOpen: false,
					width: 600,
					buttons: {
						"Ok": function() {
							$(this).dialog("close");
						},
						"Cancel": function() {
							$(this).dialog("close");
						}
					},
					modal: true
				});

				// Dialog Link
				$('#dialog_link').button().click( function() {
					$('#dialog').dialog('open');
					return false;
				});
				// Datepicker
				$('#datepicker').datepicker().children().show();

				// Horizontal Slider
				$('#horizSlider').slider({
					range: true,
					values: [17, 67]
				}).width(500);

				// Vertical Slider
				$("#eq > span").each( function() {
					var value = parseInt($(this).text());
					$(this).empty().slider({
						value: value,
						range: "min",
						animate: true,
						orientation: "vertical"
					});
				});
				//hover states on the static widgets
				$('#dialog_link, ul#icons li').hover( function() {
					$(this).addClass('ui-state-hover');
				}, function() {
					$(this).removeClass('ui-state-hover');
				}
				);

				// Button
				$("#divButton, #linkButton, #submitButton, #inputButton").button();

				// Icon Buttons
				$("#leftIconButton").button({
					icons: {
						primary: 'ui-icon-wrench'
					}
				});

				$("#bothIconButton").button({
					icons: {
						primary: 'ui-icon-wrench',
						secondary: 'ui-icon-triangle-1-s'
					}
				});

				// Button Set
				$("#radio1").buttonset();

				// Progressbar
				$("#progressbar").progressbar({
					value: 37
				}).width(500);
				$("#animateProgress").click( function(event) {
					var randNum = Math.random() * 90;
					$("#progressbar div").animate({
						width: randNum+"%"
					} );
					event.preventDefault();
				});
				// Combinations
				$('#tabs2').tabs();
				$("#accordion2").accordion({
					header: "h4"
				});
				$("#buttonInModal").button({
					icons: {
						primary: 'ui-icon-wrench'
					}
				});

				// Nested button tests
				$("#nestedButtonTest_1, #nestedButtonTest_2, #buttonInModal").button().click( function(e) {
					e.preventDefault();
				});
			});
		</script>
		<style type="text/css">
			/*demo page css*/
			body {
				font: 62.5% Cambria, Georgia, serif;
				margin: 50px;
			}
			.demoHeaders {
				margin-top: 2em;
			}
			ul#icons {
				margin: 0;
				padding: 0;
			}
			ul#icons li {
				margin: 2px;
				position: relative;
				padding: 4px 0;
				cursor: pointer;
				float: left;
				list-style: none;
			}
			ul#icons span.ui-icon {
				float: left;
				margin: 0 4px;
			}
			.columnbox {
				width: 500px;
			}
			#eq span {
				height: 120px;
				float: left;
				margin: 15px;
			}
			#countries {
				width: 300px;
			}
		</style>
	</head>
	<body class="ui-form">

		<h1>"Aristo" for jQuery UI!</h1>
		<p style="font-size: 1.3em; line-height: 1.5; margin: 1em 0; width: 50%;">
			This page demonstrates all available components of the jQuery UI port of "Aristo". jQuery and jQuery UI are pulled from the Google CDN. More information can be found at the original
			<a href="http://taitems.tumblr.com/post/482577430/introducing-aristo-a-jquery-ui-theme" target="_blank">blog post</a>.
		</p>

		<!-- Autocomplete -->
		<h2 class="demoHeaders">Autocomplete</h2>
		<div class="ui-widget">
			<label for="countries">
				Countries:
			</label>
			<input id="countries">
		</div>

		<!-- Button -->
		<h2 class="demoHeaders">UI Button</h2>
		<div id="divButton">
			&lt;DIV&gt; Button
		</div>
		<a id="linkButton" href="#">&lt;A href="#"&gt; Button</a>
		<input type="button" id="inputButton" value="Input Button" />
		<input type="submit" id="submitButton" value="Submit Button" />

		<!-- Icon Buttons -->
		<h2 class="demoHeaders">Icon Buttons</h2>
		<div id="leftIconButton">
			Left Icon
		</div>
		<br />
		<br />
		<div id="bothIconButton">
			Left & Right Icons
		</div>

		<!-- Button Set -->
		<h2 class="demoHeaders">Button Toggle</h2>
		<div id="radio1">
			<input type="radio" id="radio1" name="radio" />
			<label for="radio1">
				Choice 1
			</label>
			<input type="radio" id="radio2" name="radio" checked="checked" />
			<label for="radio2">
				Choice 2
			</label>
			<input type="radio" id="radio3" name="radio" />
			<label for="radio3">
				Choice 3
			</label>
		</div>

		<!-- Horizontal Slider -->
		<h2 class="demoHeaders">Horizontal Slider</h2>
		<div id="horizSlider">
		</div>

		<!-- Vertical Slider -->
		<h2 class="demoHeaders">Vertical Slider</h2>
		<div class="columnbox">
			<div id="eq">
				<span>88</span>
				<span>77</span>
				<span>55</span>
				<span>33</span>
				<span>40</span>
				<span>45</span>
				<span>70</span>
			</div>
		</div>
		<br clear="all" />

		<!-- Highlight / Error -->
		<h2 class="demoHeaders">Highlight / Error</h2>
		<div class="ui-widget">
			<div class="ui-state-highlight ui-corner-all" style="margin-top: 20px; padding: 0 .7em;">
				<p>
					<span class="ui-icon ui-icon-info" style="float: left; margin-right: .7em;"></span>
					<strong>Did you know:</strong> Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.
				</p>
			</div>
		</div>
		<br/>
		<div class="ui-widget">
			<div class="ui-state-error ui-corner-all" style="padding: 0 .7em;">
				<p>
					<span class="ui-icon ui-icon-alert" style="float: left; margin-right: .7em;"></span>
					<strong>Error:</strong> Needs more cowbell.
				</p>
			</div>
		</div>

		<!-- Accordion -->
		<h2 class="demoHeaders">Accordion</h2>
		<div class="columnbox">

			<div class="accordion">

				<h3>
				<a href="#">Section 1</a>
				</h3>
				<div>
					<p>
						Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer
						ut neque. Vivamus nisi metus, molestie vel, gravida in, condimentum sit
						amet, nunc. Nam a nibh. Donec suscipit eros. Nam mi. Proin viverra leo ut
						odio. Curabitur malesuada. Vestibulum a velit eu ante scelerisque vulputate.
					</p>
				</div>
				<h3>
				<a href="#">Section 2</a>
				</h3>
				<div>
					<p>
						Sed non urna. Donec et ante. Phasellus eu ligula. Vestibulum sit amet
						purus. Vivamus hendrerit, dolor at aliquet laoreet, mauris turpis porttitor
						velit, faucibus interdum tellus libero ac justo. Vivamus non quam. In
						suscipit faucibus urna.
					</p>
				</div>
				<h3>
				<a href="#">Section 3</a>
				</h3>
				<div>
					<p>
						Nam enim risus, molestie et, porta ac, aliquam ac, risus. Quisque lobortis.
						Phasellus pellentesque purus in massa. Aenean in pede. Phasellus ac libero
						ac tellus pellentesque semper. Sed ac felis. Sed commodo, magna quis
						lacinia ornare, quam ante aliquam nisi, eu iaculis leo purus venenatis dui.
					</p>
					<ul>
						<li>
							List item one
						</li>
						<li>
							List item two
						</li>
						<li>
							List item three
						</li>
					</ul>
				</div>
				<h3>
				<a href="#">Section 4</a>
				</h3>
				<div>
					<p>
						Cras dictum. Pellentesque habitant morbi tristique senectus et netus
						et malesuada fames ac turpis egestas. Vestibulum ante ipsum primis in
						faucibus orci luctus et ultrices posuere cubilia Curae; Aenean lacinia
						mauris vel est.
					</p>
					<p>
						Suspendisse eu nisl. Nullam ut libero. Integer dignissim consequat lectus.
						Class aptent taciti sociosqu ad litora torquent per conubia nostra, per
						inceptos himenaeos.
					</p>
				</div>

			</div>

		</div>

		<!-- Tabs -->
		<h2 class="demoHeaders">Tabs</h2>
		<div id="tabs">
			<ul>
				<li>
					<a href="#tabs-1">First</a>
				</li>
				<li>
					<a href="#tabs-2">Second</a>
				</li>
				<li>
					<a href="#tabs-3">Third</a>
				</li>
			</ul>
			<div id="tabs-1">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse eget diam nec urna hendrerit tempus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum aliquam ligula non nulla cursus volutpat. Aliquam malesuada felis nec turpis auctor interdum. Cras et lobortis dolor. Nam sodales, dolor eu cursus faucibus, justo leo vestibulum turpis, id malesuada erat ipsum et leo. Integer id aliquam augue. Proin quis risus magna. Vivamus eget accumsan mauris. Vivamus justo ligula, blandit et consequat nec, vulputate a elit. Morbi feugiat metus in ante scelerisque a pulvinar quam condimentum. Suspendisse potenti. Pellentesque convallis scelerisque nunc eget dapibus. Pellentesque ut enim justo. Fusce egestas urna sed nulla placerat iaculis. Cras dignissim tincidunt molestie. Suspendisse rutrum dignissim tortor quis mollis. Sed tempor feugiat ligula in imperdiet. Quisque molestie viverra erat in adipiscing.
			</div>
			<div id="tabs-2">
				Donec porta malesuada massa, at fermentum nunc tincidunt ac. Integer nisi ligula, sodales bibendum interdum id, sodales sit amet orci. In rhoncus libero in purus vestibulum consequat. Aenean vel purus molestie leo pharetra sagittis. In hac habitasse platea dictumst. Quisque bibendum, metus a egestas convallis, est orci dapibus odio, vel pretium ante erat quis ipsum. Praesent at est in odio rhoncus cursus in sollicitudin velit. Aenean auctor molestie hendrerit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec volutpat nisl eget nisi consequat pretium. Nullam dui purus, commodo a vestibulum nec, semper varius nulla.
			</div>
			<div id="tabs-3">
				Mauris tempor urna non quam tincidunt aliquam. Proin venenatis metus eu purus interdum a vehicula ipsum sollicitudin. Mauris sed dignissim odio. Nam id odio sed diam dapibus dignissim. Nulla vestibulum nisl ac magna scelerisque adipiscing. Nam pellentesque sapien vulputate nisi scelerisque ut vehicula orci luctus. Sed rhoncus tempor metus vitae egestas. Proin pharetra tristique justo ac rutrum. Vestibulum ac pharetra dolor. Cras nibh arcu, bibendum eget luctus id, rhoncus nec augue. Integer ornare rhoncus nulla, eu aliquam mi ornare ullamcorper. Praesent egestas auctor orci, non rhoncus sapien eleifend at. Quisque eget purus sem, ut dignissim ligula. Etiam sollicitudin dui libero, id ullamcorper metus.
			</div>
		</div>

		<!-- Dialog NOTE: Dialog is not generated by UI in this demo so it can be visually styled in themeroller-->
		<h2 class="demoHeaders">Modal Dialog</h2>
		<div id="dialog_link">
			Open Modal Dialog
		</div>

		<!-- ui-dialog -->
		<div id="dialog" title="Dialog Title">
			<p>
				Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<a href="#" id="buttonInModal" class="uibutton">Change</a>
		</div>

		<!-- Datepicker -->
		<h2 class="demoHeaders">Datepicker</h2>
		<div id="datepicker">
		</div>

		<!-- Progress Bar -->
		<h2 class="demoHeaders">Progress Bar</h2>
		<div id="progressbar">
		</div>
		<br />
		<a id="animateProgress" href="#">Animate to random number</a>

		<h2 class="demoHeaders">Framework Icons</h2>
		<span>Incredibly low priority, these may eventually get replaced entirely with Fugue icons.</span>
		<br />
		<br />
		<ul id="icons" class="ui-widget ui-helper-clearfix">

			<li class="ui-state-default ui-corner-all" title=".ui-icon-carat-1-n">
				<span class="ui-icon ui-icon-carat-1-n"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-carat-1-ne">
				<span class="ui-icon ui-icon-carat-1-ne"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-carat-1-e">
				<span class="ui-icon ui-icon-carat-1-e"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-carat-1-se">
				<span class="ui-icon ui-icon-carat-1-se"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-carat-1-s">
				<span class="ui-icon ui-icon-carat-1-s"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-carat-1-sw">
				<span class="ui-icon ui-icon-carat-1-sw"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-carat-1-w">
				<span class="ui-icon ui-icon-carat-1-w"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-carat-1-nw">
				<span class="ui-icon ui-icon-carat-1-nw"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-carat-2-n-s">
				<span class="ui-icon ui-icon-carat-2-n-s"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-carat-2-e-w">
				<span class="ui-icon ui-icon-carat-2-e-w"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-triangle-1-n">
				<span class="ui-icon ui-icon-triangle-1-n"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-triangle-1-ne">
				<span class="ui-icon ui-icon-triangle-1-ne"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-triangle-1-e">
				<span class="ui-icon ui-icon-triangle-1-e"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-triangle-1-se">
				<span class="ui-icon ui-icon-triangle-1-se"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-triangle-1-s">
				<span class="ui-icon ui-icon-triangle-1-s"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-triangle-1-sw">
				<span class="ui-icon ui-icon-triangle-1-sw"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-triangle-1-w">
				<span class="ui-icon ui-icon-triangle-1-w"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-triangle-1-nw">
				<span class="ui-icon ui-icon-triangle-1-nw"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-triangle-2-n-s">
				<span class="ui-icon ui-icon-triangle-2-n-s"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-triangle-2-e-w">
				<span class="ui-icon ui-icon-triangle-2-e-w"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrow-1-n">
				<span class="ui-icon ui-icon-arrow-1-n"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrow-1-ne">
				<span class="ui-icon ui-icon-arrow-1-ne"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrow-1-e">
				<span class="ui-icon ui-icon-arrow-1-e"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrow-1-se">
				<span class="ui-icon ui-icon-arrow-1-se"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrow-1-s">
				<span class="ui-icon ui-icon-arrow-1-s"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrow-1-sw">
				<span class="ui-icon ui-icon-arrow-1-sw"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrow-1-w">
				<span class="ui-icon ui-icon-arrow-1-w"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrow-1-nw">
				<span class="ui-icon ui-icon-arrow-1-nw"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrow-2-n-s">
				<span class="ui-icon ui-icon-arrow-2-n-s"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrow-2-ne-sw">
				<span class="ui-icon ui-icon-arrow-2-ne-sw"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrow-2-e-w">
				<span class="ui-icon ui-icon-arrow-2-e-w"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrow-2-se-nw">
				<span class="ui-icon ui-icon-arrow-2-se-nw"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowstop-1-n">
				<span class="ui-icon ui-icon-arrowstop-1-n"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowstop-1-e">
				<span class="ui-icon ui-icon-arrowstop-1-e"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowstop-1-s">
				<span class="ui-icon ui-icon-arrowstop-1-s"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowstop-1-w">
				<span class="ui-icon ui-icon-arrowstop-1-w"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowthick-1-n">
				<span class="ui-icon ui-icon-arrowthick-1-n"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowthick-1-ne">
				<span class="ui-icon ui-icon-arrowthick-1-ne"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowthick-1-e">
				<span class="ui-icon ui-icon-arrowthick-1-e"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowthick-1-se">
				<span class="ui-icon ui-icon-arrowthick-1-se"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowthick-1-s">
				<span class="ui-icon ui-icon-arrowthick-1-s"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowthick-1-sw">
				<span class="ui-icon ui-icon-arrowthick-1-sw"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowthick-1-w">
				<span class="ui-icon ui-icon-arrowthick-1-w"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowthick-1-nw">
				<span class="ui-icon ui-icon-arrowthick-1-nw"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowthick-2-n-s">
				<span class="ui-icon ui-icon-arrowthick-2-n-s"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowthick-2-ne-sw">
				<span class="ui-icon ui-icon-arrowthick-2-ne-sw"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowthick-2-e-w">
				<span class="ui-icon ui-icon-arrowthick-2-e-w"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowthick-2-se-nw">
				<span class="ui-icon ui-icon-arrowthick-2-se-nw"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowthickstop-1-n">
				<span class="ui-icon ui-icon-arrowthickstop-1-n"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowthickstop-1-e">
				<span class="ui-icon ui-icon-arrowthickstop-1-e"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowthickstop-1-s">
				<span class="ui-icon ui-icon-arrowthickstop-1-s"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowthickstop-1-w">
				<span class="ui-icon ui-icon-arrowthickstop-1-w"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowreturnthick-1-w">
				<span class="ui-icon ui-icon-arrowreturnthick-1-w"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowreturnthick-1-n">
				<span class="ui-icon ui-icon-arrowreturnthick-1-n"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowreturnthick-1-e">
				<span class="ui-icon ui-icon-arrowreturnthick-1-e"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowreturnthick-1-s">
				<span class="ui-icon ui-icon-arrowreturnthick-1-s"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowreturn-1-w">
				<span class="ui-icon ui-icon-arrowreturn-1-w"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowreturn-1-n">
				<span class="ui-icon ui-icon-arrowreturn-1-n"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowreturn-1-e">
				<span class="ui-icon ui-icon-arrowreturn-1-e"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowreturn-1-s">
				<span class="ui-icon ui-icon-arrowreturn-1-s"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowrefresh-1-w">
				<span class="ui-icon ui-icon-arrowrefresh-1-w"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowrefresh-1-n">
				<span class="ui-icon ui-icon-arrowrefresh-1-n"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowrefresh-1-e">
				<span class="ui-icon ui-icon-arrowrefresh-1-e"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrowrefresh-1-s">
				<span class="ui-icon ui-icon-arrowrefresh-1-s"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrow-4">
				<span class="ui-icon ui-icon-arrow-4"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-arrow-4-diag">
				<span class="ui-icon ui-icon-arrow-4-diag"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-extlink">
				<span class="ui-icon ui-icon-extlink"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-newwin">
				<span class="ui-icon ui-icon-newwin"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-refresh">
				<span class="ui-icon ui-icon-refresh"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-shuffle">
				<span class="ui-icon ui-icon-shuffle"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-transfer-e-w">
				<span class="ui-icon ui-icon-transfer-e-w"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-transferthick-e-w">
				<span class="ui-icon ui-icon-transferthick-e-w"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-folder-collapsed">
				<span class="ui-icon ui-icon-folder-collapsed"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-folder-open">
				<span class="ui-icon ui-icon-folder-open"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-document">
				<span class="ui-icon ui-icon-document"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-document-b">
				<span class="ui-icon ui-icon-document-b"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-note">
				<span class="ui-icon ui-icon-note"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-mail-closed">
				<span class="ui-icon ui-icon-mail-closed"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-mail-open">
				<span class="ui-icon ui-icon-mail-open"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-suitcase">
				<span class="ui-icon ui-icon-suitcase"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-comment">
				<span class="ui-icon ui-icon-comment"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-person">
				<span class="ui-icon ui-icon-person"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-print">
				<span class="ui-icon ui-icon-print"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-trash">
				<span class="ui-icon ui-icon-trash"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-locked">
				<span class="ui-icon ui-icon-locked"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-unlocked">
				<span class="ui-icon ui-icon-unlocked"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-bookmark">
				<span class="ui-icon ui-icon-bookmark"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-tag">
				<span class="ui-icon ui-icon-tag"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-home">
				<span class="ui-icon ui-icon-home"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-flag">
				<span class="ui-icon ui-icon-flag"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-calculator">
				<span class="ui-icon ui-icon-calculator"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-cart">
				<span class="ui-icon ui-icon-cart"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-pencil">
				<span class="ui-icon ui-icon-pencil"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-clock">
				<span class="ui-icon ui-icon-clock"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-disk">
				<span class="ui-icon ui-icon-disk"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-calendar">
				<span class="ui-icon ui-icon-calendar"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-zoomin">
				<span class="ui-icon ui-icon-zoomin"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-zoomout">
				<span class="ui-icon ui-icon-zoomout"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-search">
				<span class="ui-icon ui-icon-search"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-wrench">
				<span class="ui-icon ui-icon-wrench"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-gear">
				<span class="ui-icon ui-icon-gear"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-heart">
				<span class="ui-icon ui-icon-heart"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-star">
				<span class="ui-icon ui-icon-star"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-link">
				<span class="ui-icon ui-icon-link"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-cancel">
				<span class="ui-icon ui-icon-cancel"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-plus">
				<span class="ui-icon ui-icon-plus"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-plusthick">
				<span class="ui-icon ui-icon-plusthick"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-minus">
				<span class="ui-icon ui-icon-minus"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-minusthick">
				<span class="ui-icon ui-icon-minusthick"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-close">
				<span class="ui-icon ui-icon-close"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-closethick">
				<span class="ui-icon ui-icon-closethick"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-key">
				<span class="ui-icon ui-icon-key"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-lightbulb">
				<span class="ui-icon ui-icon-lightbulb"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-scissors">
				<span class="ui-icon ui-icon-scissors"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-clipboard">
				<span class="ui-icon ui-icon-clipboard"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-copy">
				<span class="ui-icon ui-icon-copy"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-contact">
				<span class="ui-icon ui-icon-contact"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-image">
				<span class="ui-icon ui-icon-image"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-video">
				<span class="ui-icon ui-icon-video"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-script">
				<span class="ui-icon ui-icon-script"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-alert">
				<span class="ui-icon ui-icon-alert"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-info">
				<span class="ui-icon ui-icon-info"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-notice">
				<span class="ui-icon ui-icon-notice"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-help">
				<span class="ui-icon ui-icon-help"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-check">
				<span class="ui-icon ui-icon-check"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-bullet">
				<span class="ui-icon ui-icon-bullet"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-radio-off">
				<span class="ui-icon ui-icon-radio-off"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-radio-on">
				<span class="ui-icon ui-icon-radio-on"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-pin-w">
				<span class="ui-icon ui-icon-pin-w"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-pin-s">
				<span class="ui-icon ui-icon-pin-s"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-play">
				<span class="ui-icon ui-icon-play"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-pause">
				<span class="ui-icon ui-icon-pause"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-seek-next">
				<span class="ui-icon ui-icon-seek-next"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-seek-prev">
				<span class="ui-icon ui-icon-seek-prev"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-seek-end">
				<span class="ui-icon ui-icon-seek-end"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-seek-first">
				<span class="ui-icon ui-icon-seek-first"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-stop">
				<span class="ui-icon ui-icon-stop"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-eject">
				<span class="ui-icon ui-icon-eject"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-volume-off">
				<span class="ui-icon ui-icon-volume-off"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-volume-on">
				<span class="ui-icon ui-icon-volume-on"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-power">
				<span class="ui-icon ui-icon-power"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-signal-diag">
				<span class="ui-icon ui-icon-signal-diag"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-signal">
				<span class="ui-icon ui-icon-signal"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-battery-0">
				<span class="ui-icon ui-icon-battery-0"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-battery-1">
				<span class="ui-icon ui-icon-battery-1"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-battery-2">
				<span class="ui-icon ui-icon-battery-2"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-battery-3">
				<span class="ui-icon ui-icon-battery-3"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-circle-plus">
				<span class="ui-icon ui-icon-circle-plus"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-circle-minus">
				<span class="ui-icon ui-icon-circle-minus"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-circle-close">
				<span class="ui-icon ui-icon-circle-close"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-circle-triangle-e">
				<span class="ui-icon ui-icon-circle-triangle-e"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-circle-triangle-s">
				<span class="ui-icon ui-icon-circle-triangle-s"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-circle-triangle-w">
				<span class="ui-icon ui-icon-circle-triangle-w"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-circle-triangle-n">
				<span class="ui-icon ui-icon-circle-triangle-n"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-circle-arrow-e">
				<span class="ui-icon ui-icon-circle-arrow-e"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-circle-arrow-s">
				<span class="ui-icon ui-icon-circle-arrow-s"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-circle-arrow-w">
				<span class="ui-icon ui-icon-circle-arrow-w"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-circle-arrow-n">
				<span class="ui-icon ui-icon-circle-arrow-n"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-circle-zoomin">
				<span class="ui-icon ui-icon-circle-zoomin"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-circle-zoomout">
				<span class="ui-icon ui-icon-circle-zoomout"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-circle-check">
				<span class="ui-icon ui-icon-circle-check"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-circlesmall-plus">
				<span class="ui-icon ui-icon-circlesmall-plus"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-circlesmall-minus">
				<span class="ui-icon ui-icon-circlesmall-minus"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-circlesmall-close">
				<span class="ui-icon ui-icon-circlesmall-close"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-squaresmall-plus">
				<span class="ui-icon ui-icon-squaresmall-plus"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-squaresmall-minus">
				<span class="ui-icon ui-icon-squaresmall-minus"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-squaresmall-close">
				<span class="ui-icon ui-icon-squaresmall-close"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-grip-dotted-vertical">
				<span class="ui-icon ui-icon-grip-dotted-vertical"></span>
			</li>

			<li class="ui-state-default ui-corner-all" title=".ui-icon-grip-dotted-horizontal">
				<span class="ui-icon ui-icon-grip-dotted-horizontal"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-grip-solid-vertical">
				<span class="ui-icon ui-icon-grip-solid-vertical"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-grip-solid-horizontal">
				<span class="ui-icon ui-icon-grip-solid-horizontal"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-gripsmall-diagonal-se">
				<span class="ui-icon ui-icon-gripsmall-diagonal-se"></span>
			</li>
			<li class="ui-state-default ui-corner-all" title=".ui-icon-grip-diagonal-se">
				<span class="ui-icon ui-icon-grip-diagonal-se"></span>
			</li>
		</ul>

		</div>

		<h2 class="demoHeaders">
		Overlay and Shadow Classes
		<em>(not currently used in UI widgets)</em>
		</h2>
		<div style="position: relative; width: 70%; height: 200px; padding:1% 4%; overflow:hidden;" class="fakewindowcontain">
			<p>
				Lorem ipsum dolor sit amet,  Nulla nec tortor. Donec id elit quis purus consectetur consequat.
			</p>
			<p>
				Nam congue semper tellus. Sed erat dolor, dapibus sit amet, venenatis ornare, ultrices ut, nisi. Aliquam ante. Suspendisse scelerisque dui nec velit. Duis augue augue, gravida euismod, vulputate ac, facilisis id, sem. Morbi in orci.
			</p>
			<p>
				Nulla purus lacus, pulvinar vel, malesuada ac, mattis nec, quam. Nam molestie scelerisque quam. Nullam feugiat cursus lacus.orem ipsum dolor sit amet, consectetur adipiscing elit. Donec libero risus, commodo vitae, pharetra mollis, posuere eu, pede. Nulla nec tortor. Donec id elit quis purus consectetur consequat.
			</p>
			<p>
				Nam congue semper tellus. Sed erat dolor, dapibus sit amet, venenatis ornare, ultrices ut, nisi. Aliquam ante. Suspendisse scelerisque dui nec velit. Duis augue augue, gravida euismod, vulputate ac, facilisis id, sem. Morbi in orci. Nulla purus lacus, pulvinar vel, malesuada ac, mattis nec, quam. Nam molestie scelerisque quam.
			</p>
			<p>
				Nullam feugiat cursus lacus.orem ipsum dolor sit amet, consectetur adipiscing elit. Donec libero risus, commodo vitae, pharetra mollis, posuere eu, pede. Nulla nec tortor. Donec id elit quis purus consectetur consequat. Nam congue semper tellus. Sed erat dolor, dapibus sit amet, venenatis ornare, ultrices ut, nisi. Aliquam ante.
			</p>
			<p>
				Suspendisse scelerisque dui nec velit. Duis augue augue, gravida euismod, vulputate ac, facilisis id, sem. Morbi in orci. Nulla purus lacus, pulvinar vel, malesuada ac, mattis nec, quam. Nam molestie scelerisque quam. Nullam feugiat cursus lacus.orem ipsum dolor sit amet, consectetur adipiscing elit. Donec libero risus, commodo vitae, pharetra mollis, posuere eu, pede. Nulla nec tortor. Donec id elit quis purus consectetur consequat. Nam congue semper tellus. Sed erat dolor, dapibus sit amet, venenatis ornare, ultrices ut, nisi.
			</p>

			<!-- ui-dialog -->
			<div class="ui-overlay">
				<div class="ui-widget-overlay">
				</div>
				<div class="ui-widget-shadow ui-corner-all" style="width: 302px; height: 152px; position: absolute; left: 50px; top: 30px;">
				</div>
			</div>
			<div style="position: absolute; width: 280px; height: 130px;left: 50px; top: 30px; padding: 10px;" class="ui-widget ui-widget-content ui-corner-all">
				<div class="ui-dialog-content ui-widget-content" style="background: none; border: 0;">
					<p>
						Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
					</p>
				</div>
			</div>

		</div>
		<h2 class="demoHeaders">Combination examples</h2>
		<div class="columnbox" style="height: 200px;">
			<div id="tabs2">
				<ul>
					<li>
						<a href="#tabs2-1">First</a>
					</li>
					<li>
						<a href="#tabs2-2">Second</a>
					</li>
					<li>
						<a href="#tabs2-3">Third</a>
					</li>
				</ul>
				<div id="tabs2-1">
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse eget diam nec urna hendrerit tempus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum aliquam ligula non nulla cursus volutpat. Aliquam malesuada felis nec turpis auctor interdum. Cras et lobortis dolor. Nam sodales, dolor eu cursus faucibus, justo leo vestibulum turpis, id malesuada erat ipsum et leo. Integer id aliquam augue. Proin quis risus magna.
					</p>
					<a href="#" id="nestedButtonTest_1">Change</a>
				</div>
				<div id="tabs2-2">
					Tab 2
				</div>
				<div id="tabs2-3">
					Tab 3
				</div>
			</div>
		</div>

		<br />

		<div class="columnbox" style="height: 200px;">
			<div id="accordion2">
				<div>
					<h4>
					<a href="#">First</a>
					</h4>
					<div>
						<p>
							Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.
						</p>
						<a href="#" id="nestedButtonTest_2">Change</a>
					</div>
				</div>
				<div>
					<h4>
					<a href="#">Second</a>
					</h4>
					<div>
						Phasellus mattis tincidunt nibh.
					</div>
				</div>
				<div>
					<h4>
					<a href="#">Third</a>
					</h4>
					<div>
						Mauris tempor urna non quam tincidunt aliquam. Proin venenatis metus eu purus interdum a vehicula ipsum sollicitudin. Mauris sed dignissim odio. Nam id odio sed diam dapibus dignissim. Nulla vestibulum nisl ac magna scelerisque adipiscing. Nam pellentesque sapien vulputate nisi scelerisque ut vehicula orci luctus. Sed rhoncus tempor metus vitae egestas. Proin pharetra tristique justo ac rutrum. Vestibulum ac pharetra dolor. Cras nibh arcu, bibendum eget luctus id, rhoncus nec augue. Integer ornare rhoncus nulla, eu aliquam mi ornare ullamcorper. Praesent egestas auctor orci, non rhoncus sapien eleifend at. Quisque eget purus sem, ut dignissim ligula. Etiam sollicitudin dui libero, id ullamcorper metus.
					</div>
				</div>
			</div>
		</div>

		<div style="clear:both;">
			&nbsp;
		</div>

		<h2 class="demoHeaders">Common Input Fields</h2>
		<p>
			<strong>Input (type: 'text')</strong>
			<br />
			<input type="text" />
		</p>
		<p>
			<strong>Input (type: 'email' and 'password')</strong>
			<br />
			<input type="email" />
			<input type="password" />
		</p>
		<p>
			<strong>Text Area</strong>
			<br />
			<textarea cols="30">
			</textarea>
		</p>
		<p>
			<strong>Other Inputs Remain Fine</strong>
			<br />
			<input type="radio" />
			<br />
			<input type="checkbox" />
			<br />
			<input type="file" />
			<br />
			<input type="submit" />
			<br />
			<input type="button" value="Button" />
			<br />
		</p>

	</body>
</html>