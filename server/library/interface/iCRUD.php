<?php

/**
 * Interface with the four basic functions of persistent storage.
 */
interface  iCRUD {
    public function create();
    public function read();
    public function update();
    public function delete();
}
