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

$userid = 0;

// Create new Note
$note = new NoteModel();
$note->userid = $userid;
$note->text = 'Note';
$note->save();

// Create new Tag(s)
$tagA = new TagModel();
$tagA->userid = $userid;
$tagA->name = 'a';
$tagA->save();

$tagB = new TagModel();
$tagB->userid = $userid;
$tagB->name = 'b';
$tagB->save();

// Create TagMap entry for each tag (Note with tags 'a' and 'b')
$tmA = new TagMap($userid, $tagA->id, $note->id, NoteModel::getTable($note));
$tmA->save();
$tmB = new TagMap($userid, $tagB->id, $note->id, NoteModel::getTable($note));
$tmB->save();

//
// Get all Tags of a Note
//
$params = array(
        array(
                ':userid',
                $userid,
                PDO::PARAM_INT
        ),
        array(
                ':targetid',
                $note->id,
                PDO::PARAM_INT
        ),
        array(
                ':target',
                NoteModel::getTable($note),
                PDO::PARAM_STR
        )
);
$tags = TagMap::search($params);
debug($tags, 'All Tags of a Note');

//
// Get all Notes with specified Tags
//
$params = array(
        array(
                ':userid',
                $userid,
                PDO::PARAM_INT
        ),
        array(
                ':target',
                NoteModel::getTable($note),
                PDO::PARAM_STR
        ),
        array(
                ':tags',
                array(
                        array(
                                'a',
                                PDO::PARAM_STR
                        ),
                        array(
                                'b',
                                PDO::PARAM_STR
                        )
                ),
        ),
        array(
                ':count',
                2,
                PDO::PARAM_INT
        )
);

$notes = TagMap::filter($params, 'NoteModel');
debug($notes, 'All Notes with Tags "a" and "b"');

// Teardown test values
$note->delete();
$tagA->delete();
$tagB->delete();
$tmA->delete();
$tmB->delete();
