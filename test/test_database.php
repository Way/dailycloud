<?php
/**
 * TEST
 *
 * Database functionality
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

$now = time();

// Clear all
SessionModel::deleteDirectly(array());

// Create
$model = new SessionModel();
$model->id = $now;

// Save
$model->data = '1';
$model->expires = $now;
$model->save();
debug($model->data, 'model->data');
assert($model->data == '1');

// Update
$model->data = '2';
$model->expires = $now;
$model->update();
debug($model->data, 'model->data');
assert($model->data == '2');

// Clone
$newModel = clone $model;
$newModel->id += 10000;
$newModel->data = 'Cloned';
$newModel->save();
debug($newModel, 'cloned');
assert($model->data == '2');
assert($newModel->data == 'Cloned');

// Search
$searchResult = SessionModel::search( array('data' => '2'));
debug($searchResult, 'Search: data = 2');
assert(sizeof($searchResult) == 1);

$searchResult = SessionModel::search( array('expires' => array('<=', $now)));
debug($searchResult, 'Search: expires <= ' . $now);
assert(sizeof($searchResult) == 2);

$searchResult = SessionModel::search( array('expires >' => $now));
debug($searchResult, 'Search: expires > ' . $now);
assert(sizeof($searchResult) == 0);

// Test different model
$bookmarkModel = new BookmarkModel();
debug($bookmarkModel->getTable($bookmarkModel), 'Bookmark table');
debug(BookmarkModel::getClassName(), 'BookmarkModel class name');

// Delete
$model->delete();
debug($model->getAll(), 'getAll after delete model');
assert(sizeof($model->getAll()) == 1);

// Create by pk
$model->save();
$pkModel = SessionModel::createDirectly( array('id' => $model->id));
debug($pkModel, 'create by pk');
assert($pkModel != null);

// Create by invalid pk
$nullModel = SessionModel::createDirectly( array('id' => null));
debug($nullModel, 'create by invalid pk');
assert($nullModel == null);

// Update directly
$set = array('data' => 'Updated');
$where = array('id' => $model->id);
SessionModel::updateDirectly($set, $where);
$updateModel = SessionModel::search($where);
debug($updateModel, 'updated');
assert($updateModel != null);

// Clear all
$model->delete();
$newModel->delete();
debug($model->getAll(), 'clear all');
assert(sizeof($model->getAll()) == 0);

// Output and teardown test environment
$test->finish();
