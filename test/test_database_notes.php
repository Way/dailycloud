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

/**
 * SERVER
 */
if (get('r') == 'ajax') {
    // Handle ajax request
    $cmd = get('cmd');
    $type = get('type');

    $data = array();
    $data['fields'] = DataAccessModel::getFields(NoteModel::getClassName());
    $data['defaults'] = DataAccessModel::getDefaults(NoteModel::getClassName());
    $data['primaryKey'] = DataAccessModel::getPrimaryKey(NoteModel::getClassName());

    #$note = new NoteModel();
    #echo json_encode($note->_attrReaders);
    echo json_encode($data);
    exit ;
}

// Load test environment
$test = new Test(__FILE__);

// Userhandler
$uh = new UserHandler($test->getPath(), true);
$loggedin = $uh->isLoggedin();

/**
 * CLIENT
 */
?>

<!DOCTYPE HTML>
<html lang="en-US">
    <head>
        <meta charset="UTF-8">
        <title></title>
    </head>
    <body>
        <h1>NodeModel Test</h1>
        
        <pre id="output">
            Loading Note Attributes...
        </pre>
        
        <script src="<?php echo ROOT . 'app.js';?>"></script>
        <script>
            $.ajax({
                type : "GET",
                url : "<?php echo $test->getPath();?>",
                dataType: "json",
                data : "r=ajax&cmd=get&type=NoteModel",
                success : function(data) {
                    //log(data);
                    
                    var output = [];
                    
                    var note = {};
                    $.each(data.fields, function(k, v){
                        note[k] = v;
                        output.push(k + ' [' + v + ']');
                    });
                    
                    $('#output').html(output.join('\n'));
                    log(note);
                }
            });
        </script>
    </body>
</html>

<?php

// Output and teardown test environment
$test->finish();
