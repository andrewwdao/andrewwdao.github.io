/*============================================================
  Filename: firFilter-08.js
  By: A.R.Collins

  Kaiser FIR Filter generator object, based on c routines
  written for DSP work.

  Requires: Cango-3v28.js
            dspUtils-10.js,
            CangoAxes0v17.js.

  Kindly give credit to Dr A R Collins <http://www.arc.id.au/>
  Report bugs to tony at arc.id.au
  Date   |Description                                     |By
  ------------------------------------------------------------
  12Aug08 First Release                                    ARC
  25Sep09 Dark bkg color for filter plot                   ARC
  08Nov09 Updated to use latest library versions           ARC
  14Nov10 Updated to use dspUtils-08.js                    ARC
  13Oct12 Convert to use Cango                             ARC
  11Mar13 Convert to use setPropertyDefault                ARC
  08Aug13 Convert to use Cango-3v28                        ARC
 =============================================================*/

function KaiserFIR(Fs, Fa, Fb, M, Att) {
    this.Fs = Fs;
    this.Fa = Fa;
    this.Fb = Fb;
    this.M = M; // number of coeffs in filter (symetric)
    this.Np = (M - 1) / 2; // actual munber of coeffs in array
    this.Att = Att;
    this.coeffs = calcFilter(this.Fs, this.Fa, this.Fb, this.M, this.Att);
}

KaiserFIR.prototype.plotCoeffs = function (cvsID) {
    'use strict';

    var g = new Cango(cvsID),
        max = this.coeffs[this.Np],
        data = [],
        bars,
        i;

    g.setViewport();
    g.fillViewport('#303f30');
    g.setViewport(15, 5, 80, 85 / g.aRatio);
    g.setWorldCoords(0, -0.6, this.M, 1.6);
    g.setPropertyDefault('strokeColor', '#eeeeee');
    g.drawXYAxes(0, 0, 0, this.M, -0.6, 1);
    g.setPropertyDefault('strokeColor', 'black');
    // draw as bar graph
    for (i = 0; i < this.M; i++) {
        data.push('M', i, 0, 'L', i, this.coeffs[i] / max);
    }
    bars = g.compilePath(data, 'white', 1, 3);
    g.render(bars);
};

KaiserFIR.prototype.plotFreqResp = function (cvsID) {
    'use strict';

    var g = new Cango(cvsID),
        dF = this.Fs / 1024,
        max = Math.abs(this.coeffs[this.Np]),
        ar = [],
        ai = [],
        fr = [],
        //    fi = [],
        data = [],
        yMin,
        yMax,
        mx = -100,
        xTics,
        j;

    // initialise arrays
    for (j = 0; j < 1024; j++) {
        ar[j] = 0;
        ai[j] = 0;
    }
    // put filter coeffs in real array (centered on x=0, wrapping around 1024 pts)
    ar[0] = this.coeffs[this.Np] / max;
    for (j = 1; j <= this.Np; j++) {
        ar[j] = this.coeffs[this.Np + j] / max;
        ar[1024 - j] = ar[j];
    }
    fft(1, 1024, ar, ai);

    // now form data array to plot
    for (j = 0; j < 512; j++) {
        fr[j] = (10 * Math.log(2 * (ar[j] * ar[j] + ai[j] * ai[j]))) / Math.LN10;
        // fi[j] = Math.atan2(this.ai[i], this.ar[i]);
        if (fr[j] > mx) {
            mx = fr[j];
        }
    }
    yMax = 0;
    yMin = -100;
    // pack data into array for polyline plot (clip data)
    for (j = 0; j < 512; j++) {
        data[2 * j] = j * dF;
        if (fr[j] - mx > yMin) {
            data[2 * j + 1] = fr[j] - mx;
        } else {
            data[2 * j + 1] = yMin;
        }
    }

    xTics = new AxisTicsAuto(0, 512 * dF); // generate auto tic marks on X axis
    g.setViewport();
    g.fillViewport('#303f30');
    g.setViewport(15, 5, 80, 85 / g.aRatio);
    g.setWorldCoords(0, yMin, 512 * dF, yMax - yMin);
    g.setPropertyDefault('strokeColor', '#eeeeee');
    g.drawBoxAxes(0, 512 * dF, yMin, yMax, xTics.ticStep, 10, 'Hz', 'dB', 'Freq Response');

    g.setPropertyDefault('strokeColor', 'white');
    g.drawPath(data);
    g.setPropertyDefault('strokeColor', 'black');
};

KaiserFIR.prototype.listCoeffs = function (txtAreaID) {
    'use strict';
    var taNode = document.getElementById(txtAreaID),
        firList,
        firListNode,
        j;
    // remove existing child txt node
    while (taNode.firstChild) {
        taNode.removeChild(taNode.firstChild);
    }

    // list the coeffs into a sring
    firList = '[';
    for (j = 0; j < this.M - 1; j++) {
        firList += this.coeffs[j].toFixed(6) + ', \r';
    }
    firList += this.coeffs[this.M - 1].toFixed(6) + '] ';

    firListNode = document.createTextNode(firList);
    taNode.appendChild(firListNode);
};
