/*----------------------------------------------------------------------*
 * File:    cv.js*
 *                                                                      *
 * Purpose: Simulate a cyclicvoltammogram using a basic model.          *
 *                                                                      *
 *                                                                      *
 * Author:  Ben Tatman                                                  *
 *          ben@tatmans.co.uk                                           *
 *                                                                      *
 * License: Copyright 2019 Ben Tatman                              *
 * Permission is hereby granted, free of charge, to any person          *
 * obtaining a copy of this software and associated documentation files *
 * (the "Software"), to deal in the Software without restriction,       *
 * including without limitation the rights to use, copy, modify, merge, *
 * publish, distribute, sublicense, and/or sell copies of the Software, *
 * and to permit persons to whom the Software is furnished to do so,    *
 * subject to the following conditions:                                 *
 *                                                                      *
 * The above copyright notice and this permission notice shall be       *
 * included in all copies or substantial portions of the Software.      *
 *                                                                      *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,      *
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF   *
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND                *
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS  *
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN   *
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN    *
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE     *
 * SOFTWARE.                                                            *
 *                                                                      *
 * History: 16th July 2019, version 0.1                                 *
 *----------------------------------------------------------------------*/

function round_n(x, n) {
	return Math.round(x * 10**n)/(10**n);
}

class Cell {
	constructor(contents) {
		this.contents = contents;
	}
	operate_e(e, e_reactions) {
		var i;
		var I = 0;
		for (i = 0; i < e_reactions.length; i++) {
			var p = Math.exp(e - e_reactions[i].pot);
			var q = this.contents[e_reactions[i].ox] + this.contents[e_reactions[i].red];
			var new_ox = q - (q / (p + 1))
			var new_red = q / (p + 1)
			I += this.contents[e_reactions[i].red] - new_red;
			this.contents[e_reactions[i].ox] = new_ox;
			this.contents[e_reactions[i].red] = new_red;
		}
		return I;
	}
	push() {
		this.safe_contents = JSON.parse(JSON.stringify(this.contents));
	}
	pop() {
		this.contents = JSON.parse(JSON.stringify(this.safe_contents));
	}
}

class Reactor {
	constructor(num_cells, initial_contents, E, e_step, D, e_reactions) {
		this.cells = [];
		this.num_cells = num_cells;
		var i;
		this.initial_contents = initial_contents;
		for (i = 0; i < num_cells; i++) {
			this.cells.push(new Cell(JSON.parse(JSON.stringify(initial_contents))));
		}
		this.voltage_lim = E;
		this.voltage = E;
		this.d_coeff = D;
		this.e_reactions = e_reactions;
		this.c = 1;
		this.e_step = e_step;
		this.run(0);
	}
	reset() {
		var i;
		this.cells = [];
		for (i = 0; i < this.num_cells; i++) {
			this.cells.push(new Cell(JSON.parse(JSON.stringify(this.initial_contents))));
		}
		this.voltage = this.voltage_lim;
	}
	step_e(dt) {
		if (this.c == 1 && this.voltage > this.voltage_lim) {
			this.c = -1;
		} else if (this.c == -1 && this.voltage < -this.voltage_lim) {
			this.c = 1;
		}
		this.voltage += this.c * dt * this.e_step;
	}
	run(dt) {
		this.step_e(dt);
		var I = this.cells[0].operate_e(this.voltage, this.e_reactions);
		return [this.voltage, I];
	}
	diffuse(dt) {
		var i, p;
		for (i = 0; i < this.cells.length; i++) {
			this.cells[i].push();
		}
		for (i = 0; i < this.cells.length; i++) {
			var l_n = (i - 1 < 0 ? 0 : i - 1);
			var p_n = (i + 1 > this.cells.length - 1 ? this.cells.length -1 : i + 1);
			var keys = Object.keys(this.cells[0].contents);
			for (p = 0; p < keys.length; p++) {

				this.cells[i].contents[keys[p]] = (this.d_coeff * (this.cells[l_n].safe_contents[keys[p]] + this.cells[p_n].safe_contents[keys[p]]));
				this.cells[i].contents[keys[p]] += (1 - 2*this.d_coeff) * this.cells[i].safe_contents[keys[p]];
			}
		}
	}
}

if (typeof window === 'undefined') {
	reactor = new Reactor(30, {"ox": 1000, "red": 0}, 5, 1, 0.01, 
	[{"ox": "ox", "red": "red", "pot": 0}]);
	for (i = 0; i < 40; i += 0.01) {
		[V, I] = reactor.run(0.01);
		console.log(round_n(V, 2) + ", " + round_n(I, 2));
		reactor.diffuse(0.01);
	}
}
