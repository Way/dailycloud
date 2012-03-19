<?php
defined('AUTOLOAD') or exit('No direct access!');
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 * NoteRequest
 *~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*
 *
 * Server request - Test
 *
 * @class     -   NoteRequest
 * @file      -   NoteRequest.php
 * @location  -   ./server/request/NoteRequest.php
 * @package   -   dailyd
 * @author    -   Alexander Vey <this.vey@gmail.com>
 *
 * @version   -   1.0
 */
class NoteRequest extends Request {

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
     * New
     *
     * @access public
     */
    public function create() {
        $user = $this->getUser();
        $userid = $user->id;

        // Create a new note
        $note = new NoteModel;
        $note->create(array(
            'userid' => $userid,
            'created' => time()
        ));
        $note->save();
        $this->json($note);
    }

    /**
     * Get all notes of a user
     *
     * @access public
     *
     * @param $tags (boolean) - set to false to prevent adding the tags
     */
    public function get($tags = true) {
        $user = $this->getUser();
        $userid = $user->id;

        $result = array();

        $req = new DataAccessRequest();
        $req->where = array(
            'userid' => $userid,
            'deleted' => '0'
        );
        $req->order = 'updated DESC, created DESC';
        $notes = NoteModel::searchReq($req);

        // Query the tags of all notes
        if ($tags) {
            foreach ($notes as $i => $note) {
                $note->tags = TagMap::getTags($userid, $note);
                $notes[$i] = $note;
            }
        }

        // Create request result
        $result['count'] = count($notes);
        $result['notes'] = $notes;
        $result['message'] = null;

        $this->json($result);
    }

    /**
     * Save
     *
     * @access public
     */
    public function save() {
        $user = $this->getUser();
        $userid = $user->id;

        $result = array();

        $id = Server::post('id');
        $version = Server::post('version');
        $text = Server::post('text');

        if ($id === null || $version === null || $text === null) {
            $this->error('essentiell values missing!');
        }

        $note = NoteModel::createDirectly(array(
            'id' => $id,
            'userid' => $userid
        ));

        $preventFields = 'id userid created';

        // Validate version of current note to prevent override new changes
        if (intval($note->version) < intval($version)) {
            // Update fields
            $note->text = $text;
            $note->version = $version;
            $note->updated = time();
            $note->update(preg_split('/ /', $preventFields));
        } else {
            $result['error'] = true;
            $result['message'] = 'The version of the note in the database is higher than the version of the note to save.';
        }

        $result['data'] = $note;

        $this->json($result);
    }

    /**
     * Delete
     *
     * @access public
     */
    public function delete() {
        $user = $this->getUser();
        $userid = $user->id;

        $id = Server::post('id');

        if ($id === null) {
            $this->error('essentiell values missing!');
        }

        // $result = NoteModel::deleteDirectly(array(
        // 'id' => $id,
        // 'userid' => $userid
        // ));

        $result = NoteModel::updateDirectly(array('deleted' => '1'), array(
            'id' => $id,
            'userid' => $userid
        ));

        $this->json($result);
    }

}
