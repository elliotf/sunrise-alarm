include <NopSCADlib/lib.scad>
use <./full-size.scad>;
include <lumpyscad/lib.scad>;

pi_approx = 3.14159;
tolerance = 0.2;

resolution = 128;

extrude_width = 0.4;
extrude_height = 0.28;
wall_thickness = extrude_width*2;
floor_thickness = extrude_height*8;
rounded_diam = wall_thickness*2;

led_strip_length = 250;

angle_aluminum_side = 1.5*inch; // FIXME: actually measure
angle_aluminum_thickness = 1/8*inch; // FIXME: actually measure
angle_aluminum_length = led_strip_length+1/2*inch;
angle_aluminum_from_board = 1/4*inch;

angle_aluminum_mount_screw_diam = 0.19*inch + tolerance*2; // #10 screw with plenty of wiggle room

// copied from full-size.scad
al_mount_width = angle_aluminum_mount_screw_diam + 1/2*inch;
al_mount_length = al_mount_width*2;
al_max_height = angle_aluminum_from_board+al_mount_width*0.4;

overall_width = 150;
overall_height = led_strip_length + 10;

module main_body_wholly_printed_maybe() {
  module position_rpi() {
    translate([0,0,60]) {
      rotate([-90,0,0]) {
        rotate([0,0,90]) {
          //translate([-pcb_length(RPI0)/2,-pcb_width(RPI0)/2,0]) {
            children();
          //}
        }
      }
    }
  }

  position_rpi() {
    % pcb(RPI0);
  }

  module body_profile() {
    rounded_diam = 1/2*inch;

    module shape(inset=0) {
      hull() {
        translate([0,-1/2*inch,0]) {
          rounded_square(overall_width-inset*2,1*inch-inset*2,rounded_diam-inset*2,resolution);
        }
        translate([0,-1*inch,0]) {
          intersection() {
            translate([0,-overall_width/2,0]) {
              square([overall_width*2,overall_width],center=true);
            }
            accurate_circle(overall_width-inset*2,resolution*3);
          }
        }
      }
    }

    difference() {
      shape(0);
      shape(extrude_width*2);
    }
  }

  module body() {
    translate([0,0,overall_height/2]) {
      linear_extrude(height=overall_height,center=true,convexity=3) {
        body_profile();
      }
    }
  }

  module holes() {
    position_rpi() {
      pcb_hole_positions(RPI0) {
        // hole(2.5,20,resolution);
      }
    }

    /*
    rotate([90,0,0]) {
      hole(angle_aluminum_mount_screw_diam,al_max_height*3,resolution);
      translate([0,0,angle_aluminum_from_board]) {
        max_side = 4*inch;
        max_length = angle_aluminum_length*3;
        rotate([90,0,0]) {
          rotate([0,0,45]) {
            translate([max_side/2,max_side/2,0]) {
              cube([max_side,max_side,max_length],center=true);
            }
          }
        }
      }
    }
    */
  }

  difference() {
    body();
    holes();
  }
}

module position_rpi() {
  translate([0,0,60]) {
    rotate([-90,0,0]) {
      rotate([0,0,90]) {
        //translate([-pcb_length(RPI0)/2,-pcb_width(RPI0)/2,0]) {
          children();
        //}
      }
    }
  }
}

module main_body() {
  module body_profile() {
    rounded_diam = 1/2*inch;

    module shape(inset=0) {
      hull() {
        translate([0,-1/2*inch,0]) {
          rounded_square(overall_width-inset*2,1*inch-inset*2,rounded_diam-inset*2,resolution);
        }
        translate([0,-1*inch,0]) {
          intersection() {
            translate([0,-overall_width/2,0]) {
              square([overall_width*2,overall_width],center=true);
            }
            accurate_circle(overall_width-inset*2,resolution*3);
          }
        }
      }
    }

    difference() {
      shape(0);
      shape(extrude_width*2);
    }
  }

  module body() {
    translate([0,0,overall_height/2]) {
      linear_extrude(height=overall_height,center=true,convexity=3) {
        body_profile();
      }
    }
  }

  module holes() {
    position_rpi() {
      pcb_hole_positions(RPI0) {
        // hole(2.5,20,resolution);
      }
    }

    /*
    rotate([90,0,0]) {
      hole(angle_aluminum_mount_screw_diam,al_max_height*3,resolution);
      translate([0,0,angle_aluminum_from_board]) {
        max_side = 4*inch;
        max_length = angle_aluminum_length*3;
        rotate([90,0,0]) {
          rotate([0,0,45]) {
            translate([max_side/2,max_side/2,0]) {
              cube([max_side,max_side,max_length],center=true);
            }
          }
        }
      }
    }
    */
  }

  difference() {
    body();
    holes();
  }
}

module angle_aluminum_assembly() {
  translate([0,0,angle_aluminum_length/2]) {
    translate([0,front*angle_aluminum_from_board,0]) {
      % color("lightgrey", 0.99) {
        rotate([0,0,-135]) {
          angle_aluminum(angle_aluminum_length);
        }
      }
    }
  }
}

module assembly() {
  main_body();
  angle_aluminum_assembly();
  position_rpi() {
    % pcb(RPI0);
  }
}

assembly();
