<?php

  $file_name= "database.txt";

  $entries_from_file = file_get_contents($file_name);

  //massiiv olemasolevate purkidega
  $entries = json_decode($entries_from_file);


  if(isset($_GET["id"]) && isset($_GET["saladus"]) && isset($_GET["date"]) && !empty($_GET["id"]) && !empty($_GET["saladus"]) && !empty($_GET["date"])){

	  //salvestan juurde
	  $object = new StdClass();
	  $object->id = $_GET["id"];
	  $object->saladus = $_GET["saladus"];
	  $object->date = $_GET["date"];


	  //lisan massiiivi juurde
	  array_push($entries, $object);

	  //teen stringiks
	  $json = json_encode($entries);

	  //salvestan
	  file_put_contents($file_name, $json);

  }


  //var_dump($entries);
	echo(json_encode($entries));



?>
