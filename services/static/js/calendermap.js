d3.csv("/personal-data").then(csv => {
  var width = 900,
    height = 105,
    cellSize = 12, // cell size
    week_days = ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'],
    month = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  var day = timeFormatEs.format("%w"),
    week = timeFormatEs.format("%U"),
    year = timeFormatEs.format("%Y"),
    format = timeFormatEs.format("%Y/%m/%d"),
    Year_Min = Number(d3.min(csv, function(d) { return year(new Date(d.Date)); })),
    Year_Max = Number(d3.max(csv, function(d) { return year(new Date(d.Date)); }));
		
var color = d3.scaleOrdinal(d3.schemeSet1);
    
var svg = d3.select(".calender-map").selectAll("svg")
    .data(d3.range(Year_Min, Year_Max + 1))
  .enter().append("svg")
    .attr("width", '100%')
    .attr("data-height", '0.5678')
    .attr("viewBox",'0 0 900 105')
    .attr("class", "RdYlGn")
  .append("g")
    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

svg.append("text")
    .attr("transform", "translate(-38," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text(function(d) { return d; });
 
for (var i=0; i<7; i++)
{    
svg.append("text")
    .attr("transform", "translate(-5," + cellSize*(i+1) + ")")
    .style("text-anchor", "end")
    .attr("dy", "-.25em")
    .text(function(d) { return week_days[i]; }); 
 }

var rect = svg.selectAll(".day")
    .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter()
	.append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) { return week(d) * cellSize; })
    .attr("y", function(d) { return day(d) * cellSize; })
    .attr("fill",'#fff')
    .datum(format);

var legend = svg.selectAll(".legend")
      .data(month)
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(" + (((i+1) * 50)+8) + ",0)"; });

legend.append("text")
   .attr("class", function(d,i){ return month[i] })
   .style("text-anchor", "end")
   .attr("dy", "-.25em")
   .text(function(d,i){ return month[i] });
   
svg.selectAll(".month")
    .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("path")
    .attr("class", "month")
    .attr("id", function(d,i){ return month[i] })
    .attr("d", monthPath);
  
  var data = d3.nest()
    .key(function(d) { return d.Date; })
    .entries(csv);

    const regionsNamesById = {};
    const regionsDiags = {};

    data.forEach(item => {
      regionsNamesById[item.key] = item.values[0].Comparison_Type;
        regionsDiags[item.key] = {diagnostico: item.values[0].Cod_Diagnostico + ' - ' + item.values[0].Nombre_Diag}
  });
    
	
  rect.filter(function(d) {return d in regionsNamesById; })
      .attr("fill", function(d) { return color(regionsNamesById[d]); })
	  .attr("data-title", function(d) { return "Fecha: <p>" + format(new Date(d)) + " </p> Medicamento: <p>"+ regionsNamesById[d] + "</p>Diagnóstico: <p>" + regionsDiags[d].diagnostico + "</p>"});
  $("rect").tooltip({container: 'body', html: true, placement:'auto'});
  
  let regionsIds = Object.values(regionsNamesById);
  regionsIds = regionsIds.filter((item, index) => regionsIds.indexOf(item) === index)

  var svgLegned4 = d3.select(".calender-map-legend").append("svg")
            .attr("width", '90%')
            .attr("height", height - 50)
        
        var dataL = 0;
        var offset = 120
        var yC = 10
        
        var legend4 = svgLegned4.selectAll('.legends4')
            .data(regionsIds)
            .enter().append('g')
            .attr("class", "legends4")
            .attr("transform", function (d, i) {
             if (i === 0) {
                dataL = d.length + offset
                return "translate(0,10)"
            } else {
                 if(i > 3){
                     yC = 30;
                 }
                     var newdataL = dataL

             dataL +=  d.length + offset
             return "translate(" + (newdataL) + ", "+yC+")"
            }
        })

        legend4.append('rect')
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", function (d, i) {
        return color(d)
    })

    legend4.append('text')
            .attr("x", 15)
            .attr("y", 10)
        //.attr("dy", ".35em")
        .text(function (d, i) {
            return d
        })
            .attr("class", "textselected")
            .style("text-anchor", "start")
            .style("font-size", '11px')

            svgLegned4.attr('transform', function() {
              return `translate(${0},${0})`
            });

function monthPath(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = +day(t0), w0 = +week(t0),
      d1 = +day(t1), w1 = +week(t1);
  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
      + "H" + w0 * cellSize + "V" + 7 * cellSize
      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
      + "H" + (w1 + 1) * cellSize + "V" + 0
      + "H" + (w0 + 1) * cellSize + "Z";
}

});


