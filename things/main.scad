include <lumpyscad/lib.scad>;

pi_approx = 3.14159;
tolerance = 0.2;

resolution = 128;

psu_width = 100; // actual is 98, but cheapo PSU is not square
psu_height = 43;
psu_length = 200;
psu_indent_terminal = 15.5;
psu_indent_opposite_wiring = 7.5;

extrude_width = 0.5;
extrude_height = 0.28;
wall_thickness = extrude_width*2;
floor_thickness = extrude_height*8;
rounded_diam = wall_thickness*2;

keyswitch_hole_side = 14 + tolerance;
keyswitch_retainer_ledge_thickness = 1.2;
keycap_hole_side = 20 + rounded_diam;

sheet_metal_thickness = 1.5;

led_strip_length = 1000;

angle_aluminum_side = 1.5*inch; // FIXME: actually measure
angle_aluminum_thickness = 1/8*inch; // FIXME: actually measure
angle_aluminum_length = led_strip_length-1/2*inch;
angle_aluminum_from_board = 1/4*inch;

extra_space_for_angle_aluminum = 1*inch;

overall_rearside_depth = psu_height + wall_thickness*2;
overall_width = psu_width+wall_thickness*4;

plywood_thickness = 17.5; // 3/4*inch;
//plywood_width = 4*inch;
plywood_width = overall_width;
//plywood_length = 48*inch;
plywood_length = angle_aluminum_length+extra_space_for_angle_aluminum;

angle_aluminum_mount_screw_diam = 0.19*inch + tolerance*2; // #10 screw with plenty of wiggle room

screw_diam = 4.5;
screw_head_diam = 12;
screw_length = 31;
screw_hole_body_length = screw_length-plywood_thickness+1; // + 1 to avoid screw poking out other side of wood

wiring_hole_from_end = extra_space_for_angle_aluminum*0.3;
wiring_hole_diam = 1/2*inch;;

end_cap_thickness = 1/2*inch;
end_cap_center_pos_y = front*(angle_aluminum_from_board+1.25*inch);
end_cap_diam = plywood_width;
top_brace_height = 4*inch;
screw_area_width = screw_head_diam+wall_thickness*4;
top_cavity_width = overall_width-screw_area_width*2;

room_for_wires = 2.25*inch;

rpi_mount_thickness = 4;
rpi_detent_height = 5;
rpi_from_top = top_brace_height - rasp_a_plus_max_x*0.8;
rpi_detent_from_top = rpi_from_top*.4+rpi_detent_height/2;

echo("end_cap_diam (mm): ", end_cap_diam);
echo("end_cap_diam (in): ", end_cap_diam/25.4);

diffuser_width = (pi_approx*end_cap_diam)/2 + 2*(end_cap_center_pos_y);
diffuser_length = plywood_length;

cover_width = diffuser_width + 2*(plywood_thickness+overall_rearside_depth);
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

module angle_aluminum_profile() {
  for(side=[left,right]) {
    mirror([side-1,1-side,0]) {
      translate([angle_aluminum_thickness/2,angle_aluminum_side/2,0]) {
        square([angle_aluminum_thickness,angle_aluminum_side],center=true);
      }
    }
  }
}

module angle_aluminum(height=10) {
  color("lightgrey",0.4) {
    linear_extrude(height=height,center=true,convexity=3) {
      angle_aluminum_profile();
    }
  }
}

module psu() {
  module body() {
    indent_width = 85;
    translate([psu_width/2-indent_width/2,psu_length/2-psu_indent_opposite_wiring,0]) {
      indent_outside_height = 10;
      indent_inside_height = 15;
      hull() {
        translate([0,-sheet_metal_thickness/2,indent_inside_height/2]) {
          cube([indent_width,sheet_metal_thickness,indent_inside_height],center=true);
        }
        translate([0,0,indent_outside_height/2]) {
          rotate([0,90,0]) {
            rounded_cube(indent_outside_height,psu_indent_opposite_wiring*2,indent_width,5,resolution);
          }
        }
      }
    }
    translate([0,0,sheet_metal_thickness/2]) {
      cube([psu_width,psu_length,sheet_metal_thickness],center=true);
    }
    translate([psu_width/2-sheet_metal_thickness/2,0,psu_height/2]) {
      cube([sheet_metal_thickness,psu_length,psu_height],center=true);
    }
    psu_full_height_length = psu_length - psu_indent_opposite_wiring - psu_indent_terminal;
    translate([0,-psu_length/2+psu_indent_terminal+psu_full_height_length/2,psu_height/2]) {
      cube([psu_width,psu_full_height_length,psu_height],center=true);
    }
  }

  module holes() {
  }

  difference() {
    body();
    holes();
  }
}


module angle_aluminum_mount() {
  mount_width = angle_aluminum_mount_screw_diam + 1/2*inch;
  mount_length = mount_width*2;
  max_height = angle_aluminum_from_board+mount_width*0.4;
  rounded_diam = 5;

  module body() {
    translate([0,0,max_height/2]) {
      rounded_cube(mount_width,mount_length,max_height,rounded_diam,resolution);
    }
  }

  module holes() {
    hole(angle_aluminum_mount_screw_diam,max_height*3,resolution);
    translate([0,0,angle_aluminum_from_board]) {
      max_side = 10*inch;
      rotate([90,0,0]) {
        rotate([0,0,45]) {
          translate([max_side/2,max_side/2,0]) {
            rounded_cube(max_side,max_side,mount_length*2,rounded_diam);
          }
        }
        translate([0,mount_width/2-rounded_diam/2*0.2,0]) {
          rounded_cube(rounded_diam/2,mount_width,mount_length*2,rounded_diam/2);
        }
      }
    }
  }

  difference() {
    body();
    holes();
  }
}

module screen_support() {
  module body() {

  }

  module holes() {

  }

  difference() {
    body();
    holes();
  }
}

module end_cap_base_profile() {
  module body() {
    hull() {
      translate([0,end_cap_center_pos_y,-end_cap_thickness/2]) {
        accurate_circle(end_cap_diam,resolution);
      }
      translate([0,plywood_thickness+overall_rearside_depth/2,0]) {
        rounded_square(end_cap_diam,overall_rearside_depth,rounded_diam,resolution);
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

module end_cap_holes(side=top) {
  threaded_hole_depth = 8;

  sunken_area_diam = end_cap_diam-2*(threaded_hole_depth+wall_thickness*2);

  // screw holes
  translate([0,end_cap_center_pos_y,end_cap_thickness/2*side]) {
    num_screw_holes = 4;
    angle_between_holes = 180/(num_screw_holes-1);
    for(i=[0:num_screw_holes-1]) {
      rotate([0,0,i*angle_between_holes]) {
        translate([front*end_cap_diam/2,0,0]) {
          rotate([0,90,0]) {
            hole(m3_threaded_insert_diam,threaded_hole_depth*2,resolution);
          }
        }
      }
    }

    depth_to_go = abs(end_cap_center_pos_y)+plywood_thickness+overall_rearside_depth-10;
    for(x=[left,right],y=[depth_to_go/2,depth_to_go]) {
      translate([x*overall_width/2,y,0]) {
        rotate([0,90,0]) {
          hole(m3_threaded_insert_diam,threaded_hole_depth*2,resolution);
        }
      }
    }
  }


  // vent hole(s)
  inset_amount = 8;
  num_vents = 2;
  vent_diam = rounded_diam;
  vent_width = sunken_area_diam*0.6;
  vent_spacing = inset_amount+4+vent_diam;
  for(y=[0:num_vents-1]) {
    translate([0,-inset_amount-vent_diam/2-y*(vent_spacing),0]) {
      rounded_cube(vent_width,vent_diam,end_cap_thickness*3,vent_diam,resolution);
    }
  }

  /*
  num_vent_holes = 6;
  vent_hole_spacing_diam = sunken_area_diam*0.8;
  vent_hole_diam = (pi_approx*vent_hole_spacing_diam)*0.7/(num_vent_holes+wall_thickness*4);
  angle_per_hole = 360/num_vent_holes;

  translate([0,end_cap_center_pos_y,0]) {
    hole(vent_hole_diam,end_cap_thickness*4,resolution);
    for(i=[0:num_vent_holes-1]) {
      rotate([0,0,i*angle_per_hole]) {
        translate([0,vent_hole_spacing_diam/2-vent_hole_diam/2,0]) {
          hole(vent_hole_diam,end_cap_thickness*4,resolution);
        }
      }
    }
  }
  */

  for(x=[left,right]) {
    translate([x*(end_cap_diam*0.3),plywood_thickness/2,0]) {
      hole(screw_diam,end_cap_thickness*3,resolution/2);
      translate([0,0,end_cap_thickness*side]) {
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

  // reduce plastic usage
  hull() {
    depth = end_cap_thickness-extrude_height*4;
    translate([0,end_cap_center_pos_y,0]) {
      difference() {
        hole(sunken_area_diam,2*depth,resolution);
        translate([0,sunken_area_diam/2,0]) {
          cube([sunken_area_diam+1,sunken_area_diam,end_cap_thickness*3],center=true);
        }
      }
    }
    translate([0,-rounded_diam,0]) {
      rounded_cube(sunken_area_diam,rounded_diam*2,2*depth,rounded_diam*2,resolution);
    }
  }
}

module top_end_cap() {
  rpi_retainer_thickness = wall_thickness*2;
  rpi_retainer_tolerance = 1.2;
  rpi_retainer_width = (top_cavity_width-rasp_a_plus_max_y-1)/2;
  rpi_retainer_length = top_brace_height-rpi_from_top;

  module body() {
    translate([0,0,end_cap_thickness/2]) {
      linear_extrude(height=end_cap_thickness,center=true,convexity=3) {
        end_cap_base_profile();
      }
    }

    for(x=[left,right]) {
      translate([x*(top_cavity_width/2+screw_area_width/2),plywood_thickness+overall_rearside_depth/2,-top_brace_height/2]) {
        rounded_cube(screw_area_width,overall_rearside_depth,top_brace_height,rounded_diam,resolution);
      }

      translate([x*top_cavity_width/2,plywood_thickness+rpi_retainer_tolerance,-top_brace_height+rpi_retainer_length/2]) {
        translate([0,rpi_mount_thickness+rpi_retainer_thickness/2,0]) {
          rounded_cube(rpi_retainer_width*2,rpi_retainer_thickness,rpi_retainer_length,rounded_diam,resolution);
        }
        overall_thickness = rpi_mount_thickness+rpi_retainer_thickness;
        translate([0,overall_thickness/2,rpi_retainer_length/2]) {
          translate([0,0,0.5]) {
            hull() {
              rounded_cube(rpi_retainer_width*2,overall_thickness,1,rounded_diam,resolution);
              translate([x*rpi_retainer_width,0,rpi_retainer_width*3]) {
                rounded_cube(rounded_diam,overall_thickness,1,rounded_diam,resolution);
              }
            }
          }
        }
      }
    }
  }

  module holes() {
    for(x=[left,right],z=[top,bottom]) {
      translate([x*(end_cap_diam/2-screw_area_width/2),plywood_thickness+overall_rearside_depth,-top_brace_height/2+z*(top_brace_height*0.45-screw_area_width/2)]) {
        // face of plywood
        rotate([90,0,0]) {
          hole(screw_diam,overall_rearside_depth*3,resolution);
          hole(screw_head_diam,2*(overall_rearside_depth-screw_hole_body_length),8);
        }
      }
    }

    // slot/hook to hang on the wall with as well as a vent hole
    // slot_hole_width = (end_cap_diam-screw_area_width*2-extrude_width)*0.6;
    slot_hole_width = overall_width*0.5;
    slot_hole_height = end_cap_thickness+0.05;
    slot_hole_depth = 20;
    translate([0,plywood_thickness+overall_rearside_depth-extrude_width*4-slot_hole_depth/2,-0.1]) {
      hull() {
        rounded_cube(overall_width-screw_area_width*2-wall_thickness*3,slot_hole_depth,0.2,rounded_diam,resolution);
        rounded_cube(slot_hole_width,rounded_diam,0.2+slot_hole_height*2,rounded_diam,resolution);
      }
    }
    translate([0,plywood_thickness+keycap_hole_side/2,end_cap_thickness]) {
      switch_hole_depth = end_cap_thickness-keyswitch_retainer_ledge_thickness;

      for(x=[left,0,right]) {
        translate([x*(keycap_hole_side*1+wall_thickness*2),0,0]) {
          rounded_cube(keycap_hole_side,keycap_hole_side,switch_hole_depth*2,rounded_diam,resolution);
          cube([keyswitch_hole_side,keyswitch_hole_side,end_cap_thickness*3],center=true);

          // allow bridging across the hole
          cube([keyswitch_hole_side,keycap_hole_side,2*(switch_hole_depth+extrude_height)],center=true);
        }
      }
    }

    for(x=[left,right]) {
      translate([x*top_cavity_width/2,plywood_thickness,-rpi_from_top-rpi_detent_from_top]) {
        hull() {
          depth = 2*(rpi_mount_thickness+rpi_retainer_tolerance);
          rotate([0,45,0]) {
            cube([rpi_detent_height,depth,rpi_detent_height],center=true);
          }
        }
      }
    }

    end_cap_holes(top);
  }

  difference() {
    body();
    holes();
  }
}

module bottom_end_cap() {
  case_overlap = 5;
  overall_height = case_overlap + psu_indent_terminal + room_for_wires + 5;

  module body() {
    translate([0,plywood_thickness+overall_rearside_depth/2,-end_cap_thickness+overall_height/2]) {
      rounded_cube(overall_width,overall_rearside_depth,overall_height,rounded_diam,resolution);
    }
    translate([0,plywood_thickness,-end_cap_thickness+overall_height-case_overlap-psu_indent_terminal]) {
      translate([0,0,psu_length/2]) {
        rotate([0,0,180]) {
          rotate([90,0,0]) {
            % psu();
          }
        }
      }
    }
    translate([0,0,-end_cap_thickness/2]) {
      linear_extrude(height=end_cap_thickness,center=true,convexity=3) {
        end_cap_base_profile();
      }
    }
  }

  module holes() {
    translate([0,plywood_thickness,-end_cap_thickness]) {
      translate([0,overall_rearside_depth,0]) {
        // cube([overall_width*2,overall_rearside_depth,overall_height*3],center=true);
      }
      translate([0,0,overall_height-case_overlap]) {
        translate([0,psu_height/2-0.05,0]) {
          rounded_cube(psu_width,psu_height+0.1,2*(psu_indent_terminal),extrude_width*2,resolution);
        }
        for(x=[left,right]) {
          mirror([x-1,0,0]) {
            translate([psu_width/2,0,0]) {
              round_corner_filler(wall_thickness*2,psu_indent_terminal*2);
            }
          }
        }

        // room for cables/wiring
        translate([0,overall_rearside_depth/2,-psu_indent_terminal+1]) {
          depth = overall_rearside_depth-wall_thickness*4;
          hull() {
            rounded_cube(psu_width-wall_thickness*2,depth,2,wall_thickness*4,resolution);
            rounded_cube(overall_width-screw_area_width*2,depth,2*(screw_area_width-wall_thickness*2),wall_thickness*4,resolution);
          }
          rounded_cube(overall_width-screw_area_width*2,depth,(room_for_wires)*2,wall_thickness*4,resolution);
        }
      }

      for(x=[left,right]) {
        // face of plywood
        translate([x*(psu_width/2-screw_head_diam/2),0,room_for_wires-screw_area_width-extrude_height*4]) {
          rotate([-90,0,0]) {
            hole(screw_diam,overall_height*2,resolution);
            translate([0,0,overall_height/2+15]) {
              hole(screw_head_diam,overall_height,8);
            }
          }
        }
      }

      // access angle aluminum post retainer screw
      translate([0,0,room_for_wires-screw_area_width]) {
        rotate([-90,0,0]) {
          hole(screw_head_diam,overall_height*3,8);
        }
      }

      // high voltage input
      power_cable_diam = 15;
      translate([-20,psu_height-wall_thickness*2-power_cable_diam/2,0]) {
        hole(power_cable_diam,end_cap_thickness*4,resolution);

        // zip tie strain relief -- or on the plywood backing?
        zip_tie_spacing = 10;
        for(x=[-1,-2],y=[front,rear]) {
          translate([power_cable_diam/2-(x*zip_tie_spacing),y*power_cable_diam/3,0]) {
            rounded_cube(3,2,end_cap_thickness*4,2);
          }
        }
      }
    }

    // vent hole(s)
    inset_amount = 7;
    num_vents = 2;
    vent_diam = rounded_diam;
    vent_width = overall_width*0.5;
    vent_spacing = inset_amount+vent_diam;
    for(y=[0:num_vents-1]) {
      translate([0,plywood_thickness+wall_thickness*2+vent_diam/2+inset_amount+y*(vent_spacing),0]) {
        rounded_cube(vent_width,vent_diam,end_cap_thickness*3,vent_diam,resolution);
      }
    }

    translate([0,0,wiring_hole_from_end]) {
      rotate([90,0,0]) {
        hole(wiring_hole_diam,psu_height,8);
      }
    }

    end_cap_holes(bottom);
  }

  difference() {
    body();
    holes();
  }
}

module angle_aluminum_assembly() {
  translate([0,0,angle_aluminum_length/2+extra_space_for_angle_aluminum/2]) {
    translate([0,front*angle_aluminum_from_board,0]) {
      % color("lightgrey", 0.99) {
        difference() {
          rotate([0,0,-135]) {
            angle_aluminum(angle_aluminum_length);
          }
          position_angle_aluminum_mounts() {
            hole(angle_aluminum_mount_screw_diam+0.4,plywood_thickness*4,resolution/4);
          }
        }
      }
    }
    position_angle_aluminum_mounts() {
      angle_aluminum_mount();
    }
  }
}

module plywood_plank() {
  module body() {
    cube([plywood_width,plywood_thickness,plywood_length],center=true);
  }

  module holes() {
    position_angle_aluminum_mounts() {
      hole(angle_aluminum_mount_screw_diam-0.2,plywood_thickness*4,resolution/4);
    }

    for(z=[top,bottom]) {
      translate([0,0,z*(plywood_length/2-wiring_hole_from_end)]) {
        rotate([90,0,0]) {
          // wire access hole
          hole(wiring_hole_diam,100,resolution);
        }
      }
    }
  }

  difference() {
    body();
    holes();
  }
}

module rpi_mount() {
  mount_height = 10;
  hole_diam = 2.3;

  arm_length = 18;
  arm_thickness = wall_thickness*2;

  width = top_cavity_width-1;
  depth = rasp_a_plus_max_x;

  module position_rpi() {
    rotate([0,0,90]) {
      translate([-rasp_a_plus_max_x/2,-rasp_a_plus_max_y/2,mount_height]) {
        children();
      }
    }
  }

  module plate_profile() {
    additional_detent_size = 0.1;
    module body() {
      difference() {
        rounded_square(width,depth,rounded_diam,resolution);
        for(x=[left,right]) {
          translate([x*width/2,-depth/2+rpi_detent_from_top+arm_length/2-rpi_detent_height/2,0]) {
            rounded_square(2*(arm_thickness+rpi_detent_height),arm_length+rpi_detent_height,rounded_diam,resolution);
          }
        }
      }
      for(x=[left,right]) {
        mirror([x-1,0,0]) {
          translate([width/2,-depth/2+rpi_detent_from_top,0]) {
            translate([-arm_thickness/2,arm_length/2,0]) {
              rounded_square(arm_thickness,arm_length+arm_thickness,arm_thickness,resolution);
            }
            translate([-arm_thickness+rpi_detent_height/2,0,0]) {
              accurate_circle(rpi_detent_height,resolution);
            }
            translate([-arm_thickness,arm_length,0]) {
              rotate([0,0,180]) {
                round_corner_filler_profile(rounded_diam);
              }
            }
          }
        }
      }
    }

    module holes() {
      for(x=[left,right]) {
        mirror([x-1,0,0]) {
          translate([width/2,-depth/2+rpi_detent_from_top-rpi_detent_height,0]) {
            rotate([0,0,180]) {
              round_corner_filler_profile(rounded_diam);
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

  module body() {
    translate([0,0,rpi_mount_thickness/2]) {
      linear_extrude(height=rpi_mount_thickness,center=true,convexity=3) {
        plate_profile();
      }
    }

    position_rpi() {
      position_pi_holes() {
        translate([0,0,-mount_height/2]) {
          hole(hole_diam+wall_thickness*4,mount_height,resolution);
        }
      }
    }
  }

  module holes() {
    position_rpi() {
      position_pi_holes() {
        hole(hole_diam,mount_height*3,resolution);
      }
    }
  }

  position_rpi() {
    % raspi_3a();
  }

  difference() {
    body();
    holes();
  }
}

module position_angle_aluminum_mounts() {
  num_posts = 4;
  total_space = angle_aluminum_length-35;
  spacing = total_space/(num_posts-1);
  for(z=[0:num_posts-1]) {
    translate([0,0,total_space/2-z*spacing]) {
      rotate([90,0,0]) {
        children();
      }
    }
  }
}

module assembly() {
  translate([0,0,plywood_length/2]) {
    translate([0,0,plywood_length/2]) {
      color("lightblue") top_end_cap();
    }
    translate([0,0,-plywood_length/2]) {
      bottom_end_cap();
    }
    translate([0,plywood_thickness/2,0]) {
      color("white", 0.9) {
        % plywood_plank();
      }
    }
  }

  translate([0,plywood_thickness,plywood_length-rpi_from_top-rasp_a_plus_max_x/2]) {
    rotate([-90,0,0]) {
      rpi_mount();
    }
  }

  angle_aluminum_assembly();
}

assembly();
