include <lumpyscad/lib.scad>;
include <NopSCADlib/lib.scad>

pi_approx = 3.14159;
tolerance = 0.2;

resolution = 128;

extrude_width = 0.5;
extrude_height = 0.24;
wall_thickness = extrude_width*2;
floor_thickness = extrude_height*8;
rounded_diam = wall_thickness*2;

keyswitch_hole_side = 14 + tolerance;
keyswitch_retainer_ledge_thickness = 1.2;
keycap_spacing = 20;

threaded_hole_depth = 8;

sheet_metal_thickness = 1.5;

end_cap_diam = 3.5*inch;
end_cap_thickness = 1*inch;

led_strip_width = 12;
led_strip_length = 50;

plywood_thickness = 17.5; // 3/4*inch;
plywood_width = end_cap_diam;
plywood_length = led_strip_length+1/2*inch;

screw_diam = 4.5;
screw_head_diam = 12;
screw_length = 31;
screw_spacing = end_cap_diam*0.6;

//end_cap_center_pos_y = front*keyswitch_hole_side*0.3;
end_cap_center_pos_y = front*33.44; // odd decimal so cover is an easy number
//end_cap_center_pos_y = front*27; // odd decimal so cover is an easy number
echo("depth (mm): ", abs(end_cap_center_pos_y) + end_cap_diam/2);
echo("depth (mm): ", (abs(end_cap_center_pos_y) + end_cap_diam/2)/inch);
end_cap_sunken_area_diam = end_cap_diam-2*(wall_thickness*2);
sunken_bevel_height = 0; // wall_thickness*2; // to try to avoid the prusa bug with swollen areas next to top layers


echo("end_cap_diam (mm): ", end_cap_diam);
echo("end_cap_diam (in): ", end_cap_diam/25.4);

diffuser_width = (pi_approx*end_cap_diam)/2 + 2*(abs(end_cap_center_pos_y));
diffuser_length = plywood_length;

cover_width = diffuser_width + 2*(plywood_thickness);
cover_length = diffuser_length+end_cap_thickness*2;

echo("cover_width (mm): ", cover_width);
echo("cover_width (in): ", cover_width/inch);
echo("cover_length (mm): ", cover_length);
echo("cover_length (in): ", cover_length/inch);

echo("diffuser_width (mm): ", diffuser_width);
echo("diffuser_width (in): ", diffuser_width/inch);
echo("diffuser_length (mm): ", diffuser_length);
echo("diffuser_length (in): ", diffuser_length/inch);

echo("plywood_width (mm): ", plywood_width);
echo("plywood_width (in): ", plywood_width/inch);
echo("plywood_length (mm): ", plywood_length);
echo("plywood_length (in): ", plywood_length/inch);
echo("plywood_thickness (mm): ", plywood_thickness);
echo("plywood_thickness (in): ", plywood_thickness/inch);

module end_cap_base_profile() {
  module body() {
    hull() {
      translate([0,end_cap_center_pos_y,-end_cap_thickness/2]) {
        intersection() {
          accurate_circle(end_cap_diam,resolution);
          translate([0,-end_cap_diam/2,0]) {
            square([end_cap_diam,end_cap_diam],center=true);
          }
        }
      }
      translate([0,plywood_thickness/2,0]) {
        rounded_square(end_cap_diam,plywood_thickness,rounded_diam,resolution);
      }
    }
  }

  module holes() {
  }

  difference() {
    body();
    holes();
  }
}

module end_cap_base(side=top, sunken_depth=0) {
  module body() {
    linear_extrude(height=end_cap_thickness,center=true,convexity=3) {
      end_cap_base_profile();
    }
  }

  module holes() {
    end_cap_sunken_area_diam = end_cap_diam-2*(wall_thickness*2);

    for(x=[left,right]) {
      translate([x*(screw_spacing/2),plywood_thickness/2,side*end_cap_thickness/2]) {
        hole(screw_diam,end_cap_thickness*3,resolution/2);
        translate([0,0,0]) {
          hull() {
            screw_head_diam = 8;
            base_depth = 1.5;
            delta = screw_head_diam - screw_diam;
            hole(screw_head_diam,base_depth*2,resolution/2);
            hole(screw_diam,2*(delta/2+1.5),resolution/2);
          }
        }
      }
    }

    // reduce plastic usage, provide room for stuffs
    hull() {
      translate([0,0,end_cap_thickness/2*-side]) {
        translate([0,end_cap_center_pos_y,0]) {
          difference() {
            union() {
              hole(end_cap_sunken_area_diam-sunken_bevel_height*2,2*sunken_depth,resolution);
              hole(end_cap_sunken_area_diam,2*(sunken_depth-sunken_bevel_height),resolution);
            }
            translate([0,end_cap_sunken_area_diam/2,0]) {
              cube([end_cap_sunken_area_diam+1,end_cap_sunken_area_diam,end_cap_thickness*3],center=true);
            }
          }
        }
        translate([0,-rounded_diam,0]) {
          rounded_cube(end_cap_sunken_area_diam,rounded_diam*2,2*(sunken_depth-sunken_bevel_height),rounded_diam*2,resolution);
          translate([0,-sunken_bevel_height,0]) {
            rounded_cube(end_cap_sunken_area_diam-sunken_bevel_height*2,rounded_diam*2,2*(sunken_depth),rounded_diam*2,resolution);
          }
        }
      }
    }
  }

  difference() {
    body();
    holes();
  }
}

module wall_mounting_holes() {
  // NARROW
  // mounting slot to hang on a screw
  diam = 5;
  slot_depth = 6;
  smaller_width = 13;
  larger_width = smaller_width+slot_depth*2;
  translate([0,plywood_thickness,smaller_width/2]) {
    rotate([-90,0,0]) {
      rotate([0,0,45]) {
        % debug_axes();
        rounded_cube(smaller_width,smaller_width,slot_depth/2,diam,resolution);
        hull() {
          translate([0,0,-slot_depth/4-wall_thickness]) {
            rounded_cube(smaller_width,smaller_width,slot_depth/2,diam,resolution);
          }
          translate([0,0,-plywood_thickness/2+wall_thickness*3]) {
            rounded_cube(larger_width,larger_width,wall_thickness*4,diam*2,resolution);
          }
        }
      }
      mult = 1.245;
      translate([0,20,0]) {
        cube([mult*smaller_width,40,slot_depth/2],center=true);
      }
      hull() {
        translate([0,20,-slot_depth/4-wall_thickness]) {
          cube([mult*smaller_width,40,slot_depth/2],center=true);
        }
        translate([0,20,-plywood_thickness/2+wall_thickness*3]) {
          cube([mult*larger_width,40,wall_thickness*4],center=true);
        }
      }
    }
  }

  // WIDE
  // mounting slot to hang on a screw
  /*
  translate([0,plywood_thickness,0]) {
    rotate([-90,0,0]) {
      slot_width = screw_spacing-2*(screw_diam/2+extrude_width*4);
      slot_height = end_cap_thickness-5;
      slot_depth = 6;
      smaller_width = slot_width - slot_depth;
      smaller_height = slot_height - slot_depth;

      rounded_cube(smaller_width,smaller_height*2,slot_depth/2,slot_height,resolution);
      hull() {
        translate([0,0,-slot_depth/4-wall_thickness]) {
          rounded_cube(smaller_width,smaller_height*2,slot_depth/2,slot_height,resolution);
        }
        translate([0,0,-plywood_thickness/2+wall_thickness*3]) {
          rounded_cube(slot_width,slot_height*2,wall_thickness*4,slot_height,resolution);
        }
      }
    }
  }
  */
}

module top_end_cap() {
  sunken_depth = end_cap_thickness-extrude_height*4;
  vent_hole_diam = 4;
  vent_width = 40;
  reinforcement_rib_height = 6;

  module position_vent() {
    vent_y_positions = [
      end_cap_center_pos_y*0.4,
      end_cap_center_pos_y,
      end_cap_center_pos_y*1.6,
    ];
    for(y=vent_y_positions) {
      translate([0,y,end_cap_thickness-reinforcement_rib_height/2]) {
        children();
      }
    }
  }

  module body() {
    translate([0,0,end_cap_thickness/2]) {
      end_cap_base(top, sunken_depth);
    }

    position_vent() {
      rounded_cube(vent_width+extrude_width*4,vent_hole_diam+extrude_width*4,reinforcement_rib_height,vent_hole_diam+extrude_width*4,resolution);
    }

    translate([0,0,end_cap_thickness-reinforcement_rib_height/2]) {
      hull() {
        cube([extrude_width*2,wall_thickness,reinforcement_rib_height],center=true);
        translate([0,end_cap_center_pos_y-end_cap_sunken_area_diam/2,0]) {
          cube([extrude_width*2,wall_thickness,reinforcement_rib_height],center=true);
        }
      }
    }
  }

  module holes() {
    position_vent() {
      rounded_cube(vent_width,vent_hole_diam,end_cap_thickness*3,vent_hole_diam,resolution);
    }

    wall_mounting_holes();
  }

  difference() {
    body();
    holes();
  }
}

module bottom_end_cap() {
  switch_cavity_width = keycap_spacing-wall_thickness*2;
  switch_cavity_depth = end_cap_thickness-keyswitch_retainer_ledge_thickness;
  bottom_thickness = 6;
  end_cap_sunken_area_depth = end_cap_thickness-bottom_thickness;

  power_plug_hole_diam = 11;
  power_plug_bevel_height = 2;
  power_plug_bevel_id = 13.5;
  power_plug_bevel_od = power_plug_bevel_id;
  power_plug_body_diameter = power_plug_hole_diam+extrude_width*4*2; // make it easier to screw hex nut on // FIXME: make this based on the max OD of the hex nut?
  power_plug_area_thickness = 4;
  power_plug_nut_od = 25; // plus room to spin it

  keyswitch_pos_y = end_cap_center_pos_y+front*(19);

  proto_thickness = 2;
  proto_dist_above_rpi = 10;
  proto_hole_diam = 2.2;
  proto_bevel_height = 8;
  proto_bevel_id = proto_hole_diam + wall_thickness*2;
  proto_bevel_od = proto_bevel_id+4;
  proto_hole_spacing_y = 23;
  proto_hole_spacing_x = 58;

  module proto_board() {
    module body() {
      color("white") rounded_cube(pcb_length(RPI0),pcb_width(RPI0),proto_thickness,4);
    }

    module holes() {
      pcb_hole_positions(RPI0) {
        hole(proto_hole_diam,10,resolution);
      }
    }

    difference() {
      body();
      holes();
    }
  }

  module position_proto() {
    translate([0,keyswitch_pos_y+keyswitch_hole_side/2+5+pcb_width(RPI0),-end_cap_sunken_area_depth+proto_bevel_height]) {
      rotate([0,0,180]) {
        rotate([-180,0,0]) {
          translate([0,-pcb_width(RPI0)/2-1,0]) {
            children();
          }
        }
      }
    }
  }

  module position_proto_horizontal() {
    translate([0,keyswitch_pos_y+keyswitch_hole_side/2+pcb_width(RPI0)/2-4,-end_cap_sunken_area_depth+proto_bevel_height]) {
      rotate([0,180,0]) {
        children();
      }
    }
  }

  module position_proto_holes() {
    position_proto() {
      for(x=[left,right]) {
        translate([x*proto_hole_spacing_x/2,proto_hole_spacing_y/2,proto_bevel_height+proto_thickness/2]) {
          children();
        }
      }
    }
  }

  module position_rpi_vertical() {
    translate([0,keyswitch_pos_y+keycap_spacing/2,-end_cap_sunken_area_depth+0.0]) {
      rotate([-90,0,0]) {
        translate([0,front*pcb_width(RPI0)/2,0]) {
          rotate([0,0,0]) {
            children();
          }
        }
      }
    }
  }

  module position_power_plug() {
    //translate([left*(end_cap_sunken_area_diam/2-power_plug_bevel_od/2-wall_thickness*2),front*(power_plug_bevel_od/2+wall_thickness*2),0]) {
    space_from_wall = 2;
    //for(x=[left,0,right]) {
    for(x=[0]) {
      pos_x = end_cap_sunken_area_diam/2-power_plug_bevel_od/2-space_from_wall-sunken_bevel_height;
      //pos_y = front*(sunken_bevel_height+power_plug_bevel_od/2+space_from_wall);
      //pos_y = front*(power_plug_hole_diam/4);
      //pos_y = plywood_thickness-wall_thickness*2-power_plug_nut_od/2-1;
      pos_y = 0;
      translate([x*pos_x,pos_y,-end_cap_thickness]) {
        children();
      }
    }
  }

  module body() {
    translate([0,0,bottom*end_cap_thickness/2]) {
      end_cap_base(bottom, end_cap_sunken_area_depth);
    }

    intersection() {
      position_proto_holes() {
        hull() {
          post_height = pcb_width(RPI0)-proto_bevel_od;
          post_depth = 10;
          //hole(proto_bevel_od,0.1,resolution);
          translate([0,-post_height/2,0]) {
            rounded_cube(proto_bevel_id,post_height+proto_bevel_id,proto_bevel_height*2,proto_bevel_id,resolution);
            rounded_cube(proto_bevel_od,post_height+proto_bevel_od,0.01,proto_bevel_od,resolution);
          }
        }
      }
      cube([end_cap_diam,end_cap_diam*3,end_cap_sunken_area_depth*2+1],center=true);
    }

    position_proto() {
      % proto_board();

      translate([0,0,-proto_thickness/2-proto_dist_above_rpi-pcb_thickness(RPI0)]) {
        % pcb(RPI0);
      }
    }
  }

  module keyswitch_hole() {
    //rounded_cube(switch_cavity_width,switch_cavity_width,switch_cavity_depth*2,wall_thickness*2,resolution);
    cube([switch_cavity_width,switch_cavity_width,switch_cavity_depth*2],center=true);
    cube([keyswitch_hole_side,keyswitch_hole_side,end_cap_thickness*3],center=true);
  }

  module holes() {
    for(x=[left,0,right]) {
      //translate([x*(keycap_spacing),front*(switch_cavity_width/2),0]) {
      translate([x*(keycap_spacing),keyswitch_pos_y,0]) {
        keyswitch_hole();
      }
    }

    translate([0,front*(switch_cavity_width/2+keycap_spacing),0]) {
      // keyswitch_hole();
    }

    position_power_plug() {
      diff = power_plug_bevel_od - power_plug_hole_diam;
      hull() {
        hole(power_plug_bevel_id,power_plug_bevel_height*2,resolution);
        hole(power_plug_hole_diam,power_plug_bevel_height*2+diff,resolution);
      }

      hole(power_plug_hole_diam,end_cap_thickness*2+1,resolution);
      translate([0,0,bottom_thickness+end_cap_thickness/2]) {
        hole(power_plug_nut_od,end_cap_thickness,resolution);
      }
    }

    // ventilation holes
    vent_hole_diam = 3;
    translate([0,keyswitch_pos_y-keycap_spacing/2-2-vent_hole_diam/2,0]) {
      //rounded_cube(25,vent_hole_diam,end_cap_thickness*3,vent_hole_diam,resolution);
    }
    translate([0,keyswitch_pos_y+keycap_spacing/2+2+vent_hole_diam/2,0]) {
      //rounded_cube(40,vent_hole_diam,end_cap_thickness*3,vent_hole_diam,resolution);
    }

    position_proto() {
      for(y=[front,0,rear]) {
        translate([0,y*(pcb_width(RPI0)/2-vent_hole_diam/2-3),0]) {
          rounded_cube(proto_hole_spacing_x-proto_bevel_od,vent_hole_diam,end_cap_thickness*3,vent_hole_diam,resolution);
        }
      }
      translate([0,0,0]) {
      }
    }

    position_proto_holes() {
      translate([0,0,-proto_bevel_height]) {
        hole(proto_hole_diam,proto_bevel_height*2,resolution);
      }
    }
  }

  difference() {
    body();
    holes();
  }
}

module plywood_plank() {
  module body() {
    cube([plywood_width,plywood_thickness,plywood_length],center=true);
  }

  module holes() {
  }

  difference() {
    body();
    holes();
  }
}

module assembly() {
  translate([0,0,plywood_length/2]) {
    translate([0,0,top*plywood_length/2]) {
      top_end_cap();
    }
    translate([0,0,bottom*plywood_length/2]) {
      bottom_end_cap();
    }
    translate([0,plywood_thickness/2,0]) {
      color("tan", 0.9) {
        % plywood_plank();
      }
    }
    translate([0,0,0]) {
      color("white", 0.9) {
        cube([led_strip_width,1,led_strip_length],center=true);
      }
    }
  }
}

assembly();
