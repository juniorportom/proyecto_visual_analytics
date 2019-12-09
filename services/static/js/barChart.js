/* global d3 */

function barChart() {
  const container_b_1 = $('#cardYears');
  var margin = {top: 20, right: 20, bottom: 30, left: 60},
      width = container_b_1.width() - margin.left - margin.right,
    height = 220 - margin.top - margin.bottom,
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom,
    xValue = function(d) { return d[0]; },
    yValue = function(d) { return d[1]; },
    xScale = d3.scaleBand().padding(0.5),
    yScale = d3.scaleLinear(),
    onMouseOver =  () => { },
    onMouseOut =  () => { };

  function chart(selection) {
    selection.each(function (data) {

        if(data.length === 12){
            data = data.sort(function(x, y){
                let a = Number(x.key), b =  Number(y.key);
               return d3.ascending(a, b);
            });
        }

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var svgEnter = svg.enter().append("svg");
      var gEnter = svgEnter.append("g");
      gEnter.append("g").attr("class", "x axis");
      gEnter.append("g").attr("class", "y axis");

      innerWidth = width - margin.left - margin.right,
      innerHeight = height - margin.top - margin.bottom,

      // Update the outer dimensions.
      svg.merge(svgEnter).attr("width", width)
        .attr("height", height);

      // Update the inner dimensions.
      var g = svg.merge(svgEnter).select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      xScale.rangeRound([0, innerWidth])
        .domain(data.map(xValue));
      yScale.rangeRound([innerHeight, 0])
        .domain([0, d3.max(data, yValue)]).nice();

      g.select(".x.axis")
          .attr("transform", "translate(0," + innerHeight + ")")
          .call(d3.axisBottom(xScale));

      g.select(".y.axis")
          .call(d3.axisLeft(yScale).ticks(8))
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -58)
          .attr("dy", "0.71em")
          .text("Número de Pacientes")
          .attr('fill', 'black');

      var bars = g.selectAll(".bar")
        .data(function (d) { return d; });

      bars.enter().append("rect")
          .attr("class", "bar")
        .merge(bars)
          .attr("x", X)
          .attr("y", Y)
          .style('cursor', 'pointer')
          .attr("width", xScale.bandwidth())
          .attr("height", function(d) { return innerHeight - Y(d); })
          .on("mouseover", onMouseOver)
          .on("mouseout", onMouseOut);

      bars.exit().remove();

      var text = g.selectAll(".text")
        .data(function (d) { return d; });

      text.enter().append("text")
          .attr("class", "text")
        .merge(text)
          .attr("x", d => X(d) + xScale.bandwidth() / 2)
          .attr("y", d => Y(d) - 3)
          .text(d => d.value > 0 ? d.value : '')
          .attr("text-anchor", "middle")
          .attr("font-family", "sans-serif")
          .attr("font-size", "11px")
          .attr("fill", "black")
          .style('cursor', 'pointer')
          .on("mouseout", onMouseOut)
          .on("mouseover", onMouseOver);
      text.exit().remove();

    });

  }

// The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(xValue(d));
  }

  // The y-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(yValue(d));
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.onMouseOver = function(_) {
    if (!arguments.length) return onMouseOver;
    onMouseOver = _;
    return chart;
  };

  chart.onMouseOut = function(_) {
    if (!arguments.length) return onMouseOut;
    onMouseOut = _;
    return chart;
  };


  return chart;
}