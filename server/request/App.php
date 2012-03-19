<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * AppRequest
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Server request - Test
 *
 * @class     -   AppRequest
 * @file      -   AppRequest.php
 * @location  -   ./server/request/AppRequest.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class AppRequest extends Request {

    /**
     * Index.
     */
    public function index() {
        return false;
    }

    /**
     * Application types of the current user.
     */
    public function types() {
        $user = $this->getUser();
        $userid = $user->id;

        $result = array();

        $req = new DataAccessRequest();
        $req->where = array('userid' => $userid);
        $req->fields = array(
            'userid',
            'types'
        );
        $req->limit = 1;
        $req->index = 0;

        $types = SettingsModel::searchReq($req);

        // Create request result
        $result['count'] = count($types);
        $result['data'] = $types;
        $result['message'] = '';

        $this->json($result);
    }

    /**
     * User statistic values.
     */
    public function sidebar($type = null) {
        $result = array();

        switch ($type) {
            case 'user':
                $result = $this->getUserPanel();
                break;
            default:
                break;
        }

        $this->json($result);
    }

    private function getUserPanel() {
        $user = $this->getUser();
        $userid = $user->id;
        $data = array();

        // User
        $data['user'] = array('username' => $user->username);

        // User details
        if ($user->details != null) {
            $data['user']['profile_image'] = $user->details->profile_image;
            $data['user']['status_text'] = $user->details->status_text;
        }

        // Stats
        $data['bookmarks'] = BookmarkMap::getCount($userid);
        $data['notes'] = NoteModel::getCount(array(
            'userid' => $userid,
            'deleted' => '0'
        ));
        $data['tags'] = TagMap::getCount($userid);

        // Create request result
        $result = array();
        $result['count'] = count($data);
        $result['data'] = $data;
        $result['message'] = null;

        return $result;
    }

}
