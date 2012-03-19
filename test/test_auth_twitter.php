<?php
/**
 * TEST
 *
 * Twitter OAuth functionality
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
require (SERVER_PATH . 'auth/twitter/twitteroauth.php');

$consumer = array('key' => 'R2FW2ln8dFQJuNtyYrtEw', 'secret' => 'VorOTp9nwxXIDnNnI0GqnuJcKCoQVedgENIf9mLpQ');

if(!empty($_SESSION['user_id'])) {
    // User is logged in
    debug($_SESSION);

    $user_id = $_SESSION['user_id'];
    debug($user_id);

    $user = UserModel::createDirectly( array('id' => $user_id));
    debug($user);
    exit ;
}

// Check if request was already successfully sent
if(!empty($_GET['oauth_verifier']) && !empty($_SESSION['oauth_token']) && !empty($_SESSION['oauth_token_secret'])) {
    // We've got everything we need
    // TwitterOAuth instance, with two new parameters we got in twitter_login.php
    $twitteroauth = new TwitterOAuth($consumer['key'], $consumer['secret'], $_SESSION['oauth_token'], $_SESSION['oauth_token_secret']);

    // Let's request the access token
    $access_token = $twitteroauth->getAccessToken($_GET['oauth_verifier']);

    // Save it in a session var
    $_SESSION['access_token'] = $access_token;

    // Let's get the user's info
    $user_info = $twitteroauth->get('account/verify_credentials');

    // Print user's info
    //debug($user_info);

    if(isset($user_info->error)) {
        // Something's wrong, go back to square 1
        header('Location: ' . $file);
    } else {
        // Let's find the user by its ID
        $user = UserModel::search( array('oauth_provider' => 'twitter', 'oauth_uid' => $user_info->id));

        // If not, let's add it to the database
        if(empty($user)) {
            $user = new UserModel();
            $user->oauth_provider = 'twitter';
            $user->oauth_uid = $user_info->id;
            $user->username = $user_info->screen_name;
            $user->oauth_token = $access_token['oauth_token'];
            $user->oauth_secret = $access_token['oauth_token_secret'];

            $result = $user->save();
            if($result !== null) {
                // insert succeeded
                $user = UserModel::createDirectly( array('id' => $result));
            } else {
                // It's a bad idea to kill the script, but we've got to know when there's an error.
                die(sprintf('Something wrong happened on line %s in $s.', __LINE__, __FILE__));
            }
        } else {
            $user = $user[0];

            // Update the tokens
            $user->oauth_token = $access_token['oauth_token'];
            $user->oauth_secret = $access_token['oauth_token_secret'];
            $user->update();
        }

        // User data
        $_SESSION['user_id'] = $user->id;
        $_SESSION['user_name'] = $user->username;

        // OAuth data
        $_SESSION['oauth_uid'] = $user->oauth_uid;
        $_SESSION['oauth_provider'] = $user->oauth_provider;
        $_SESSION['oauth_token'] = $user->oauth_token;
        $_SESSION['oauth_secret'] = $user->oauth_secret;

        redirect($test->getPath());
    }
} else {
    // Start requesting auth token...

    // The TwitterOAuth instance
    $twitteroauth = new TwitterOAuth($consumer['key'], $consumer['secret']);

    // Requesting authentication tokens, the parameter is the URL we will be redirected to
    // Name of test
    $request_token = $twitteroauth->getRequestToken($self);

    // Saving them into the session
    $_SESSION['oauth_token'] = $request_token['oauth_token'];
    $_SESSION['oauth_token_secret'] = $request_token['oauth_token_secret'];

    // If everything goes well..
    if($twitteroauth->http_code == 200) {
        // Let's generate the URL and redirect
        $url = $twitteroauth->getAuthorizeURL($request_token['oauth_token']);
        header('Location: ' . $url);
    } else {
        // It's a bad idea to kill the script, but we've got to know when there's an error.
        die(sprintf('Something wrong happened on line %s in $s.', __LINE__, __FILE__));
    }
}
