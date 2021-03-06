var n_cells = 30;

var ctx = document.getElementById('myChart').getContext('2d');

		var chart = new Chart(ctx, {
				type: 'line',
				data: {
				    datasets: [{
				        label: '',
				        fill: false,
				        pointRadius: 0,
				        borderColor: "black",
				        borderWidth: 2,
				        data: []
				    }]
				},
				options: {
					legend: {
            display: false
            },
					fill:false,
				    scales: {
				        xAxes: [{
				            type: 'linear',
				            position: 'bottom',
				            gridLines: {
    									display: false
  									},
  									ticks: {
  										min: -3,
  										max: 3
  									}
				        }],
								yAxes: [{
									display:false,
									gridLines: {
										drawBorder: false
									}
								}]
				    },
				    elements: {
            	line: {
                tension: 0 // disables bezier curves
            }
        	}
				}
		});
		
var ctx2 = document.getElementById('concentrations').getContext('2d');

		var chart2 = new Chart(ctx2, {
				type: 'line',
				data: {
				    datasets: [{
				        label: '',
				        fill: false,
				        pointRadius: 0,
				        borderColor: "blue",
				        borderWidth: 2,
				        data: []
				    },
				    {
				        label: '',
				        fill: false,
				        pointRadius: 0,
				        borderColor: "red",
				        borderWidth: 2,
				        data: []
				    }]
				},
				options: {
					legend: {
            display: false
            },
					fill:false,
				    scales: {
				        xAxes: [{
				            type: 'linear',
				            position: 'bottom',
				            gridLines: {
    									display: true
  									},
  									ticks: {
  										min: 0,
  										max: n_cells
  									}
				        }],
								yAxes: [{
									display:true,
									gridLines: {
										drawBorder: true
									}
								}]
				    },
				    elements: {
            	line: {
                tension: 0 // disables bezier curves
            }
        	}
				}
		});

		reactor = new Reactor(n_cells, {"ox": 1000, "red": 0}, 5, 1, 0.01, 
		[{"ox": "ox", "red": "red", "pot": 0}]);
		var dt = 0.05;
		var ereactions = document.getElementById("ereactions2");
		var contents = document.getElementById("contents2");
		function populate_lists() {
			while (ereactions.firstChild) {
				ereactions.removeChild(ereactions.firstChild);
			}
			ere = reactor.e_reactions;
			var i;
			for (i = 0; i < ere.length; i++) {
				/* There are definitely cleaner ways of doing this (such as looping over keys). */
				var node = document.createElement("TR");
				var er_id = document.createElement("TH");
				var er_ox = document.createElement("TD");
				var er_red = document.createElement("TD");
				var er_pot = document.createElement("TD");
				var er_cont = document.createElement("TD");
				er_id.appendChild(document.createTextNode(i));
				er_ox.appendChild(document.createTextNode(ere[i].ox));
				er_red.appendChild(document.createTextNode(ere[i].red));
				er_pot.appendChild(document.createTextNode(ere[i].pot));
				er_cont.innerHTML = "<a href='javascript:remove_ereaction("+i+")'>(delete)</a>";
				node.appendChild(er_id);
				node.appendChild(er_ox);
				node.appendChild(er_red);
				node.appendChild(er_pot);
				node.appendChild(er_cont);
				ereactions.appendChild(node);
			}
			
			while (contents.firstChild) {
				contents.removeChild(contents.firstChild);
			}
			ere = reactor.initial_contents;
			erek = Object.keys(ere);
			var z;
			for (z = 0; z < erek.length; z++) {
				var node = document.createElement("TR");
				var ct_id = document.createElement("TH");
				var ct_name = document.createElement("TD");
				var ct_val = document.createElement("TD");
				var ct_cont = document.createElement("TD");
				ct_id.appendChild(document.createTextNode(z));
				ct_name.appendChild(document.createTextNode(erek[z]));
				ct_val.appendChild(document.createTextNode(ere[erek[z]]));
				ct_cont.innerHTML="<a href='javascript:remove_contents(\""+erek[z]+"\")'>(delete)</a>";
				node.appendChild(ct_id);
				node.appendChild(ct_name);
				node.appendChild(ct_val);
				node.appendChild(ct_cont);
				contents.appendChild(node);
			}
		}
		function remove_ereaction(i) {
			reactor.e_reactions.splice(i, 1);
			populate_lists();
		}
		function remove_contents(izd) {
			console.log(izd);
			delete reactor.initial_contents[izd]
			reactor.reset();
			populate_lists();
		}

		var ox = document.getElementById("ox");
		var red = document.getElementById("red");
		var pot = document.getElementById("pot");
		var add = document.getElementById("add");
		add.onclick = function() {
			reactor.e_reactions.push({"ox": ox.value, "red": red.value, "pot": parseFloat(pot.value)})				
			populate_lists();
		}

		var ident = document.getElementById("ident");
		var quant = document.getElementById("quant");
		var addc = document.getElementById("addc");
		addc.onclick = function() {
			reactor.initial_contents[ident.value] = parseFloat(quant.value);
			reactor.reset();
			populate_lists();
		}
	
		populate_lists();
		function update() {
			[V, I] = reactor.run(dt);

			chart.data.datasets[0].data.push({x: V, y: I});
			chart.update();
			chart2.data.datasets[0].data = [];
			chart2.data.datasets[1].data = [];
			for (var i = 0; i < n_cells; i++) {
				chart2.data.datasets[0].data.push({x: i, y: reactor.cells[i].contents.ox});
				chart2.data.datasets[1].data.push({x: i, y: reactor.cells[i].contents.red});
			}
			chart2.update();
			reactor.diffuse(dt);
		}
		
		var dt_slider = document.getElementById("dt");
		var dc_slider = document.getElementById("dc");
		var vl_slider = document.getElementById("vl");
		var dt_value = document.getElementById("dtv");
		var dc_value = document.getElementById("dcv");
		var vl_value = document.getElementById("vlv");
		var reset = document.getElementById("reset");
		var start = document.getElementById("start");
		var stop = document.getElementById("stop");

			dt_slider.oninput = function() {
				dt = this.value/100;
				dt_value.innerHTML = this.value/100;
				//output.innerHTML = this.value;
			} 
			dc_slider.oninput = function() {
				reactor.d_coeff = this.value/100;
				dc_value.innerHTML = this.value/100;
				//output.innerHTML = this.value;
			} 
			vl_slider.oninput = function() {
				reactor.voltage_lim = this.value/10;
				vl_value.innerHTML = this.value/10;
				chart.options.scales.xAxes[0].ticks.min = -reactor.voltage_lim;
				chart.options.scales.xAxes[0].ticks.max = reactor.voltage_lim;
				//output.innerHTML = this.value;
			} 
			reset.onclick = function() {
				chart.data.datasets[0].data = [];
			}
			start.onclick = function() {
				cv = setInterval(update, 50);
			}
			stop.onclick = function() {
				clearInterval(cv);
			}
			
			var expor = document.getElementById("export");
			var exported = document.getElementById("imported");
			expor.onclick = function () {
				var stp = dt+","+reactor.d_coeff+","+reactor.voltage_lim;
				var rct = []
				var i;
				var q = reactor.e_reactions;
				for (i = 0; i < q.length; i++) {
					rct.push([q[i].ox, q[i].red, q[i].pot].join(","))
				}
				rtn = rct.join(";");
				var cnt = []
				q = Object.keys(reactor.initial_contents);
				for (i = 0; i< q.length; i++) {
					cnt.push(q[i] + "," + reactor.initial_contents[q[i]])
				}
				ctn = cnt.join(";");
				out = [stp, rtn, ctn].join(":");
				exported.value = out;
			}
			
			var impor = document.getElementById("import");
			var imported = document.getElementById("imported");
			impor.onclick = function() {
				var fd = imported.value;
				var df = fd.split(":");
				var q = df[0].split(",");
				dt = parseFloat(q[0]);
				reactor.d_coeff = parseFloat(q[1]);
				reactor.voltage_lim = parseFloat(q[2]);

				var reacts = df[1].split(";");
				var i;
				reactor.e_reactions = [];
				reactor.initial_contents = {};
				for (i = 0; i < reacts.length; i++) {
					var zd = reacts[i].split(",");
					reactor.e_reactions.push({"ox": zd[0], "red": zd[1], "pot": parseFloat(zd[2])});
				}
				var conts = df[2].split(";");
				for (i = 0; i < conts.length; i++) {
					var zd = conts[i].split(",");
					reactor.initial_contents[zd[0]] = parseFloat(zd[1]);
				}
				reactor.reset();
				populate_lists();
				dt_slider.value = dt * 100;
				dt_value.innerHTML = dt;
				dc_slider.value = reactor.d_coeff*100;
				dc_value.innerHTML = reactor.d_coeff;
				vl_slider.value = reactor.voltage_lim * 10;
				vl_value.innerHTML = reactor.voltage_lim;
				chart.options.scales.xAxes[0].ticks.min = -reactor.voltage_lim;
				chart.options.scales.xAxes[0].ticks.max = reactor.voltage_lim;
				
 
				
			}
			dt_slider.value = dt * 100;
				dt_value.innerHTML = dt;
				dc_slider.value = reactor.d_coeff*100;
				dc_value.innerHTML = reactor.d_coeff;
				vl_slider.value = reactor.voltage_lim * 10;
				vl_value.innerHTML = reactor.voltage_lim;
				chart.options.scales.xAxes[0].ticks.min = -reactor.voltage_lim;
				chart.options.scales.xAxes[0].ticks.max = reactor.voltage_lim;
