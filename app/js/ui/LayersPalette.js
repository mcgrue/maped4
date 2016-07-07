import { Tools } from '../../Tools.js';
import { modal_error } from './Util.js';
import { setZoneVisibility, getZoneVisibility, setZoneAlpha, getZoneAlpha } from './ZonesPalette.js'

function initLayersWidget(map) {
  var layers = map.mapData.layers;

  var list = $(".layers-palette .layers-list");
  var newLayerContainer = null;
  var l = null;
  var line = null;

  function handleEyeball(layerDiv, layer) {
    layerDiv.removeClass('eye-open');
    layerDiv.removeClass('eye-closed');

    if( !layer.MAPED_HIDDEN ) {
      layerDiv.addClass('eye-open');
    } else {
      layerDiv.addClass('eye-closed');
    }
  }

  function addLayerEyeballHandler( $eyeball, i ) {
    $eyeball.on( "click", function(evt) {
      layers[i].MAPED_HIDDEN = !layers[i].MAPED_HIDDEN;

      handleEyeball($eyeball, layers[i]);

      evt.stopPropagation()
    } );
  }

  function removeAllSelectedLayers(selClass) {
      if( window && window.selected_layer ) {
        window.selected_layer.$container.removeClass(selClass);
      }
  }

  function addZoneSelectHandler($zone_container) {
      $zone_container.on( "click", function(evt) {

        var selClass = "selected";

        removeAllSelectedLayers(selClass);

        window.selected_layer = {
          map_tileData_idx: 999,
          layer: window.$$$currentMap.zoneData,
          $container: $zone_container
        };

        $zone_container.addClass( selClass );

        evt.stopPropagation()
      } );
  }

  function addLayerSelectHandler( $layer_container, i ) {
      $layer_container.on( "click", function(evt) {

        var selClass = "selected";

        removeAllSelectedLayers(selClass);

        window.selected_layer = {
          map_tileData_idx: i,
          layer: layers[i],
          $container: $layer_container
        };
        $layer_container.addClass(selClass);

        evt.stopPropagation()
      } );
  }

  function setup_shitty_zone_layer($list) {

    var tmpLayer = { 
      MAPED_HIDDEN : !getZoneVisibility(),
      alpha: getZoneAlpha()
    }; 
    var $eyeball;

    var newLayerContainer = generateLayerContainer( l,i );
    $eyeball = generateContent(999, tmpLayer, newLayerContainer);
    newLayerContainer.find(".layer_name").text("Zones");
    newLayerContainer.addClass("nosort");
    newLayerContainer.data("alpha", getZoneAlpha()); 
    newLayerContainer.data("rstring_ref", "ZZZ"); 

    newLayerContainer.find(".layer_parallax").remove();

    addZoneSelectHandler( newLayerContainer );
    $eyeball.on( "click", function(evt) {
      setZoneVisibility( !getZoneVisibility() );

      tmpLayer.MAPED_HIDDEN = !getZoneVisibility();

      handleEyeball($eyeball, tmpLayer);

      evt.stopPropagation()
    } );

    $list.append(newLayerContainer);
  }

  function reorder_layers_by_rstring_priority($list, map) {

    var childs = $list.children("li");
    childs.detach();

    var rstring_ref = null;
    var rstring_cur_target = null;
    var cur_kid = null;
    var node = null;

    setup_shitty_zone_layer($list);

    /// ZONES

    // node = $("<li class='layer ui-state-default'><button class='eyeball_button'>?</button>Entities (default)</li>");
    // node.data("rstring_ref", "E");
    // $list.append(node);

    for (var i = map.renderString.length - 1; i >= 0; i--) {
      rstring_cur_target = map.renderString[i];
          rstring_ref = parseInt(rstring_cur_target, 10);
          if (isNaN(rstring_ref)) {

            /// TODO this is certainly the wrong place to populate "R" and "E" visually.
            if( rstring_cur_target == "E" ) {
              node = $("<li class='layer ui-state-default'><button class='eyeball_button question_mark'>?</button>Entities (default)</li>");
              node.data("rstring_ref", "E");
              $list.append(node); 
            } else if( rstring_cur_target == "R" ) {
              node = $("<li class='layer ui-state-default'><button class='eyeball_button question_mark'>?</button>'Render'</li>");
              node.data("rstring_ref", "R");
              $list.append(node); 
            } else {
              console.log( "UNKNOWN RSTRING PARTICLE '"+rstring_cur_target+"'" );
            }

            continue;
          }

          for (var j = childs.length - 1; j >= 0; j--) {
            cur_kid = $(childs[j]);
            if( cur_kid.data("rstring_ref") == rstring_cur_target ) {
              $list.append(cur_kid); // re-add to list
              childs.splice(j, 1); // remove from childs array
              break;
            }
          };

          $(".eyeball_button.question_mark").click( function() {
            console.log("unimplemented, weirdo.");
          } )
    };
  }

  function resizeWindow() {
    var h = 0;
    var w = 0;

    /// hackery of the worst calibur; probably a flaming trashbin.  do not trust.
    $(".layers-palette").children().each( function(idx, kid) {
      if( idx >= $(".layers-palette").children().length-3 ) {
        return; /// the last three are chrome for resizable windows.
      }

      h +=  $(kid).outerHeight(true);
    })

    w += $(".layers-palette .window-container").outerWidth(true);

    $(".layers-palette").width(w);
    $(".layers-palette").height(h);  
  }

  function update_lucency(layer, dialog, special_case) {
    var val = $("#new_layer_lucent").val().trim();

    if( !$.isNumeric(val) ) {
      modal_error("Invalid input: not numeric.");
      return;
    }

    if( val.indexOf(".") === -1 ) {
      val = parseInt(val);

      if(val <0 || val > 100) {
        modal_error("INVALID PERCENTAGE VALUE, range: [0...100]");
        return;
      } else {
        val = val/100;
      }
    } else { // parse fraction
      val = parseFloat(val);
      if( val < 0 || val > 1 ) {
        modal_error("INVALID FLOAT VALUE, range:  [0...1]");
        return;
      } 
    }

    switch(special_case){
      case "zone":
        setZoneAlpha(val);
        break;
      default:
        layer.alpha = val;
        break;
    }

    redrawAllLucentAndParallax();

    dialog.dialog( "close" );
  }

  function lucent_click(evt) {
    var idx, layer, dialog;
    var $me = $(evt.target).parent().parent();
    var special = "";

    /// TODO: this is special-case and evil.  make more better.
    if( $me.data("rstring_ref") === "ZZZ" ) {
      layer = {
        name: "Zones",
        alpha: getZoneAlpha()
      }

      special = "zone";

    } else {
      idx = parseInt($me.data("rstring_ref"))-1;
      layer = window.$$$currentMap.mapData.layers[idx];
    }


    evt.stopPropagation();

    $(() => {

      var template = "<div>Layer: " + layer.name + "</div>";
      template += "<div>Current: " + formatAlphaAsPercentage(layer.alpha) + "</div>"; 
      template += "<div>New: <input id='new_layer_lucent'>%</div>"; 

      $( "#modal-dialog" ).attr("title", "Set layer Opacity");
      $( "#modal-dialog" ).html(template)

      $( "#modal-dialog" ).show();
      dialog = $( "#modal-dialog" ).dialog({
        modal: true,
        buttons: {
          Save: () => { update_lucency(layer, dialog, special) },
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

  function parallax_click(evt) {
    var idx = parseInt($(this).parent().parent().data("rstring_ref"))-1;
    var layer = window.$$$currentMap.mapData.layers[idx];

    evt.stopPropagation();

    //var newLucent = dialog
    var dialog;

    $(() => {

      var template = "<div>Layer: " + layer.name + "</div>";
      template += "<div>Current (X:Y): " + layer.parallax.X + ":"+layer.parallax.Y+"</div>"; 
      template += "<div>New: <input id='new_layer_parallax_x' size=3>&nbsp;:&nbsp;<input id='new_layer_parallax_y' size=3></div>"; 

      $( "#modal-dialog" ).attr("title", "Set layer Parallax");
      $( "#modal-dialog" ).html(template)

      $( "#modal-dialog" ).show();
      dialog = $( "#modal-dialog" ).dialog({
        modal: true,
        buttons: {
          Save: () => { update_parallax(layer, dialog) },
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

  function update_parallax(layer, dialog) {
    var x = $("#new_layer_parallax_x").val().trim();
    var y = $("#new_layer_parallax_y").val().trim();
    var newParallax = {};

    if( !$.isNumeric(x) ) {
      modal_error("Invalid input: x not numeric.");
      return;
    }
    if( !$.isNumeric(y) ) {
      modal_error("Invalid input: y not numeric.");
      return;
    }

    x = parseFloat(x);
    y = parseFloat(y);

    newParallax.X = x;
    newParallax.Y = y;

    layer.parallax = newParallax;

    redrawAllLucentAndParallax();

    dialog.dialog( "close" );
  }

  function formatAlphaAsPercentage(alpha) {
    return (alpha.toFixed(2) * 100);
  }

  function redrawAllLucentAndParallax(map) {

    if(!map) {
      map = window.$$$currentMap;
    }

    $(".layer").each( function(idx,layer) {
      var nodeLayer = $(layer);
      var rstring = nodeLayer.data("rstring_ref");
      var lucentDomNode = null;
      var parallaxDomNode = null;

      var mapLayer = null 

      if(nodeLayer.hasClass("nosort")) {

        if( nodeLayer.data("rstring_ref") === "ZZZ" ) {
          lucentDomNode = nodeLayer.find(".layer_lucency");
          lucentDomNode.text(formatAlphaAsPercentage(getZoneAlpha())+"%")
        }

        return;
      }

      if( !$.isNumeric(rstring) ) {
        return;
      } else {
        mapLayer = map.mapData.layers[parseInt(rstring)-1]; //todo: seperate human-indx from 0-based.
        lucentDomNode = nodeLayer.find(".layer_lucency");
        lucentDomNode.text(formatAlphaAsPercentage(mapLayer.alpha)+"%")

        parallaxDomNode = nodeLayer.find(".layer_parallax");
        parallaxDomNode.text(mapLayer.parallax.X+":"+mapLayer.parallax.Y);

        if(!mapLayer.alpha) {
          debugger;
        }

        nodeLayer.data("alpha", mapLayer.alpha) // TODO: remove this, only one source of truth: the data.
      }

    }); 
  }

  function generateContent(i, l, $parent) {
    var visible_div = $("<button class='eyeball_button'></button>");
    var name_div = $("<div class='layer_name'></div>");

    var right_div = $("<div class='rightmost_div'></div>")

    var lucent_div   = $("<div class='layer_lucency'></div>");
    var parallax_div = $("<div class='layer_parallax'>?:?</div>");

    handleEyeball(visible_div, l);

    name_div.text((i+1)+": "+l.name);
    lucent_div.text(formatAlphaAsPercentage(l.alpha)+"%")

    lucent_div.click(lucent_click);
    parallax_div.click(parallax_click);

    $parent.append(visible_div);
    $parent.append(name_div);

    // right div
    right_div.append(lucent_div);
    right_div.append(parallax_div);
    
    $parent.append(right_div);

    return visible_div; 
  }

  function generateLayerContainer(layer, layer_index) {
    var newLayerContainer = $("<li class='layer ui-state-default'></li>");
    newLayerContainer.data("alpha", layer.alpha);
    newLayerContainer.data("rstring_ref", ""+(layer_index+1) );

    return newLayerContainer;
  }

  var eyeballButton;

  for (var i = layers.length - 1; i >= 0; i--) {
    l = layers[i];

    newLayerContainer = generateLayerContainer( l,i );
    eyeballButton = generateContent( i, l, newLayerContainer );
    addLayerEyeballHandler(eyeballButton, i);

    addLayerSelectHandler( newLayerContainer, i );

    list.append( newLayerContainer );
  };

  /// RSTRING is weird and needs to die.
  reorder_layers_by_rstring_priority(list, map);
  resizeWindow();

  /// make the layers sortable
  $( ".layers-list" ).sortable({
    revert: true,
    cancel: '.nosort',
  });
  $( "ul, li" ).disableSelection();

  var skipWeirdThings = (rstring_val) => {
    if(rstring_val === "ZZZ") {
      return true;
    }

    return false;
  };

  $( ".layers-list" ).on( "sortupdate", function( event, ui ) {
    var kids = $( ".layers-list" ).children();
    var i, val;

    var rstring = [];

    try {
      for( i in kids ) {
        if( kids.hasOwnProperty(i) ) {
          val = $(kids[i]).data("rstring_ref");
          if(val && !skipWeirdThings(val)) {
            rstring.unshift($(kids[i]).data("rstring_ref"));  
          }
        }
      }
    } catch(e) {
      console.log("error")
      console.log(e)
      throw e;
    }

    Tools.updateRstringInfo( rstring.join(",") );
  } );

  redrawAllLucentAndParallax(map);
};

export var LayersWidget = {
    initLayersWidget: initLayersWidget,
};