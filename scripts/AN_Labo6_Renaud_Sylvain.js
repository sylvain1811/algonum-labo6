/*
**********************************************************
AN Labo 6
By Sylvain Renaud
**********************************************************
Improvement of labo 2
    AN Labo2 EquipeB2
    © 2017 by Dany Chea, Johnny Da Costa, Sylvain Renaud.
**********************************************************
Method: dichotomy, bisection
**********************************************************
*/

// Global variables for infos, erros and rouded value of a root
var ERROR = [];
var INFO = [];
var ROUND = [];

// Get an element by his ID
var get = function(id) {
	return document.getElementById(id);
};

// Use Enter key to compute
$(document).ready(function()
{
	$('#inputFunc').keypress(function(e)
	{
		if(e.which == 13)
		{
			compute();
		}
	});

	$('#hide').click(function(e){
		e.preventDefault();

		$('#rootsTableDiv').slideToggle();
		
		var state = $('#hide').text();

		if (state == "Hide") {
			$('#hide').text("Show");
		}
		else{
			$('#hide').text("Hide");	
		}
		return false;
	});
	
});

// First function, sin(x) - x/13
function fun1(x) {
	return Math.sin(x) - (x / 13);
}

// Second function, x/(1-x^2)
function fun2(x) {
	return (x / (1 - (x * x)));
}

// Custom function, read the user inptut to interpret a function
function customFunction(x) {
	with(Math) 
	{
		try
		{
			return eval(get('inputFunc').value);
		}
		catch(err)
		{
			alert("Custom function not valid");
			throw new Error("Custom function not valid!");
		}
	}
}

// Read the radiobutton to use the selected function
function myFun(x) {
	if (get('fun1').checked)
		return fun1(x);
	else if (get('fun2').checked)
		return fun2(x);
	else if (get('funCustom').checked) {
		return customFunction(x);
	}
}

// Start the algorithm
function compute() {
	/*
	Idea:
	To divide the interval [a, b] in little intervals of size "step".
	If the function sign change in this little intervals, use bisection to determinate the root.
	Cauchy theorem.
	*/

	var a = -100;
	var b = 100;
	var step = 0.01;

	if(!isNaN(get('inputXMin').value))
		a = Number(get('inputXMin').value);

	if(!isNaN(get('inputXMax').value) && Number(get('inputXMax').value) > a)
		b = Number(get('inputXMax').value);

	if(!isNaN(get('inputStep').value))
		step = Number(get('inputStep').value);

	var delta = 1 / 1e5;

	console.log("Delta: " + delta);

	// Plot data:
	var traceX = [];
	var traceY = [];

	// Calculated roots table
	var roots = [];

	// Run through intervals of size "step"
	for (var i = a; i < b; i += step) {
		var borneInf = i;
		var borneSup = i + step;

		var fa = myFun(borneInf);
		var fb = myFun(borneSup);

		traceX.push(borneInf);
		traceY.push(fa);

		// If the function sign change in this intervals, use bisection to determinate the root
		if (fa * fb <= 0) {

			// Bisection
			var n = 0;
			while (Math.abs(borneInf - borneSup) > delta) {
				var m = (borneInf + borneSup) / 2;
				var fm = myFun(m);
				if ((fm * fa) <= 0) {
					borneSup = m;
					fb = fm;
				} else {
					borneInf = m;
					fa = fm;
				}
				n++;
			}

			// Check continuity
			var delt10 = delta * 10;
			//console.log(Math.round(m * (1 / (delta * 10))) / (1 / (delta * 10)));
			//console.log(Math.round(m / (delta * 10)) * (delta * 10)); // Pas le même résultat ?

			// Compute rounded value of the root
			var mRound = Math.round(m * (1 / delt10)) / (1 / delt10);
			var fmRound = myFun(mRound);

			// If the fonction value at this "root" equals Infinity ou -Infinity, then it isn't a root, but an asymptote
			if (fmRound == Infinity || fmRound == -Infinity) {
				roots.push(m);
				ROUND.push(mRound);
				INFO.push("<p><span class='badge badge-danger'>asymptote, is not a root</span></p>");
			}

			// Else, it's probably a root
			else {
				roots.push(m);
				ROUND.push(mRound);
				INFO.push("<p><span class='badge badge-success'>is a root</span><p>");
			}

			// Error : (b-a)/2^(n+1) ref: https://fr.wikipedia.org/wiki/Méthode_de_dichotomie
			ERROR.push(Math.abs((borneInf - borneSup)) / Math.pow(2, n + 1));
		}
	}

	// Display racines
	printRoot(roots);

	// Plot function
	plotFunction(traceX, traceY, roots);
}

// Plot function with Plotly
function plotFunction(traceX, traceY, roots) {
	DIVPLOT = get('plot');
	DIVPLOT.innerHTML = "";

	var trace = {
		x: traceX,
		y: traceY,
		name: 'Function',
		type: 'scattergl',
		line: {
			color: 'rgb(30,144,255)',
			width: 1
		}
	};

 	// Y always 0
 	var tab0 = [];
 	for (var i = 0; i < roots.length; i++) {
 		tab0.push(0);
 	}

 	var rootsPoints = {
 		x: roots,
 		y: tab0,
 		name: 'Roots',
 		mode: 'markers',
 		type: 'scattergl',
 		line: {
 			color: 'red',
 			width: 2
 		}
 	};


 	var layout = {
 		yaxis: {
 			autorange: true
 		}
 	};

	// Plot optimization for fun2.
	if (get('fun2').checked) {
		layout = {
			yaxis: {
				range: [-2, 2],
				//autorange: true
			}
		};
	}

	var data = [trace, rootsPoints];

	Plotly.newPlot(DIVPLOT, data, layout);
}

// Create a HTML table to display the roots found
function printRoot(roots) {
	//console.log(roots);
	var tableRoots = get("tbody");
	var row;
	tableRoots.innerHTML = "";
	for (var i = 0; i < roots.length; i++) {
		row = tableRoots.insertRow(i);
		row.insertCell(0).innerHTML += i;
		row.insertCell(1).innerHTML += roots[i];
		row.insertCell(2).innerHTML += ROUND[i];
		row.insertCell(3).innerHTML += ERROR[i];
		row.insertCell(4).innerHTML += INFO[i];
	}

	if(roots.length == 0)
	{
		row = tableRoots.insertRow(0);
		row.insertCell(0).innerHTML += "None";
		row.insertCell(1).innerHTML += "";
		row.insertCell(2).innerHTML += "";
		row.insertCell(3).innerHTML += "";
		row.insertCell(4).innerHTML += "";
	}

	// Clear data tables
	ERROR = [];
	INFO = [];
	ROUND = [];
}
