export var style_rivers = `
sources:
    omv:
        type: OMV
# global description of the map, in this example
# the map background color is white
scene:
    background:
        color: [1.000, 1.000, 1.000, 1.00]

# section contains the style information for the layers
# that are present on the map
layers:
    # user defined name of the rendering layer
    water_areas:
        # the section defines where the rendering layer takes
        # its data from source: omv is mandatory for the Vector Tile API
        # layer: water specifies what vector layer is taken
        # for the rendering see REST API documentation for the
        # list of available layers.
        data: {source: omv, layer: water}
        # section defines how to render the layer
        draw:
            polygons:
                order: 1 # z-order of the layer
                color: [0.055, 0.604, 0.914, 1.00]
`;
export var style_road_water = `
sources:
    omv:
        type: OMV
# global description of the map, in this example
# the map background color is white
scene:
    background:
        color: [1.000, 1.000, 1.000, 1.00]

# section contains the style information for the layers
# that are present on the map
layers:
    # user defined name of the rendering layer
    water_areas:
        # the section defines where the rendering layer takes
        # its data from source: omv is mandatory for the Vector Tile API
        # layer: water specifies what vector layer is taken
        # for the rendering see REST API documentation for the
        # list of available layers.
        data: {source: omv, layer: water}
        # section defines how to render the layer
        draw:
            polygons:
                order: 1 # z-order of the layer
                color: [0.055, 0.604, 0.914, 1.00]
    road:
        data: {source: omv, layer: roads}
        draw:
            lines:
                order: 2
                color: [0.561, 0.561, 0.561, 1.00]
                width: 15

`;
export var style_road = `
sources:
    omv:
        type: OMV
# global description of the map, in this example
# the map background color is white
scene:
    background:
        color: [1.000, 1.000, 1.000, 1.00]

# section contains the style information for the layers
# that are present on the map
layers:
    # user defined name of the rendering layer
    road:
        data: {source: omv, layer: roads}
        draw:
            lines:
                order: 2
                color: [0.561, 0.561, 0.561, 1.00]
                width: 15
`;
export var style_bridges = `
sources:
  omv:
    type: OMV
layers:
  road:
    data: {source: omv, layer: roads}
    draw:
      lines:
        order: 2
        color: [0.8, 0.8, 0.8, 1.00]
        width: 3px
    bridges:
      filter:
        is_bridge: true
      draw:
        lines:
          color: red
      tertiary:
        filter:
          kind_detail: tertiary
        draw:
          lines:
            color: green
        oneway:
          filter:
            oneway: true
          draw:
            lines:
              color: blue
`