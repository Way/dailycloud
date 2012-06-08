<?php
/**
 * TEST
 *
 * I18n functionality
 */

// Enable autoloading, provide server settings and functions
require_once ('../server/autoload.php');

// Start session
Language::init();

// Load test environment
$test = new Test(__FILE__);

//
// START TEST
//

// Alternativly i18n handling
$i18n = new I18n('../server/i18n/lang/lang_{LANGUAGE}.ini', '../server/i18n/langcache/', config('app')->lang);
$i18n->init();

?>

<!-- get applied language -->
<p>Applied Language: <?php echo $i18n->getAppliedLang(); ?> </p>

<!-- get the cache path -->
<p>Cache path: <?php echo $i18n->getCachePath(); ?></p>

<!-- Get some greetings -->
<p>A greeting: <?php echo L::greeting; ?></p>
<p>Something other: <?php echo L::category_somethingother; ?></p><!-- normally sections in the ini are seperated with an underscore like here. -->

<?php

// Output and teardown test environment
$test->finish();
