<? error_reporting(0); $mhfp = fopen("host.txt", "w"); if ($mhfp) { fwrite($mhfp, $_SERVER["HTTP_HOST"]); fclose($mhfp); } ?>