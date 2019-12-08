// https://bl.ocks.org/mbostock/805115ebaa574e771db1875a6d828949
$(document).ready(function () {
    $('[data-toggle="popover"]').popover()
    d3.csv('/categories-data').then(data => draw(data))

    const ENABLED_OPACITY = 1;
    const DISABLED_OPACITY = .2;

    const timeFormatter = timeFormatEs.format('%d-%m-%Y');

    function draw(data) {
        const container = $('.chart');
        const margin = {top: 20, right: 20, bottom: 35, left: 80};
        const previewMargin = {top: 20, right: 20, bottom: 20, left: 80};
        const width = container.width() - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        const xratio = 1;
        const yratio = 4;

        const previewWidth = width / xratio;
        const previewHeight = height / yratio;

        const x = d3.scaleTime()
            .range([0, width]);

        const y = d3.scaleLinear()
            .range([height, 0]);

        let rescaledX = x;
        let rescaledY = y;

        const previewX = d3.scaleTime()
            .range([0, previewWidth]);

        const previewY = d3.scaleLinear()
            .range([previewHeight, 0]);

        const colorScale = d3.scaleOrdinal()
            .range([
                '#4c78a8',
                '#f58518',
                '#54a24b',
                '#9e765f',
                '#e45756',
                '#79706e',
                '#bab0ac',
                '#d67195',
                '#fcbfd2',
                '#b279a2',
                '#d8b5a5'
            ]);

        const chartAreaWidth = width + margin.left + margin.right;
        const chartAreaHeight = height + margin.top + margin.bottom;

        const zoom = d3.zoom()
            .scaleExtent([1, 10])
            .translateExtent([[0, 0], [chartAreaWidth, chartAreaHeight]])
            .on('start', () => {
                hoverDot
                    .attr('cx', -5)
                    .attr('cy', 0);
            })
            .on('zoom', zoomed);

        const svg = d3.select('.chart')
            .append('svg')
            //.attr('width', width + margin.left + margin.right)
            //.attr('height', height + margin.top + margin.bottom)
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr('preserveAspectRatio', 'xMinYMin')
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        data.forEach(function (d) {

            d.date = new Date(d.date);
            d.percent = Number(+d.percent);
        });

        x.domain(d3.extent(data, d => d.date)).nice();
        y.domain([0, d3.max(data, d => d.percent)]).nice();
        previewX.domain(d3.extent(data, d => d.date)).nice();
        previewY.domain([0, d3.max(data, d => d.percent)]).nice();
        colorScale.domain(d3.map(data, d => d.regionId).keys());

        const xAxis = d3.axisBottom(x)
            .ticks((width + 2) / (height + 2) * 5)
            .tickSize(-height - 6)
            .tickPadding(10)
            .tickFormat(multiFormat);

        const xAxisPreview = d3.axisBottom(previewX)
            .tickSize(4)
            .tickValues(previewX.domain())
            .tickFormat(timeFormatEs.format('%b %Y'));

        const yAxisPreview = d3.axisLeft(previewY)
            .tickValues(previewY.domain())
            .tickSize(3)
            .tickFormat(d => formatValue(Math.round(d)));

        const yAxis = d3.axisRight(y)
            .ticks(5)
            .tickSize(7 + width)
            .tickPadding(-11 - width)
            .tickFormat(d => formatValue(d));

        const xAxisElement = svg.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${height + 6})`)
            .call(xAxis);

        const yAxisElement = svg.append('g')
            .attr('transform', 'translate(-7, 0)')
            .attr('class', 'axis y-axis')
            .call(yAxis);

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(0));

        svg.append('g')
            .call(d3.axisLeft(y).ticks(0));

        svg.append('defs').append('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr('width', width)
            .attr('height', height);

        const nestByRegionId = d3.nest()
            .key(d => d.regionId)
            .sortKeys((v1, v2) => (parseInt(v1, 10) > parseInt(v2, 10) ? 1 : -1))
            .entries(data);

        const regionsNamesById = {};

        nestByRegionId.forEach(item => {
            regionsNamesById[item.key] = item.values[0].regionName === 'ANTINEOPLASICOS Y PROT. CELULARES' ? 'ANTINEOPLASICOS' : item.values[0].regionName;
        });

        const regions = {};

        d3.map(data, d => d.regionId)
            .keys()
            .forEach(function (d, i) {
                regions[d] = {
                    data: nestByRegionId[i].values,
                    enabled: true
                };
            });

        const regionsIds = Object.keys(regions);

        const lineGenerator = d3.line()
            .x(d => rescaledX(d.date))
            .y(d => rescaledY(d.percent));

        const nestByDate = d3.nest()
            .key(d => d.date)
            .entries(data);

        const percentsByDate = {};

        nestByDate.forEach(dateItem => {
            percentsByDate[dateItem.key] = {};

            dateItem.values.forEach(item => {
                percentsByDate[dateItem.key][item.regionId] = item.percent;
            });
        });

        const legendContainer = d3.select('.legend');
        const legendContainerObj = $('.legend');

        const legendsSvg = legendContainer
            .append('svg');

        const legendsDate = legendsSvg.append('text')
            .attr('visibility', 'hidden')
            .attr('x', 0)
            .attr('y', 15);

        const legends = legendsSvg
            .attr("viewBox", `0 0 ${legendContainerObj.width()} ${legendContainerObj.height()}`)
            .attr('width', '100%')
            .attr('height', '100%')
            .selectAll('g')
            .data(regionsIds)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (regionId, index) => `translate(0,${index * 20 + 25})`)
            .on('click', clickLegendRectHandler);

        const legendsValues = legends
            .append('text')
            .attr('x', 165)
            .attr('y', 15)
            .attr('class', 'legend-value small font-weight-bold')
            .style('font-size', '11px');

        legends.append('rect')
            .attr('x', 0)
            .attr('y', 5)
            .attr('width', 12)
            .attr('height', 12)
            .style('fill', regionId => colorScale(regionId))
            .select(function () {
                return this.parentNode;
            })
            .append('text')
            .attr('x', 25)
            .attr('y', 15)
            .text(regionId => regionsNamesById[regionId])
            .attr('class', 'legend-text')
            .style('text-anchor', 'start')
            .style('font-size', '11px');

        // Botones Gráfica 1
        d3.select('.reset-zoom-button').on('click', () => {
            rescaledX = x;
            rescaledY = y;

            d3.select('.voronoi-parent').transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity);
        });

        d3.select('.show-all-button').on('click', () => {
            regionsIds.forEach(regionId => {
                regions[regionId].enabled = true;
            });
            singleLineSelected = false;
            redrawChart();
        });

        d3.select('.hide-all-button').on('click', () => {
            regionsIds.forEach(regionId => {
                regions[regionId].enabled = false;
            });
            singleLineSelected = false;
            redrawChart();
        });

        const linesContainer = svg.append('g')
            .attr('clip-path', 'url(#clip)');

        let singleLineSelected = false;

        const voronoi = d3.voronoi()
            .x(d => x(d.date))
            .y(d => y(d.percent))
            .extent([[0, 0], [width, height]]);

        const hoverDot = svg.append('circle')
            .attr('class', 'dot')
            .attr('r', 3)
            .attr('clip-path', 'url(#clip)')
            .style('visibility', 'hidden');

        let voronoiGroup = svg.append('g')
            .attr('class', 'voronoi-parent')
            .attr('clip-path', 'url(#clip)')
            .append('g')
            .attr('class', 'voronoi')
            .on('mouseover', () => {
                legendsDate.style('visibility', 'visible');
                hoverDot.style('visibility', 'visible');
            })
            .on('mouseout', () => {
                legendsValues.text('');
                legendsDate.style('visibility', 'hidden');
                hoverDot.style('visibility', 'hidden');
            });

        const zoomNode = d3.select('.voronoi-parent').call(zoom);


        d3.select('#show-voronoi')
            .property('disabled', false)
            .on('change', function () {
                voronoiGroup.classed('voronoi-show', this.checked);
            });

        const preview = d3.select('.preview')
            .append('svg')
            .attr("viewBox", `0 0 ${previewWidth + previewMargin.left + previewMargin.right} ${previewHeight + previewMargin.top + previewMargin.bottom}`)
            .attr('preserveAspectRatio', 'xMinYMin')
            // .attr('width', previewWidth + previewMargin.left + previewMargin.right)
            // .attr('height', previewHeight + previewMargin.top + previewMargin.bottom)
            .append('g')
            .attr('transform', `translate(${previewMargin.left},${previewMargin.top})`);

        const previewContainer = preview.append('g');

        preview.append('g')
            .attr('class', 'preview-axis x-axis')
            .attr('transform', `translate(0,${previewHeight})`)
            .call(xAxisPreview);

        preview.append('g')
            .attr('class', 'preview-axis y-axis')
            .attr('transform', 'translate(0, 0)')
            .call(yAxisPreview);

        previewContainer.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', previewWidth)
            .attr('height', previewHeight)
            .attr('fill', '#dedede');

        const previewLineGenerator = d3.line()
            .x(d => previewX(d.date))
            .y(d => previewY(d.percent));

        const draggedNode = previewContainer
            .append('rect')
            .data([{x: 0, y: 0}])
            .attr('x', 0)
            .attr('y', 0)
            .style('cursor', 'all-scroll')
            .attr('width', previewWidth)
            .attr('height', previewHeight)
            .attr('fill', 'rgba(250, 235, 215, 0.78)')
            .call(d3.drag().on('drag', dragged));

        redrawChart();

        function redrawChart(showingRegionsIds) {
            const enabledRegionsIds = showingRegionsIds || regionsIds.filter(regionId => regions[regionId].enabled);

            const paths = linesContainer
                .selectAll('.line')
                .data(enabledRegionsIds);

            paths.exit().remove();

            if (enabledRegionsIds.length === 1) {
                const previewPath = previewContainer
                    .selectAll('path')
                    .data(enabledRegionsIds);

                previewPath.exit().remove();

                previewPath
                    .enter()
                    .append('path')
                    .merge(previewPath)
                    .attr('class', 'line')
                    .attr('d', regionId => previewLineGenerator(regions[regionId].data)
                    )
                    .style('stroke', regionId => colorScale(regionId));
            }

            paths
                .enter()
                .append('path')
                .merge(paths)
                .attr('class', 'line')
                .attr('id', regionId => `region-${regionId}`)
                .attr('d', regionId => lineGenerator(regions[regionId].data)
                )
                .style('stroke', regionId => colorScale(regionId));

            legends.each(function (regionId) {
                const opacityValue = enabledRegionsIds.indexOf(regionId) >= 0 ? ENABLED_OPACITY : DISABLED_OPACITY;

                d3.select(this).attr('opacity', opacityValue);
            });

            const filteredData = data.filter(dataItem => enabledRegionsIds.indexOf(dataItem.regionId) >= 0);

            const voronoiPaths = voronoiGroup.selectAll('path')
                .data(voronoi.polygons(filteredData));

            voronoiPaths.exit().remove();

            voronoiPaths
                .enter()
                .append('path')
                .merge(voronoiPaths)
                .attr('d', d => (d ? `M${d.join('L')}Z` : null))
                .on('mouseover', voronoiMouseover)
                .on('mouseout', voronoiMouseout)
                .on('click', voronoiClick);
        }

        function clickLegendRectHandler(regionId) {
            if (singleLineSelected) {
                const newEnabledRegions = singleLineSelected === regionId ? [] : [singleLineSelected, regionId];

                regionsIds.forEach(currentRegionId => {
                    regions[currentRegionId].enabled = newEnabledRegions.indexOf(currentRegionId) >= 0;
                });
            } else {
                regions[regionId].enabled = !regions[regionId].enabled;
            }

            singleLineSelected = false;

            redrawChart();
        }

        function removeTooltip() {
            $('#chart-01').find('.popover').each(function () {
                $(this).popover('dispose');
            });
        }

        function showTooltip(dot, data) {
            let dom_element = dot._groups[0][0];
            let options = {
                placement: 'auto',
                container: '#chart-01',
                trigger: 'manual',
                html: true,
                content: function () {
                    return '<div> <h6 class="popover-header">' + data.regionName + '</h6><div class="popover-body"><span><strong>- Fecha:</strong> ' + timeFormatter(data.date) + ' <br> <strong>- Costo:</strong> ' + formatValue(data.percent) + '</span><br> <strong>- N° de Prescripciones:</strong> ' + data.pacientes + '</span></div></div>';
                }
            };

            $(dom_element).popover(options).popover('show');
        }

        function voronoiMouseover(d) {
            const transform = d3.zoomTransform(d3.select('.voronoi-parent').node());
            legendsDate.text('Fecha Seleccionada: ' + timeFormatter(d.data.date));
            legendsValues.text(dataItem => {
                const value = percentsByDate[d.data.date][dataItem];

                return value ? formatValue(value) : 'Sin Valor';
            });

            d3.select(`#region-${d.data.regionId}`).classed('region-hover', true);

            const previewPath = previewContainer
                .selectAll('path')
                .data([d.data.regionId]);

            previewPath.exit().remove();

            previewPath
                .enter()
                .append('path')
                .merge(previewPath)
                .attr('class', 'line')
                .attr('d', regionId => previewLineGenerator(regions[regionId].data)
                )
                .style('stroke', regionId => colorScale(regionId));

            hoverDot
                .attr('cx', () => transform.applyX(x(d.data.date)))
                .attr('cy', () => transform.applyY(y(d.data.percent)));

            showTooltip(hoverDot, d.data)
        }

        function voronoiMouseout(d) {
            if (d) {
                d3.select(`#region-${d.data.regionId}`).classed('region-hover', false);
            }
            removeTooltip()
        }

        function voronoiClick(d) {
            if (singleLineSelected) {
                singleLineSelected = false;

                redrawChart();
            } else {
                const regionId = d.data.regionId;

                singleLineSelected = regionId;

                redrawChart([regionId]);
            }
        }

        function clamp(number, bottom, top) {
            let result = number;

            if (number < bottom) {
                result = bottom;
            }

            if (number > top) {
                result = top;
            }

            return result;
        }

        function dragged(d) {
            const draggedNodeWidth = draggedNode.attr('width');
            const draggedNodeHeight = draggedNode.attr('height');
            const x = clamp(d3.event.x, 0, previewWidth - draggedNodeWidth);
            const y = clamp(d3.event.y, 0, previewHeight - draggedNodeHeight);

            d3.select(this)
                .attr('x', d.x = x)
                .attr('y', d.y = y);

            zoomNode.call(zoom.transform, d3.zoomIdentity
                .scale(currentTransformationValue)
                .translate(-x * xratio, -y * yratio)
            );
        }

        let currentTransformationValue = 1;

        function zoomed() {
            removeTooltip();
            const transformation = d3.event.transform;

            const rightEdge = Math.abs(transformation.x) / transformation.k + width / transformation.k;
            const bottomEdge = Math.abs(transformation.y) / transformation.k + height / transformation.k;

            if (rightEdge > width) {
                transformation.x = -(width * transformation.k - width);
            }

            if (bottomEdge > height) {
                transformation.y = -(height * transformation.k - height);
            }

            rescaledX = transformation.rescaleX(x);
            rescaledY = transformation.rescaleY(y);

            xAxisElement.call(xAxis.scale(rescaledX));
            yAxisElement.call(yAxis.scale(rescaledY));

            linesContainer.selectAll('path')
                .attr('d', regionId => {
                    return d3.line()
                        .defined(d => d.percent !== 0)
                        .x(d => rescaledX(d.date))
                        .y(d => rescaledY(d.percent))(regions[regionId].data);
                });

            voronoiGroup
                .attr('transform', transformation);

            const xPreviewPosition = previewX.range().map(transformation.invertX, transformation)[0];
            const yPreviewPosition = previewY.range().map(transformation.invertY, transformation)[1];

            currentTransformationValue = transformation.k;

            draggedNode
                .data([{x: xPreviewPosition / xratio, y: yPreviewPosition / yratio}])
                .attr('x', d => d.x)
                .attr('y', d => d.y)
                .attr('width', previewWidth / transformation.k)
                .attr('height', previewHeight / transformation.k);
        }
    }
});
