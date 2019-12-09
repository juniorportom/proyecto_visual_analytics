/* global d3, crossfilter, barChart, myTreemap */

console.log("Downloading data");
d3.csv('/gender-data')
    .then(data => {
        console.log('Data loaded', data);

        const cs = crossfilter(data);

        const dimYear = cs.dimension(d => d['Anio_Prescripcion']);
        const dimGender = cs.dimension(d => d['Sexo']);
        const dimMonth = cs.dimension(d => d['Mes_Prescripcion']);
        const dimAge = cs.dimension(d => d['grupo_etario']);

        const groupYear = dimYear.group();
        const groupGender = dimGender.group();
        const groupMonth = dimMonth.group();
        const groupAge = dimAge.group();


        console.log(groupYear.all());
        console.log(groupGender.all());
        console.log(groupMonth.all());
        console.log(groupAge.all());

        const barYearType = barChart()
            .x(d=> d.key)
            .y(d=> d.value)
            .onMouseOver(d => {
                dimYear.filter(d.key);
                update();
            })
            .onMouseOut(()=>{
                dimYear.filterAll();
                update();
            });


        const barGenderType = barChart()
            .x(d=> d.key)
            .y(d=> d.value)
            .onMouseOver(d => {
                dimGender.filter(d.key);
                update();
            })
            .onMouseOut(()=>{
                dimGender.filterAll();
                update();
            });

        const barMonthType = barChart()
            .x(d=> d.key)
            .y(d=> parseInt(d.value))
            .onMouseOver(d => {
                dimMonth.filter(d.key);
                update();
            })
            .onMouseOut(()=>{
                dimMonth.filterAll();
                update();
            });

        const barAgeType = barChart()
            .x(d=> d.key)
            .y(d=> parseInt(d.value))
            .onMouseOver(d => {
                dimAge.filter(d.key);
                update();
            })
            .onMouseOut(()=>{
                dimAge.filterAll();
                update();
            });


        function update(){
            d3.select('#cardYears')
            .data([groupYear.all()])
            .call(barYearType);

            d3.select('#cardGenders')
            .data([groupGender.all()])
            .call(barGenderType);

            d3.select('#cardMonth')
            .data([groupMonth.all()])
            .call(barMonthType);

            d3.select('#cardAge')
            .data([groupAge.all()])
            .call(barAgeType);
        }

        /*var rowtip = d3.tip()
    .attr('rect', 'd3-tip')
    .offset([-10, 0])
    .html(function(d){return d.key;})

$('body').on('mouseover', function(){

    d3.selectAll('g.row')
        .call(rowtip)
        .on('mouseover', rowtip.show)
        .on('mouseout', rowtip.hide);
});*/

    function createHierarchy(hierarchyData, hierarchy) {
      const nest = d3.nest();

      for (let h of hierarchy) {
        nest.key(d => d[h]);
      }
      return nest.entries(hierarchyData);
    }


    function updateHierarchy() {
      //let hierarchy = d3.select("#inHierarchy").property("value");
      let values = $('#inHierarchy').val();

      console.log('datos jerar',values);

      try {
        //hierarchy = hierarchy.split(",");
        hierarchy = values;
      } catch (Exception) {
        hierarchy = [];
      }

      const url =
        "/hierarchy-data" + (hierarchy.length ? "?hierarchy=" + hierarchy.join(",") : "");

      console.log("url", url);
      d3.csv(url).then(hierarchyData => {
        const treeData = createHierarchy(hierarchyData, hierarchy);
        console.log("Data loaded", hierarchyData);
        console.log("treedata", treeData);

        const myTEle = myTreemap(900, treeData);

        d3.select("#chart").html("");
        d3.select("#chart")
          .node()
          .appendChild(myTEle);
      });
    }

    update();

    updateHierarchy();


    d3.select("#btnSubmit").on("click", updateHierarchy);

});
