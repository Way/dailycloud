<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * TagRequest
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Server request - Test
 *
 * @class     -   TagRequest
 * @file      -   TagRequest.php
 * @location  -   ./server/request/TagRequest.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class TagRequest extends Request {

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
     * Get
     *
     * @access public
     */
    public function get() {
        $user = $this->getUser();
        $userid = $user->id;

        $fields = TagModel::getFields(new TagModel);
        $where = array('userid' => $userid);
        $tags = TagModel::search($where, $fields, 'name ASC');
        foreach ($tags as $i => $tag) {
            // Exclude userid from the tags
            $tags[$i] = $tag->filter(array('userid'), true);
        }

        // Create request result
        $result = array();
        $result['count'] = count($tags);
        $result['tags'] = $tags;
        $result['message'] = null;

        $this->json($result);
    }

    /**
     * Add
     *
     * Create a new entry in the TagMap to associate a target with a tag.
     * First check if the used tag (identified by its name) is already known:
     *  Tag already exists: Use it
     *  Tag is new: Create it
     *
     * @access public
     */
    public function add($target = null, $targetId = null, $tagName = null) {
        $user = $this->getUser();
        $userid = $user->id;

        $target = $target != null ? $target : Server::post('target');
        $targetId = $targetId != null ? $targetId : Server::post('targetid');
        $tagName = $tagName != null ? $tagName : Server::post('name');

        if ($target === null || $targetId === null || $tagName === null) {
            $this->error('essentiell values missing!');
        }

        $tag = TagMap::addTag($userid, $target, $targetId, $tagName);
        $this->json($tag);
    }

    /**
     * Remove
     *
     * @access public
     */
    public function remove() {
        $user = $this->getUser();
        $userid = $user->id;

        $tagId = Server::post('tagid');
        $target = Server::post('target');
        $targetId = Server::post('targetid');

        if ($tagId === null || $target === null || $targetId === null) {
            $this->error('essentiell values missing!');
        }

        $tagmapAttr = array(
            'userid' => $userid,
            'tagid' => $tagId,
            'targetid' => $targetId,
            'target' => $target
        );

        $tagmap = TagMapModel::search($tagmapAttr, null, null, null, 1);
        if ($tagmap === null || sizeof($tagmap) === 0) {
            // Tagmap does not exist
            $this->error('Tag cannot be removed from the target cause it is not assigned to that target');
        } else {
            $tagmap = $tagmap[0];
        }
        $result = $tagmap->delete();
        $this->json($result);
    }

}
