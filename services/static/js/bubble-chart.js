var yourVlSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  data: {
    url: "/laboratory-data.csv",
    format: {"type": "csv"}
  },
  vconcat: [
    {
      encoding: {
        color: {
          condition: {
            title: "Laboratorios",
            field: "codigo_laboratorio",
            scale: {
              "scheme": "category20b"
            },
            selection: "brush",
            type: "nominal"
          },
          value: "lightgray"
        },
        size: {
          title: "Prescripciones",
          field: "cantidad_prescripciones",
          scale: {"domain": [0, 200]},
          type: "quantitative"
        },
        x: {
          axis: {"title": "Fecha de Prescripción", "format": "%b"},
          formatType: "time",
          field: "fecha_prescipcion_amd",
          timeUnit: "monthdate",
          type: "temporal"
        },
        y: {
          axis: {"title": "Costos Asociados"},
          field: "Valor_Medio",
          scale: {"domain": [0, 10000000]},
          type: "quantitative"
        }
      },
      width: 900,
      height: 600,
      mark: {"type": "point", "tooltip": true},
      selection: {"brush": {"encodings": ["x"], "type": "interval"}},
      transform: [{"filter": {"selection": "click"}}]
    },
    {
      encoding: {
        color: {
          condition: {
            field: "codigo_laboratorio",
            scale: {
                "scheme": "category20b"
            },
            selection: "click",
            type: "nominal"
          },
          value: "lightgray"
        },
        x: {"aggregate": "count", "type": "quantitative"},
        y: {"title": "Laboratorios", "field": "codigo_laboratorio", "type": "nominal"}
      },
      width: 900,
      mark: "bar",
      selection: {"click": {"encodings": ["color"], "type": "multi"}},
      transform: [{"filter": {"selection": "brush"}}]
    }
  ]
};
vegaEmbed('#vega_vis', yourVlSpec);