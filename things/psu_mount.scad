include <lumpyscad/lib.scad>;

resolution = 32;

psu_width = 100; // actual is 98, but cheapo PSU is not square
psu_height = 43;
psu_length = 200;
psu_indent_terminal = 15.5;
psu_indent_opposite_wiring = 7.5;

extrude_width = 0.5;
extrude_height = 0.3;
wall_thickness = extrude_width*2;
floor_thickness = extrude_height*8;

sheet_metal_thickness = 1.5;

room_for_wires = 2*inch;

screw_diam = 4.5;
screw_head_diam = 12;

angle_aluminum_side = 1.5*inch; // FIXME: actually measure
angle_aluminum_thickness = 1/8*inch; // FIXME: actually measure

plywood_thickness = 1/2*inch;

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

module psu_mount() {
  case_overlap = 5;
  overall_depth = psu_height + wall_thickness*2;
  overall_height = case_overlap + psu_indent_terminal + room_for_wires + wall_thickness*2;
  overall_width = psu_width+wall_thickness*4;

  screw_area_width = screw_head_diam+wall_thickness*4;
  screw_area_height = room_for_wires;
  screw_area_depth = psu_height;

  module cover_profile() {
    translate([0,-overall_depth/2+wall_thickness,0]) {
      rounded_square(overall_width,wall_thickness*2,wall_thickness*2,resolution);
    }
    for(x=[left,right]) {
      mirror([x-1,0,0]) {
        translate([psu_width/2+wall_thickness,0,0]) {
          rounded_square(wall_thickness*2,overall_depth,wall_thickness*2,resolution);
        }
      }
    }
  }

  module screw_mount_profile() {
    translate([0,-wall_thickness,0]) {
      rounded_square(overall_width,wall_thickness*2,wall_thickness*2,resolution);
    }
    for(x=[left,right]) {
      mirror([x-1,0,0]) {
        translate([overall_width/2-screw_area_width/2,-screw_area_depth/2,0]) {
          difference() {
            hull() {
              translate([0,front*screw_area_depth/4,0]) {
                square([screw_area_width,screw_area_depth/2],center=true);
              }
              translate([0,rear*screw_area_depth/4,0]) {
                rounded_square(screw_area_width,screw_area_depth/2,wall_thickness*2);
              }
            }
          }
          translate([-screw_area_width/2,-screw_area_depth/2,0]) {
            rotate([0,0,90]) {
              round_corner_filler_profile(wall_thickness*4,resolution);
            }
          }
          translate([-screw_area_width/2,screw_area_depth/2-wall_thickness*2,0]) {
            rotate([0,0,180]) {
              round_corner_filler_profile(wall_thickness*4,resolution);
            }
          }
        }
      }
    }
  }

  module body() {
    translate([0,front*overall_depth/2,]) {
      translate([0,0,case_overlap+psu_indent_terminal-overall_height/2]) {
        linear_extrude(height=overall_height-0.2,center=true,convexity=3) {
          cover_profile();
        }
        // bottom
        translate([0,0,-overall_height/2+floor_thickness/2]) {
          hull() {
            rounded_cube(overall_width,overall_depth,floor_thickness,wall_thickness*2);
            // flange to attach to bottom of plywood
            translate([0,overall_depth/2,0]) {
              rounded_cube(overall_width,plywood_thickness*2,floor_thickness,plywood_thickness);
            }
          }
        }
      }
    }
    translate([0,0,-room_for_wires/2-0.1]) {
      linear_extrude(height=room_for_wires+0.2,center=true,convexity=3) {
        screw_mount_profile();
      }
    }
  }

  module holes() {
    // screw holes
    for(x=[left,right]) {
      // face of plywood
      translate([x*(psu_width/2-screw_head_diam/2),0,-room_for_wires/2]) {
        rotate([90,0,0]) {
          hole(screw_diam,overall_height*2,resolution);
          translate([0,0,overall_height/2+15]) {
            hole(screw_head_diam,overall_height,8);
          }
        }
      }

      // end of plywood
      translate([x*(psu_width/4),plywood_thickness/2,0]) {
        hole(screw_diam,overall_height*2,resolution);
      }
    }

    // room for cables/wiring
    translate([0,front*overall_depth/2,1]) {
      depth = overall_depth-wall_thickness*4;
      hull() {
        rounded_cube(psu_width-wall_thickness*2,depth,2,wall_thickness*4,resolution);
        rounded_cube(overall_width-screw_area_width*2,depth,room_for_wires*0.9,wall_thickness*4,resolution);
      }
    }

    // high voltage input
    power_cable_diam = 12;
    translate([25,-wall_thickness*2-power_cable_diam/2,-room_for_wires]) {
      hole(power_cable_diam,20,resolution);

      // zip tie strain relief -- or on the plywood backing?
      zip_tie_spacing = 10;
      for(x=[-1,-2],y=[front,rear]) {
        translate([-power_cable_diam/2+(x*zip_tie_spacing),y*power_cable_diam/4,0]) {
          rounded_cube(3,2,20,2);
        }
      }
    }

    // low voltage output
    low_voltage_from_side = psu_width/2;
    output_hole_width = 10;
    output_hole_height = 15;
    translate([psu_width/2-low_voltage_from_side,front*overall_depth,-output_hole_height/2-1]) {
      rotate([90,0,0]) {
        rounded_cube(output_hole_width,output_hole_height,psu_height/2,2,8);
      }
    }
  }

  difference() {
    body();
    holes();
  }
}

module assembly() {
  translate([0,0,psu_length/2+room_for_wires]) {
    rotate([90,0,0]) {
      % psu();
    }
  }


  translate([0,0,room_for_wires]) {
    psu_mount();
  }

  angle_length = 1000;
  // angle_length = psu_length;
  translate([0,front*(psu_height+angle_aluminum_side*0.85),angle_length/2]) {
    rotate([0,0,45]) {
      % angle_aluminum(angle_length);
    }
  }
}

assembly();
