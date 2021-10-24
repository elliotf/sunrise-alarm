all: render

define render_template

render: $(1)

$(1) : $(1).scad
	openscad-nightly -m make -o $$@.stl $$^ && echo $$^
	notify-send 'Done rendering $$^'

.PHONY : $(1)

endef

scads := $(foreach scad, $(wildcard *.scad),$(patsubst %.scad,%,$(notdir $(scad))))

$(foreach scad, $(scads), $(eval $(call render_template,$(scad))))
