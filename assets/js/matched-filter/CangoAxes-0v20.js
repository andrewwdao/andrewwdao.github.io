/*=======================================================
  Filename: CangoAxes-0v20.js
  Rev 0
  By: A.R.Collins
  Description: Graph Plotting Support Utilities
  Based on c routines written for DSP work.
  License: Released into the public domain
  latest version at
  <http://www/arc.id.au/>
  Date    Description                               |By
  ------------------------------------------------------
  11Sep12 Renamed from cvxPlotUtils-02.js            ARC
  13Sep12 Converted to Cango methods                 ARC
  17Sep12 Mod to use Obj2D instead of Path2D         ARC
  18Sep12 Update to use only renderObj2D()
          Update the update to render()              ARC
  22Sep12 Update to use Cango25                      ARC
  01Oct12 Update to use Cango36                      ARC
  07Oct12 Update to use Cango38                      ARC
  23Feb13 Included sprintf-php.js                    ARC
  11Mar13 Converted to use setPropertyDefault        ARC
  12Mar13 Updated to use new drawText                ARC
  22Jul13 Tidy code for JSLint                       ARC
  25Jul13 Rotate Y axis lable CCW not CW             ARC
  08Aug13 Convert setViewport to Cango3v28 style by
          adding setWordCoords(0, 0, 100)            ARC
  20Mar14 Cleanup inaccessable code                  ARC
  22Mar14 Remove sprintf to separate module          ARC
  26Mar14 Moved DSP specific scaling fns to dspPlot  ARC
 =======================================================*/

var toEngFixed, toEngPrec, engNotation, AxisTicsAuto, AxisTicsManual;

(function () {
    'use strict';
    function toEngFixed(val, decPlaces) {
        // rounds to X dec places and no stripping of 0s
        var unit = 'pnum kMG',
            man,
            pwr,
            expt = 0,
            str = '';

        if (decPlaces == undefined || decPlaces < 0 || decPlaces > 10) {
            decPlaces = 2;
        }
        man = 0.0;
        if (Math.abs(val) > 1.0e-12) {
            pwr = Math.log(Math.abs(val)) / (3.0 * Math.LN10);
            expt = Math.floor(pwr);
            man = val / Math.pow(1000.0, expt);
            expt *= 3;
        }
        // now force round to decPlaces
        str = man.toFixed(decPlaces);
        // now add the symbol for the exponent
        return str + unit.charAt(expt / 3 + 4);
    }

    toEngPrec = function (val, sigFigs) {
        // rounds to X significant figures and no stripping of 0s
        var unit = 'pnum kMG',
            man = 0,
            pwr,
            expt = 0,
            str = '';

        if (Math.abs(val) > 1.0e-12) {
            pwr = Math.log(Math.abs(val)) / (3.0 * Math.LN10);
            expt = Math.floor(pwr);
            man = val / Math.pow(1000.0, expt);
            expt *= 3;
        }
        str = man.toPrecision(sigFigs);
        // now add the symbol for the exponent
        return str + unit.charAt(expt / 3 + 4);
    };

    AxisTicsAuto = function (mn, mx) {
        // optional 'numTics' forces the value of numSteps
        /* Calculate the tic mark spacing for graph plotting
         * Given the minimum and maximum values of the axis
         * returns the first tic value and the tic spacing.
         * The algorithm gives tic spacing of 1, 2, 5, 10, 20 etc
         * and a number of ticks from ~5 to ~11
         */
        var pwr, spanman, stepman, spanexp, stepexp;

        this.tic1 = 0;
        this.ticStep = 0;

        if (mn >= mx) {
            alert('Max must be greater than Min!');
            return;
        }

        pwr = Math.log(mx - mn) / Math.LN10;
        if (pwr < 0.0) {
            spanexp = Math.floor(pwr) - 1;
        } else {
            spanexp = Math.floor(pwr);
        }
        spanman = (mx - mn) / Math.pow(10.0, spanexp);
        if (spanman >= 5.5) {
            spanexp += 1;
            spanman /= 10.0;
        }
        stepman = 0.5;
        if (spanman < 2.2) {
            stepman = 0.2;
        }
        if (spanman < 1.1) {
            stepman = 0.1;
        }
        stepexp = 3 * Math.floor(spanexp / 3);
        if (spanexp < 0 && spanexp % 3 != 0) {
            stepexp -= 3;
        }
        stepman = stepman * Math.pow(10.0, spanexp - stepexp);
        this.ticStep = stepman * Math.pow(10.0, stepexp);
        if (mn >= 0.0) {
            this.tic1 = (Math.floor(mn / this.ticStep - 0.01) + 1) * this.ticStep; // avoid math noise
        } else {
            this.tic1 = -Math.floor(-mn / this.ticStep + 0.01) * this.ticStep; // avoid math noise
        }

        /*  var str = "";
      str += "ymin="+mn+"  ymax="+mx+"\n";
      str += "tic1= "+this.tic1+ "\n";
      str += "ticStep= "+this.ticStep+ "\n";
      alert(str);
  */
    };

    AxisTicsManual = function (xmin, xmax, xMn, xMj) {
        var dx; // tolerance for avoiding maths noise

        this.tic1 = 0;
        this.ticStep = 0;
        this.lbl1 = 0;
        this.lblStep = 0;
        this.ticScl = 0; // reserved for future use

        if (xmin === undefined || xmax === undefined || xMn === undefined || xMn <= 0) {
            return;
        }

        dx = 0.01 * xMn;
        this.tic1 = xMn * Math.ceil((xmin - dx) / xMn);
        this.ticStep = xMn;

        if (xMj !== undefined && xMj > 0) {
            this.lblStep = this.ticStep * Math.round(xMj / xMn);
            dx = 0.01 * xMn;
            this.lbl1 = this.lblStep * Math.ceil((xmin - dx) / this.lblStep);
        }
        // OPTION:
        // to make all labels have same scale factor, calc lastTic and corresponding tag "m kMG" etc
        // calc engnotation for xTic1 exp=xTicScl, tag=xTicTag
        // plot x = xtic1 + n*xTicStep
        // label x/xTicScl+xTicTag
    };

    Cango.prototype.drawAxes = function (xOrg, yOrg, xMin, xMax, yMin, yMax, xMinTic, yMinTic, xMajTic, yMajTic, x10ths, y10ths) {
        var x,
            y,
            pos,
            data = [],
            ticLen = 0.6, // 0.6% of width of canvas
            lblOfs = 2.5, // 2.5% of width of canvas
            lorg = 1,
            side = 1,
            tickCmds,
            xTics,
            yTics,
            isoGC; // 1 or -1 depending on the side of the axis to label

        // to get uniform tick lengths and label positions create a isotropic set of world coords where x axis is 100 units
        isoGC = new Cango(this.cId); // copy the canvas ID from current context
        isoGC.dupCtx(this);
        isoGC.setViewport(); // full screen
        isoGC.setWorldCoords(0, 0, 100); // viewport coords (x axis 100 units y axis same unit)
        // draw all ticks in world coords set using this.toViewportCoords().

        tickCmds = this.compilePath(['M', -1, 0, 'L', 1, 0]); // tick line +/- 1 unit about center reference
        xTics = new AxisTicsManual(xMin, xMax, xMinTic, xMajTic);
        yTics = new AxisTicsManual(yMin, yMax, yMinTic, yMajTic);

        // draw axes
        data = ['M', xMin, yOrg, 'L', xMax, yOrg, 'M', xOrg, yMin, 'L', xOrg, yMax];
        this.drawPath(data);
        // X axis tick marks
        if (xTics.ticStep) {
            for (x = xTics.tic1; x <= xMax; x += xTics.ticStep) {
                pos = this.toViewportCoords(x, yOrg);
                isoGC.render(tickCmds, pos.x, pos.y, ticLen, 90);
            }
        }
        // Y axis tick marks
        if (yTics.ticStep) {
            for (y = yTics.tic1; y <= yMax; y += yTics.ticStep) {
                pos = this.toViewportCoords(xOrg, y);
                isoGC.render(tickCmds, pos.x, pos.y, ticLen, 0);
            }
        }
        // major ticks X axis
        if (xTics.lblStep) {
            for (x = xTics.lbl1; x <= xMax; x += xTics.lblStep) {
                pos = this.toViewportCoords(x, yOrg);
                isoGC.render(tickCmds, pos.x, pos.y, 2 * ticLen, 90);
            }
        }
        // major ticks Y axis
        if (yTics.lblStep) {
            for (y = yTics.lbl1; y <= yMax; y += yTics.lblStep) {
                pos = this.toViewportCoords(xOrg, y);
                isoGC.render(tickCmds, pos.x, pos.y, 2 * ticLen, 0);
            }
        }
        // now label the axes
        if (xTics.lblStep) {
            // X axis, decide whether to label above or below X axis
            if ((yOrg < yMin + 0.55 * (yMax - yMin) && this.yscl < 0) || (yOrg > yMin + 0.45 * (yMax - yMin) && !(this.yscl < 0))) {
                // x axis on bottom half of screen
                side = -1;
                lorg = 2;
            } else {
                side = 1;
                lorg = 8;
            }
            for (x = xTics.lbl1; x <= xMax; x += xTics.lblStep) {
                // skip label at the origin if it would be on the other axis
                if (x == xOrg && yOrg > yMin && yOrg < yMax) {
                    continue;
                }
                pos = this.toViewportCoords(x, yOrg);
                isoGC.drawText(engNotation(x, x10ths), pos.x, pos.y + side * lblOfs, null, 10, lorg); // use default strokeColor
            }
        }

        if (yTics.lblStep) {
            // Y axis, decide whether to label to right or left of Y axis
            if ((xOrg < xMin + 0.5 * (xMax - xMin) && this.xscl > 0) || (xOrg > xMin + 0.5 * (xMax - xMin) && !(this.xscl > 0))) {
                // y axis on left half of screen
                side = -1;
                lorg = 6;
            } else {
                side = 1;
                lorg = 4;
            }
            for (y = yTics.lbl1; y <= yMax; y += yTics.lblStep) {
                // skip label at the origin if it would be on the other axis
                if (y == yOrg && xOrg > xMin && xOrg < xMax) {
                    continue;
                }
                pos = this.toViewportCoords(xOrg, y);
                isoGC.drawText(engNotation(y, y10ths), pos.x + side * lblOfs, pos.y, null, 10, lorg);
            }
        }
    };

    Cango.prototype.drawBoxAxes = function (xMin, xMax, yMin, yMax, xMn, yMn, xUnits, yUnits, title) {
        var x,
            y,
            pos,
            data = [],
            ticLen = 1, // 1% of width of canvas
            lblOfs = 1.6, // 1.6% of width of canvas
            lbl,
            tickCmds,
            xTics,
            yTics,
            savPenCol = this.penCol,
            isoGC;

        // to get uniform tick lengths and label positions create a isotropic set of world coords where x axis is 100 units
        isoGC = new Cango(this.cId); // copy the canvas ID from current context
        isoGC.dupCtx(this); // copy penCol, rotation etc
        isoGC.setViewport(); // full screen
        isoGC.setWorldCoords(0, 0, 100); // viewport coords (x axis 100 units y axis same unit)
        // draw all ticks in these world coords using this.toViewportCorrds().
        this.setPropertyDefault('strokeColor', '#cccccc');
        isoGC.setPropertyDefault('strokeColor', '#cccccc');

        tickCmds = this.compilePath(['M', -1, 0, 'L', 0, 0], 'rgba(255,255,255,0.2)'); // tick 1 unit left of reference
        xTics = new AxisTicsManual(xMin, xMax, xMn);
        yTics = new AxisTicsManual(yMin, yMax, yMn);
        // Draw box axes
        data = ['M', xMin, yMin, 'L', xMin, yMax, xMax, yMax, xMax, yMin, 'z'];
        this.drawPath(data, 0, 0, '#cccccc');

        if (xMn == undefined) {
            return;
        }
        for (x = xTics.tic1; x <= xMax; x += xTics.ticStep) {
            pos = this.toViewportCoords(x, yMin);
            isoGC.render(tickCmds, pos.x, pos.y, ticLen, 90); // just draw the tick mark
            if (x != xMin && x != xMax) {
                // no dots on the box
                this.drawPath(['M', x, yMin, 'L', x, yMax], 0, 0, 'rgba(255,255,255,0.2)');
            }
        }
        if (yMn == undefined) {
            return;
        }
        for (y = yTics.tic1; y <= yMax; y += yTics.ticStep) {
            pos = this.toViewportCoords(xMin, y);
            isoGC.render(tickCmds, pos.x, pos.y, ticLen, 0); // just draw the tick mark
            if (y != yMin && y != yMax) {
                this.drawPath(['M', xMin, y, 'L', xMax, y], 0, 0, 'rgba(255,255,255,0.2)');
            }
        }
        // Now labels, X axis, label only first and last tic below X axis
        x = xTics.tic1;
        pos = this.toViewportCoords(x, yMin);
        isoGC.drawText(engNotation(x), pos.x, pos.y - lblOfs, null, 10, 1);
        while (x + xTics.ticStep <= 1.05 * xMax) {
            x += xTics.ticStep;
        }
        pos = this.toViewportCoords(x, yMin);
        isoGC.drawText(engNotation(x), pos.x, pos.y - lblOfs, null, 10, 3);
        // Y axis, label bottom and top tics to left of Y axis
        y = yTics.tic1;
        pos = this.toViewportCoords(xMin, y);
        isoGC.drawText(engNotation(y), pos.x - lblOfs, pos.y, null, 10, 6);
        while (y + yTics.ticStep <= 1.05 * yMax) {
            y += yTics.ticStep;
        }
        pos = this.toViewportCoords(xMin, y);
        isoGC.drawText(engNotation(y), pos.x - lblOfs, pos.y, null, 10, 6);
        // x axis label
        if (typeof xUnits == 'string') {
            lbl = engNotation(xTics.ticStep) + xUnits + '/div';
        } else {
            lbl = engNotation(xTics.ticStep) + '/div';
        }
        x = xMin + (xMax - xMin) / 2;
        pos = this.toViewportCoords(x, yMin);
        isoGC.drawText(lbl, pos.x, pos.y - lblOfs, null, 10, 2);
        // y axis label
        if (typeof yUnits == 'string') {
            lbl = engNotation(yTics.ticStep) + yUnits;
        } else {
            lbl = engNotation(yTics.ticStep);
        }
        y = yMin + (yMax - yMin) / 2;
        pos = this.toViewportCoords(xMin, y);
        isoGC.drawText(lbl, pos.x - lblOfs, pos.y, null, 10, 9);
        y = yMin + (yMax - yMin) / 2.15;
        pos = this.toViewportCoords(xMin, y);
        isoGC.drawText('/div', pos.x - lblOfs, pos.y, null, 10, 3);
        // title
        if (typeof title == 'string') {
            pos = this.toViewportCoords(xMin, yMax);
            isoGC.drawText(title, pos.x, pos.y + lblOfs, null, 10, 7);
        }
        // restore the strokeColor
        this.setPropertyDefault('strokeColor', savPenCol);
    };

    Cango.prototype.drawXYAxes = function (xOrg, yOrg, xMin, xMax, yMin, yMax, xUnits, yUnits, xLabel, yLabel) {
        var pos,
            dataCmds,
            xOfs = 6,
            yOfs = 9,
            lorg = 1,
            side = 1, // 1 or -1 depending on the side of the axis to label
            xTics,
            yTics,
            xU = '',
            yU = '',
            xL = '',
            yL = '',
            isoGC;
        // to get uniform tick lengths and label positions create a isotropic set of world coords where x axis is 100 units
        isoGC = new Cango(this.cId); // copy the canvas ID from current context
        isoGC.dupCtx(this);
        isoGC.setViewport(); // full screen
        isoGC.setWorldCoords(0, 0, 100); // viewport coords (x axis 100 units y axis same unit)
        // draw all ticks in world coords using this.toViewportCorrds().
        xTics = new AxisTicsAuto(xMin, xMax);
        yTics = new AxisTicsAuto(yMin, yMax);

        this.drawAxes(xOrg, yOrg, xMin, xMax, yMin, yMax, xTics.ticStep, yTics.ticStep, 2 * xTics.ticStep, 2 * yTics.ticStep);
        if (xUnits != undefined && xUnits.length > 0) {
            xU = '(' + xUnits + ')';
        }
        if (yUnits != undefined && yUnits.length > 0) {
            yU = '(' + yUnits + ')';
        }

        if (xLabel != undefined && xLabel.length > 0) {
            xL = xLabel;
        }
        if (yOrg < yMin + 0.55 * (yMax - yMin)) {
            side = -1;
            lorg = 3;
        } else {
            side = 1;
            lorg = 9;
        }
        pos = this.toViewportCoords(xMax, yOrg);
        dataCmds = isoGC.compileText(xL + xU, null, 13, 400, lorg);
        isoGC.render(dataCmds, pos.x, pos.y + side * xOfs);

        if (yLabel != undefined && yLabel.length > 0) {
            yL = yLabel;
        }
        // Y axis, decide whether to label to right or left of Y axis
        if (xOrg < xMin + 0.5 * (xMax - xMin)) {
            // y axis on left half of screen
            side = -1;
            lorg = this.yscl < 0 ? 9 : 7;
        } else {
            side = 1;
            lorg = this.yscl < 0 ? 3 : 1;
        }
        pos = this.toViewportCoords(xOrg, yMax);
        dataCmds = isoGC.compileText(yL + yU, null, 13, 400, lorg);
        isoGC.render(dataCmds, pos.x + side * yOfs, pos.y, 1, 90);
    };

    engNotation = function (val, tenthsOK) {
        // rounds to 2 dec places and strips trailing 0s
        var unit = 'pnum kMG',
            man = 0.0,
            pwr,
            expt = 0,
            str = '';

        if (Math.abs(val) > 1.0e-12) {
            if (tenthsOK) {
                pwr = Math.log(Math.abs(10 * val)) / (3.0 * Math.LN10); // calc exp on 10 x val allows .9 not 900m
            } else {
                pwr = Math.log(Math.abs(val)) / (3.0 * Math.LN10);
            }
            expt = Math.floor(pwr);
            man = val / Math.pow(1000.0, expt);
            expt *= 3;
        }
        // now force round to decPlaces
        str = man.toFixed(2);
        // now strip trailing 0s
        while (str.charAt(str.length - 1) == '0') {
            str = str.substring(0, str.length - 1);
        }
        if (str.charAt(str.length - 1) == '.') {
            str = str.substring(0, str.length - 1);
        }
        // now add the symbol for the exponent
        if (expt) {
            return str + unit.charAt(expt / 3 + 4);
        }

        return str; // dont add unnecessary space
    };
})();
