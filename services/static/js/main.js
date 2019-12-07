/* global d3, crossfilter, barChart */

console.log("Downloading data");
d3.csv('/gender-data')
    .then(data => {
        console.log('Data loaded', data);

        const cs = crossfilter(data);

        const dimYear = cs.dimension(d => d['Anio_Prescripcion']);
        const dimGender = cs.dimension(d => d['Sexo']);
        const dimMonth = cs.dimension(d => d['Mes_Prescripcion']);

        const groupYear = dimYear.group();
        const groupGender = dimGender.group();
        const groupMonth = dimMonth.group();


        console.log(groupYear.all());
        console.log(groupGender.all());
        console.log(groupMonth.all());

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
        }


        update();
    });