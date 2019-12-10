var yourVlSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  title: "Seattle Weather, 2012-2015",
  data: {
    url: "/laboratory-data.csv"
  },
  vconcat: [
    {
      encoding: {
        color: {
          condition: {
            title: "Weather",
            field: "weather",
            scale: {
              domain: ['ABT', 'BOE', 'BQF', 'BTS', 'CHV', 'CSL', 'GFR', 'GFRU', 'IDF', 'JAC', 'LST', 'MCK', 'MDH', 'NNK', 'NOV', 'NVM', 'PAS', 'PFI', 'PRO', 'RCH', 'ROP', 'SDZ', 'SFI', 'SPA', 'TEC'],
              range: ["#e7ba52", "#a7a7a7", "#aec7e8", "#1f77b4", "#9467bd", "#e7ba52", "#a7a7a7", "#aec7e8", "#1f77b4", "#9467bd", "#e7ba52", "#a7a7a7", "#aec7e8", "#1f77b4", "#9467bd", "#e7ba52", "#a7a7a7", "#aec7e8", "#1f77b4", "#9467bd", "#e7ba52", "#a7a7a7", "#aec7e8", "#1f77b4", "#9467bd"]
            },
            selection: "brush",
            type: "nominal"
          },
          value: "lightgray"
        },
        size: {
          title: "Precipitation",
          field: "precipitation",
          scale: {"domain": [-1, 50]},
          type: "quantitative"
        },
        x: {
          axis: {"title": "Date", "format": "%b"},
          field: "date",
            scale: {"domain": [2017, 2019]},
          timeUnit: "monthdate",
          type: "temporal"
        },
        y: {
          axis: {"title": "Maximum Daily Temperature (C)"},
          field: "temp_max",
          scale: {"domain": [-5, 40]},
          type: "quantitative"
        }
      },
      width: 900,
      height: 600,
      mark: "point",
      selection: {"brush": {"encodings": ["x"], "type": "interval"}},
      transform: [{"filter": {"selection": "click"}}]
    },
    {
      encoding: {
        color: {
          condition: {
            field: "weather",
            scale: {
              domain: ['ABT', 'BOE', 'BQF', 'BTS', 'CHV', 'CSL', 'GFR', 'GFRU', 'IDF', 'JAC', 'LST', 'MCK', 'MDH', 'NNK', 'NOV', 'NVM', 'PAS', 'PFI', 'PRO', 'RCH', 'ROP', 'SDZ', 'SFI', 'SPA', 'TEC'],
              range: ["#e7ba52", "#a7a7a7", "#aec7e8", "#1f77b4", "#9467bd", "#e7ba52", "#a7a7a7", "#aec7e8", "#1f77b4", "#9467bd", "#e7ba52", "#a7a7a7", "#aec7e8", "#1f77b4", "#9467bd", "#e7ba52", "#a7a7a7", "#aec7e8", "#1f77b4", "#9467bd", "#e7ba52", "#a7a7a7", "#aec7e8", "#1f77b4", "#9467bd"]
            },
            selection: "click",
            type: "nominal"
          },
          value: "lightgray"
        },
        x: {"aggregate": "count", "type": "quantitative"},
        y: {"title": "Weather", "field": "weather", "type": "nominal"}
      },
      width: 900,
      mark: "bar",
      selection: {"click": {"encodings": ["color"], "type": "multi"}},
      transform: [{"filter": {"selection": "brush"}}]
    }
  ]
}
vegaEmbed('#vis', yourVlSpec);






/*var yourVlSpec = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  title: "Seattle Weather, 2012-2015",
  data: {
    url: "https://gist.githubusercontent.com/chanwutk/61eb62164abce3d1f254867e238f153f/raw/3010251bfb077964d853d780229d77490d2a185c/seattle-weather.csv"
  },
  vconcat: [
    {
      encoding: {
        color: {
          condition: {
            title: "Weather",
            field: "weather",
            scale: {
              domain: ["sun", "fog", "drizzle", "rain", "snow"],
              range: ["#e7ba52", "#a7a7a7", "#aec7e8", "#1f77b4", "#9467bd"]
            },
            selection: "brush",
            type: "nominal"
          },
          value: "lightgray"
        },
        size: {
          title: "Precipitation",
          field: "precipitation",
          scale: {"domain": [-1, 50]},
          type: "quantitative"
        },
        x: {
          axis: {"title": "Date", "format": "%b"},
          field: "date",
          timeUnit: "monthdate",
          type: "temporal"
        },
        y: {
          axis: {"title": "Maximum Daily Temperature (C)"},
          field: "temp_max",
          scale: {"domain": [-5, 40]},
          type: "quantitative"
        }
      },
      width: 600,
      height: 300,
      mark: "point",
      selection: {"brush": {"encodings": ["x"], "type": "interval"}},
      transform: [{"filter": {"selection": "click"}}]
    },
    {
      encoding: {
        color: {
          condition: {
            field: "weather",
            scale: {
              domain: ["sun", "fog", "drizzle", "rain", "snow"],
              range: ["#e7ba52", "#a7a7a7", "#aec7e8", "#1f77b4", "#9467bd"]
            },
            selection: "click",
            type: "nominal"
          },
          value: "lightgray"
        },
        x: {"aggregate": "count", "type": "quantitative"},
        y: {"title": "Weather", "field": "weather", "type": "nominal"}
      },
      width: 600,
      mark: "bar",
      selection: {"click": {"encodings": ["color"], "type": "multi"}},
      transform: [{"filter": {"selection": "brush"}}]
    }
  ]
}
vegaEmbed('#vis', yourVlSpec);
*/