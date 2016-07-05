import { modal_error } from './Util.js';

var currentZones = null;

function initZonesWidget(map) {
  
  currentZones = map.mapData.zones;

  redraw_palette();
}

function redraw_palette() {
  var $list = $(".zones-list");
  $list.html("");
  var $tmp;
  $("#zones-number").text( currentZones.length );
   
  for (let i = 0; i < currentZones.length; i++) {

    $tmp = $("<li class='zone-row' data-index='"+i+"'><span class='zone-index'></span><span class='zone-name'></span></li>");
    $tmp.find(".zone-index").text( i );
    $tmp.find(".zone-name").text( currentZones[i].name );

    $tmp.click( (evt) => {
      var $it_me = $(evt.target).closest(".zone-row");
      alert("BUTTSU: " + $it_me.data("index"));
    } )


    $list.append($tmp);
  }

  fixContainerSize();
}

var fixContainerSize = function() {
  var palette = $(".zones-palette");
  var container = $(".zones-palette .window-container");

  container.height( palette.height() - 70 );  
};


$(".zones-palette").resize( function() {
  fixContainerSize();
} );

$(".zones-palette #zones-new").click( (evt) => {
  new_zone_click(evt);
});

$(".zones-palette #zones-spreadsheet").click( () => {
  alert("SPREAD THAT SHEET ZONE SHEIT");
});

var template = "<div>Name: <input id='zone_name'></div>";
template += "<div>Activation Script: <input id='zone_activation_script'></div>";
template += "<div>Activation Chance: <select id='zone_activation_chance'></select></div>";
template += "<div>Adjacent Activation?: <input type='checkbox' id='zone_can_by_adjacent_activated'></div>";

//{name: "NULL_ZONE", activation_script: "", activation_chance: 0, can_by_adjacent_activated: false}"

function setup_template() {
  var $template = $(template);

  var vals = new Array(256);//create an empty array with length 45
  var select = $template.find("#zone_activation_chance");

  $.each(vals, function(idx) {
    select.append( $("<option />").val(idx).text(idx) );
  }); 

  return $template;
}

function new_zone_click(evt) {
  evt.stopPropagation();

  var dialog;

  $(() => {

    var $template = setup_template();

    $( "#modal-dialog" ).attr("title", "Add New Zone (id: "+(currentZones.length-1)+")");
    $( "#modal-dialog" ).html("");
    $( "#modal-dialog" ).append($template);

    $( "#modal-dialog" ).show();
    dialog = $( "#modal-dialog" ).dialog({
      modal: true,
      buttons: {
        Save: () => { update_zone(dialog, currentZones.length) },
        "Cancel": function() {
          dialog.dialog( "close" );
        }
      },
      close: function() {
        $( "#modal-dialog" ).html("");
      }
    });
  });
}

function update_zone(dialog, zone_id) {

  var name = dialog.find("#zone_name").val();
  var script = dialog.find("#zone_activation_script").val();
  var chance = dialog.find("#zone_activation_chance").val();
  var adjAct = dialog.find("#zone_can_by_adjacent_activated").is(':checked');
  var zone = null;

  if(!$.isNumeric(zone_id) || zone_id < 0) {
    modal_error("Invalid input: zone_id ("+zone_id+") is invalid.");
    return;
  }

  if( !$.isNumeric(chance) ) {
    modal_error("Invalid input: chance not numeric.");
    return;
  }

  // if( zone_id < currentZones.length ) {
  //   zone = currentZones[zone_id];
  // }

  console.log("TODO: scriptname legality check.");
  console.log("TODO: optional scriptname uniqueness check.");
  console.log("TODO: optional scriptname existance-in-source check.");

  zone = {
    name: name, 
    activation_script: script, 
    activation_chance: chance, 
    can_by_adjacent_activated: adjAct
  };

  currentZones[zone_id] = zone;
  redraw_palette();

  dialog.dialog( "close" );
}

function write_zone( id, zone ) {
  window.$$$currentMap.mapData.zones[id] = zone
}


export var ZonesWidget = {
    initZonesWidget: initZonesWidget,
};