<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * BookmarkRequest
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Bookmark request and access point.
 *
 * @class     -   BookmarkRequest
 * @file      -   BookmarkRequest.php
 * @location  -   ./server/request/BookmarkRequest.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class BookmarkRequest extends Request implements iCRUD {

    /**
     * URL to the favicon service.
     */
    const favicon_url = 'http://g.etfv.co/';

    /**
     * Index
     *
     * @access public
     */
    public function index() {
        debug(__METHOD__);
        debug(func_get_args(), 'Arguments');
    }

    /**
     * Create new bookmark
     *
     * @access public
     */
    public function create() {
        $user = $this->getUser();
        $userid = $user->id;

        // Request response
        $result = array();

        $url = Server::post('url');

        // Is bookmark already saved? -> search for BookmarkModel
        $req = new DataAccessRequest();
        $req->where = array('url' => $url);
        $req->limit = 1;
        $req->index = 0;

        $bookmark = BookmarkModel::searchReq($req);
        if (empty($bookmark)) {
            //
            // Bookmark does not yet exist!
            //

            // Analyze website and request its webshot
            $data = $this->analyze($url);

            if (isset($data['error']) && $data['error']) {
                $this->json($data);
                exit ;
            }

            // Create and save new bookmark
            $bookmark = new BookmarkModel();
            $attr = array(
                'url' => $data['url'],
                'title' => $data['title'],
                'webshot' => $data['webshot'],
                'description' => $data['desc'],
                'created' => time()
            );
            $bookmark->create($attr);
            if ($bookmark->save()) {
                $result['created'] = true;
                $result['message'] = 'Bookmark successfully created';
            }
        } else {
            // Note: set the created flag to false because the bookmark was not newly created!
            $result['created'] = false;
            $result['message'] = 'Bookmark is already created';
        }
        $result['bookmark'] = $bookmark;

        // Has the user already saved this bookmark? -> search for BookmarkMapModel
        $req = new DataAccessRequest();
        $req->where = array('bookmarkid' => $bookmark->id);
        $req->limit = 1;
        $req->index = 0;

        $bmap = BookmarkMapModel::searchReq($req);
        if (empty($bmap)) {
            // Create bookmark map entry for the user
            $bmap = new BookmarkMapModel();
            $bmap->create(array(
                'userid' => $userid,
                'bookmarkid' => $bookmark->id,
                'created' => time()
            ));
            if ($bmap->save()) {
                $result['saved'] = true;
                $result['message'] = 'Bookmark successfully saved';
            }
        } else {
            // Note: set the saved flag to true regardless of whether it was newly saved or wasn't. Either way its saved now!
            $result['saved'] = true;
            $result['message'] = 'Bookmark is already saved';
        }

        // Get already saved tags of the bookmark
        $tags = TagMap::getTags($userid, $bookmark);

        // Add (new) tags
        if (isset($data['tags']) && is_array($data['tags']) && sizeof($data['tags']) > 0) {
            $target = DataTables::getTable($bookmark);
            $targetId = $bookmark->id;
            foreach ($data['tags'] as $i => $tagName) {
                // Add new tag-links into the tagmap
                $tag = TagMap::addTag($userid, $target, $targetId, $tagName);
                $tags[] = $tag;
            }
        }
        $bookmark->tags = $tags;

        $this->json($result);
    }

    /**
     * Read from database
     *
     * @access public
     */
    public function read() {
        return $this->get();
    }

    /**
     * Update bookmark
     *
     * @access public
     */
    public function update() {
        throw new Exception("Not yet implemented!");
    }

    /**
     * Get all bookmarks of a user
     *
     * @access public
     *
     * @param $tags (boolean) - set to false to prevent adding the tags
     * @param $limit (int) - set to positive value to limit the number of results
     * @param $start (int) - set to positive value to set the start index of the limited result
     * @param array
     */
    public function get($tags = true, $limit = 0, $start = 0) {
        $user = $this->getUser();
        $userid = $user->id;

        $result = array();
        $message = '';

        if ($limit > 0) {
            $bookmarks = BookmarkMap::getLatest($userid, $limit, $start);
        } else {
            $bookmarks = BookmarkMap::getNew($userid);
        }

        // Query the tags of all bookmarks
        if ($bookmarks) {
            foreach ($bookmarks as $i => $bookmark) {
                $bookmark->tags = TagMap::getTags($userid, $bookmark);
            }
        }

        // Create request result
        $result['count'] = count($bookmarks);
        $result['bookmarks'] = $bookmarks;
        $result['message'] = $message;

        $this->json($result);
    }

    /**
     * Delete from database
     *
     * @access public
     */
    public function delete($id = null) {
        $user = $this->getUser();
        $userid = $user->id;

        if ($id == null && ($id = Server::post('id')) == null) {
            $this->error('essentiell values missing!');
        }

        $result = BookmarkMapModel::updateDirectly(array('deleted' => '1'), array(
            'userid' => $userid,
            'bookmarkid' => $id
        ));

        $this->json($result);
    }

    /**
     * Analyze page by loading its content
     *
     * @access public
     *
     * @param string $url
     * @return array data of the analyzed webpage
     */
    public function analyze($url = null) {
        if ($url == null) {
            // Handle server request
            $user = $this->getUser();
            $url = Server::post('url');
        }

        // Add possibly missing scheme to the url
        if (preg_match('/https?/', $url) == 0) {
            $url = 'http://' + $url;
        }

        // Set initial data
        $data = array(
            'url' => $url,
            'title' => null,
            'desc' => null,
            'tags' => array()
        );

        // ignore non valid url requests
        $valid = Validation::instance()->validateUrl($url);
        if (!$valid) {
            $data['error'] = true;
            $data['message'] = 'Invalid url';
            return $data;
        }

        // Request webshot
        $data['webshot'] = $this->webshot($url);

        // Parse content of the page
        $dom = new SimpleHtmlDom();
        try {
            $content = @file_get_contents($url);
            if ($content) {
                $dom->load($content, true);

                $title = $dom->find('title', 0);
                $data['title'] = $title != null ? trim($title->innertext) : null;

                $desc = $dom->find('meta[name=description]', 0);
                $data['desc'] = $desc != null ? trim($desc->content) : null;

                $tags = $dom->find('meta[name=keywords]', 0);
                $data['tags'] = $tags != null ? trim($tags->content) : null;
                if ($data['tags'] != null) {
                    $data['tags'] = preg_split("/[,]+/", $data['tags']);
                    $data['tags'] = array_map('trim', $data['tags']);
                }
            }
        } catch(Exception $ex) {
            $data['error'] = true;
            $data['message'] = $ex->getMessage();
        }

        // memory leak clean up
        $dom->clear();
        unset($dom);

        return $data;
    }

    /**
     * Request a snapshot of the website (webshot).
     *
     * @access public
     *
     * @param string $url
     * @return string webshot id (md5 hash of the url)
     */
    public function webshot($url = null) {
        if ($url == null) {
            // Handle server request
            $user = $this->getUser();
            $url = Server::post('url');
        }

        $params = array(
            'url' => $url,
            'type' => 'json'
        );
        try {
            // $webshot = rest_helper(config('app')->webshoturl, $params, 'POST');
            curl_post_async(config('service')->webshot, $params, 10);
        } catch (Exception $ex) {
            // TODO handle error! try again?
        }
        // job id and webshot identifier
        return md5($url);
    }

    /**
     * Get the latest bookmarks of the user.
     *
     * @access public
     *
     * @param int $limit
     * @return array
     */
    public function latest($limit = 10, $start = 0) {
        return $this->get(true, $limit, $start);
    }

}
