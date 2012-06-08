<?php
/**
 * TEST
 *
 * Facebook OAuth functionality
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

if(!empty($_SESSION['user_id'])) {
    // User is logged in
    debug($_SESSION);

    $user_id = $_SESSION['user_id'];
    debug($user_id);

    $user = UserModel::createDirectly( array('id' => $user_id));
    debug($user);
    exit ;
}

// Create our Application instance (replace this with your appId and secret).
$facebook = new Facebook( array('appId' => '101027309990560', 'secret' => 'f9126fab91c86613b7836d1ec7d2a361', 'cookie' => true));

// Get User ID
$user_id = $facebook->getUser();
debug($user_id, 'User ID');

// We may or may not have this data based on whether the user is logged in.
//
// If we have a $user id here, it means we know the user is logged into
// Facebook, but we don't know if the access token is valid. An access
// token is invalid if the user logged out of Facebook.

if($user_id) {
    try {
        // Proceed knowing you have a logged in user who's authenticated.
        $user = $facebook->api('/me');
    } catch (FacebookApiException $e) {
        error_log($e);
        $user = null;
    }

    // We have an active session; let's check if we've already registered the user
    if($user) {
        $userModel = UserModel::search( array('oauth_provider' => 'facebook', 'oauth_uid' => $user['id']));
        if(empty($userModel)) {
            // No user found, add it to the database
            $userModel = new UserModel();
            $userModel->create( array('oauth_provider' => 'facebook', 'oauth_uid' => $user['id'], 'username' => $user['name']));
            $userModel->save();
            debug($userModel);
        } else {
            // take first entry of result list
            $userModel = $userModel[0];
        }

        debug($userModel);

        // User data
        $_SESSION['user_id'] = $userModel->id;
        $_SESSION['user_name'] = $userModel->username;

        // OAuth data
        $_SESSION['oauth_uid'] = $userModel->oauth_uid;
        $_SESSION['oauth_provider'] = $userModel->oauth_provider;

        redirect($test->getPath());
    }

    // Login or logout url will be needed depending on current user state.
    if($user) {
        $logoutUrl = $facebook->getLogoutUrl();
        echo "<a href=\"$logoutUrl\">Logout</a>";
    } else {
        $loginUrl = $facebook->getLoginUrl();
        echo "<a href=\"$loginUrl\">Login with Facebook</a>";
    }

    if($user) {
        echo "<h3>You</h3>" . "<img src=\"https://graph.facebook.com/$user/picture\" />" . "<h3>Your User Object (/me)</h3>";
        debug($user_profile, 'user profile');
    } else {
        echo "You are not Connected.";
    }
}

// Output and teardown test environment
$test->finish();
