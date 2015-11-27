/**
 * Created by zhaoyifei on 15/11/26.
 */


function lineChart(chartDiv, chartName) { // <-1A
  var _chart = {};

  var _width = 600, _height = 300, // <-1B
    _margins = {top: 30, left: 30, right: 30, bottom: 30},
    _x, _y,
    _data = [],
    _colors = d3.scale.category10(),
    _svg,
    _bodyG,
    _line;

  _chart.render = function () { // <-2A
    if (!_svg) {
      var blockName = "body";//"#"+chartDiv
      d3.select(blockName).append("div").attr("class", "baseline");
      d3.select(blockName).append("span").text(chartName);
      _svg = d3.select(blockName).append("svg") // <-2B
        .attr("height", _height)
        .attr("width", _width);

      renderAxes(_svg);

      defineBodyClip(_svg);
    }

    renderBody(_svg);
  };

  function renderAxes(svg) {
    var axesG = svg.append("g")
      .attr("class", "axes");

    renderXAxis(axesG);

    renderYAxis(axesG);
  }

  function renderXAxis(axesG){
    var xAxis = d3.svg.axis()
      .scale(_x.range([0, quadrantWidth()]))
      .orient("bottom");

    axesG.append("g")
      .attr("class", "x axis")
      .attr("transform", function () {
        return "translate(" + xStart() + "," + yStart() + ")";
      })
      .call(xAxis);

    d3.selectAll("g.x g.tick")
      .append("line")
      .classed("grid-line", true)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", - quadrantHeight());
  }

  function renderYAxis(axesG){
    var yAxis = d3.svg.axis()
      .scale(_y.range([quadrantHeight(), 0]))
      .orient("left");

    axesG.append("g")
      .attr("class", "y axis")
      .attr("transform", function () {
        return "translate(" + xStart() + "," + yEnd() + ")";
      })
      .call(yAxis);

    d3.selectAll("g.y g.tick")
      .append("line")
      .classed("grid-line", true)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", quadrantWidth())
      .attr("y2", 0);
  }

  function defineBodyClip(svg) { // <-2C
    var padding = 5;

    svg.append("defs")
      .append("clipPath")
      .attr("id", "body-clip")
      .append("rect")
      .attr("x", 0 - padding)
      .attr("y", 0)
      .attr("width", quadrantWidth() + 2 * padding)
      .attr("height", quadrantHeight());
  }

  function renderBody(svg) { // <-2D
    if (!_bodyG)
      _bodyG = svg.append("g")
        .attr("class", "body")
        .attr("transform", "translate("
          + xStart() + ","
          + yEnd() + ")") // <-2E
        .attr("clip-path", "url(#body-clip)");

    renderLines();

    renderDots();
  }

  function renderLines() {
    _line = d3.svg.line() //<-4A
      .x(function (d) { return _x(d.x); })
      .y(function (d) { return _y(d.y); });

    _bodyG.selectAll("path.line")
      .data(_data)
      .enter() //<-4B
      .append("path")
      .style("stroke", function (d, i) {
        return _colors(i); //<-4C
      })
      .attr("class", "line");

    _bodyG.selectAll("path.line")
      .data(_data)
      .transition() //<-4D
      .attr("d", function (d) { return _line(d); });
  }

  function renderDots() {
    _data.forEach(function (list, i) {
      _bodyG.selectAll("circle._" + i) //<-4E
        .data(list)
        .enter()
        .append("circle")
        .attr("class", "dot _" + i);

      _bodyG.selectAll("circle._" + i)
        .data(list)
        .style("stroke", function (d) {
          return _colors(i); //<-4F
        })
        .transition() //<-4G
        .attr("cx", function (d) { return _x(d.x); })
        .attr("cy", function (d) { return _y(d.y); })
        .attr("r", 4.5);
    });
  }

  function xStart() {
    return _margins.left;
  }

  function yStart() {
    return _height - _margins.bottom;
  }

  function xEnd() {
    return _width - _margins.right;
  }

  function yEnd() {
    return _margins.top;
  }

  function quadrantWidth() {
    return _width - _margins.left - _margins.right;
  }

  function quadrantHeight() {
    return _height - _margins.top - _margins.bottom;
  }

  _chart.width = function (w) {
    if (!arguments.length) return _width;
    _width = w;
    return _chart;
  };

  _chart.height = function (h) { // <-1C
    if (!arguments.length) return _height;
    _height = h;
    return _chart;
  };

  _chart.margins = function (m) {
    if (!arguments.length) return _margins;
    _margins = m;
    return _chart;
  };

  _chart.colors = function (c) {
    if (!arguments.length) return _colors;
    _colors = c;
    return _chart;
  };

  _chart.x = function (x) {
    if (!arguments.length) return _x;
    _x = x;
    return _chart;
  };

  _chart.y = function (y) {
    if (!arguments.length) return _y;
    _y = y;
    return _chart;
  };

  _chart.addSeries = function (series) { // <-1D
    _data.push(series);
    return _chart;
  };

  return _chart; // <-1E
}


var sortData = function(a,b){return a.infoTime < b.infoTime? -1: a.infoTime > b.infoTime ? 1 : 0;}
function load(){ // <-E
  d3.json("carenum", function(error, json){ // <-F
    var series = [];
    var max = 50;
    if(json){
      var data = json.sort(sortData);
      d3.range(data.length).map(function (i) {
        max = max < data[i].info*1.1 ? data[i].info*1.1 : max;
        series.push( {x: i, y: data[i].info});
      });
      var chart = lineChart("carenum", "每日care数")
        .x(d3.scale.linear().domain([0, data.length+1]))
        .y(d3.scale.linear().domain([0, max]));
      chart.addSeries(series);
      chart.render();
    }
  });

  d3.json("doctorpatientrelationnum", function(error, json){ // <-F
    var series = [];
    var max = 100;
    if(json){
      var data = json.sort(sortData);
      d3.range(data.length).map(function (i) {
        max = max < data[i].info*1.1 ? data[i].info*1.1 : max;
        series.push( {x: i, y: data[i].info});
      });
      var chart = lineChart("doctorpatientrelationnum","医生患者关系数")
        .x(d3.scale.linear().domain([0, data.length+1]))
        .y(d3.scale.linear().domain([0, max]));
      chart.addSeries(series);
      chart.render();
    }

  });

  d3.json("doctordoctorrelationnum", function(error, json){ // <-F
    var series = [];
    var max = 100;
    if(json) {
      var data = json.sort(sortData);
      d3.range(data.length).map(function (i) {
        max = max < data[i].info*1.1 ? data[i].info*1.1 : max;
        series.push( {x: i, y: data[i].info});
      });
      var chart = lineChart("doctordoctorrelationnum","医生转诊关系数")
        .x(d3.scale.linear().domain([0, data.length+1]))
        .y(d3.scale.linear().domain([0, max]));
      chart.addSeries(series);
      chart.render();
    }
  });
  d3.json("usernum", function(error, json){ // <-F
    var series = [];
    var max = 100;
    if(json) {
      var data = json.sort(sortData);
      d3.range(data.length).map(function (i) {
        max = max < data[i].info*1.1 ? data[i].info*1.1 : max;
        series.push( {x: i, y: data[i].info});
      });
      var chart = lineChart("usernum", "用户数")
        .x(d3.scale.linear().domain([0, data.length+1]))
        .y(d3.scale.linear().domain([0, max]));
      chart.addSeries(series);
      chart.render();
    }
  });
  d3.json("exclusivedoctornum", function(error, json){ // <-F
    var series = [];
    var max = 100;
    if(json) {
      var data = json.sort(sortData);
      d3.range(data.length).map(function (i) {
        max = max < data[i].info*1.1 ? data[i].info*1.1 : max;
        series.push( {x: i, y: data[i].info});
      });
      var chart = lineChart("exclusivedoctornum", "专属医生签约会员数")
        .x(d3.scale.linear().domain([0, data.length+1]))
        .y(d3.scale.linear().domain([0, max]));
      chart.addSeries(series);
      chart.render();
    }
  });
}