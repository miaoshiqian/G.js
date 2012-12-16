<?php
move_uploaded_file($_FILES["file"]["tmp_name"], dirname(__FILE__) . "/upload/" . $_FILES["file"]["name"]);
echo json_encode(array(
    'info' => array(
        'filename' => $_FILES["file"]["name"],
        'url'      => 'http://gjs.com/src/widget/imageUploader/test/upload/'.$_FILES["file"]["name"]
    )
));