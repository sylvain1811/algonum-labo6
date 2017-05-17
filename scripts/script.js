/*
**********************************************************
AN Labo 6
By Sylvain Renaud
**********************************************************
Reprise et améliration du labo 2, créé par
    AN Labo2 EquipeB2
    © 2017 by Dany Chea, Johnny Da Costa, Sylvain Renaud.
    All rights reserved.
**********************************************************
Méthode choisie : par dichotomie
**********************************************************
*/

// Gariables globales pour gérer les infos et erreurs
var ERROR = [];
var INFO = [];
var ROUND = [];

var $ = function(id) {
	return document.getElementById(id);
};

function fun1(x) {
	return Math.sin(x) - (x / 13);
}

function fun2(x) {
	return (x / (1 - (x * x)));
}

function customFunction(x) {
	//console.log(eval($('inputFunc').value));
	return eval($('inputFunc').value);
}

function myFun(x) {
	if ($('fun1').checked)
		return fun1(x);
	else if ($('fun2').checked)
		return fun2(x);
	else if ($('funCustom').checked) {
		return customFunction(x);
	}
}

function compute() {
	/*
	Idée de base:
	On va diviser l'intervalle en petites intervalles dans lequel on va chercher si la fonction
	change de signe (théorême de Cauchy)
	*/

	var a = -100;
	var b = 100;
	var delta = 1 / 1e5;
	var step = 0.01;

	console.log("Delta: " + delta);

	// Données de plot:
	var traceX = [];
	var traceY = [];

	// Tableau des racines calculées
	var roots = [];

	// Idée: parcours chaque petit intervalles.
	for (var i = a; i < b; i += step) {
		var borneInf = i;
		var borneSup = i + step;

		var fa = myFun(borneInf);
		var fb = myFun(borneSup);

		traceX.push(borneInf);
		traceY.push(fa);

		// Si la fonction change de signe dans cette intervalles on applique la bissection
		if (fa * fb <= 0) {

			// Application de la bissection
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
				//console.log(m);
			}
			//console.log("m affiché au final: " + m);

			// Check continuité
			var delt10 = delta * 10;
			//console.log(Math.round(m * (1 / (delta * 10))) / (1 / (delta * 10)));
			//console.log(Math.round(m / (delta * 10)) * (delta * 10)); // Pas le même résultat ?

			var mRound = Math.round(m * (1 / delt10)) / (1 / delt10);
			var fmRound = myFun(mRound);

			if (fmRound == Infinity || fmRound == -Infinity) {
				//roots.push(fmRound);
				//console.log(m + " ≈ " + mRound + " : n'est pas une racine mais une asymptote de f");
				roots.push(m);
				ROUND.push(mRound);
				//ERROR.push(delta);
				INFO.push("<p><span class='badge badge-danger'>asymptote, is not a root</span></p>");
			} else {
				roots.push(m);
				ROUND.push(mRound);
				//ERROR.push(delta);
				INFO.push("<p><span class='badge badge-success'>is a root</span><p>");
			}

			// Calcul d'erreur : (b-a)/2^(n+1) ref: https://fr.wikipedia.org/wiki/Méthode_de_dichotomie
			ERROR.push(Math.abs((borneInf - borneSup)) / Math.pow(2, n + 1));
		}
	}

	// Affiche racines
	printRoot(roots);

	// Plot fonction
	plotFonction(traceX, traceY);
}

function plotFonction(traceX, traceY) {
	DIVPLOT = $('plot');
	DIVPLOT.innerHTML = "";

	// Utilisation de l'API Plotly
	var trace = {
		x: traceX,
		y: traceY,
		type: 'scattergl',
		line: {
			color: 'rgb(255,140,0)',
			width: 3
		}
	};

	var layout = {
		yaxis: {
			autorange: true
		}
	};

	// Optimisation de l'affichage pour fun2.
	if ($('fun2').checked) {
		layout = {
			yaxis: {
				range: [-2, 2],
				//autorange: true
			}
		};
	}

	Plotly.newPlot(DIVPLOT, [trace], layout);
}

function printRoot(roots) {
	//console.log(roots);
	var tableRoots = $("tbody");
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

	/*on clear les tableaux */
	ERROR = [];
	INFO = [];
	ROUND = [];
}
