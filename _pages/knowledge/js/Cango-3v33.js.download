/*==========================================================================
  Filename: Cango-3v33.js
  Rev: 3
  By: A.R.Collins
  Description: A graphics library for the canvas element.
  License: Released into the public domain
  latest version at
  <http://www/arc.id.au/CanvasGraphics.html>
  Report bugs to tony at arc.id.au

  Date   |Description                                          |By
  --------------------------------------------------------------------------
  14Oct12 Rev 1.00 First release based on Cango0v43             ARC
  23Oct12 bugfix: xRef,yRef not scaled in most compile methods
          don't pre-scale xRef, yRef in compile methods         ARC
  24Oct12 Give Obj2D methods to simplify compile methods        ARC
  25Oct12 Eliminated group etc. Just use arrays
          Renamed movePoints etc to translate, rotate, scale
          Pass render arguments to color functions              ARC
  26Oct12 Restored the xRef,yRef parameters to compileSvg cmds
          bugfix: restore scaling of font weight                ARC
  27Oct12 Removed iso commands - use 'iso' parameter instead
          bugfix: obj.translate and compileSvg used opposite
          sign conventions - switch compileSvg                  ARC
  11Nov12 removed Object.clone to avoid conflicts with 3rd
          party code (eg ACE editor)                            ARC
  19Nov12 Added to toWorldCoords                                ARC
  20Nov12 Added Obj2D.path to hold 'as rendered' coords
          Added Obj2D.dragNdrop, to hold Drag2D obj             ARC
  24Nov12 Added support for dragNdrop for rotated images
          Removed setRotation clearRotation capability          ARC
  25Nov12 Re-wrote paintPath to better use position transform
          Drag event handlers called in scope of dragNdrop obj
          Re-wrote paintImg to clarify draw origin offsets      ARC
  26Nov12 Added dragNdrop capability to TEXT objects            ARC
  27Nov12 Added Drag2D object, changed .path to .pxOutline
          Added 'as rendered' pxOrg (needed by enableDrag)      ARC
  29Nov11 Added parent as a Drag2D property                     ARC
          Released as Cango2v00                                 ARC
  30Nov12 Added Obj2D.setStrokeWidth
          Made drawPath scl factor permanent, used Obj2D.scale
          Made drawShape scl factor permanent, used Obj2D.scale ARC
  20Dec12 Enabled compileShape to accept numeric data           ARC
  02Jan13 Added stopAnimation,
          Removed animTranslate, animRotate, animScale          ARC
  13Jan13 Changed the shapeDefs to match Cango3D                ARC
  24Jan13 Added cross and ex to shapeDefs                       ARC
  31Jan13 bugfix: multiple Cango contexts over-writing
          mousedown event handler, fixed with global _draggable ARC
  16Feb13 Added Obj2D.appendPath and Obj2D.revWinding           ARC
  19Feb13 Added Obj2D.clipPath                                  ARC
  26Feb13 Use off-screen buffer and bitblt to screen canvas     ARC
  27Feb13 Added shim for isArray, and used it throughout        ARC
  28Feb13 bugfix: bitblt buffer after clearCanvas etc           ARC
  01Mar13 Allow optional direct drawing if node passed in
          Remove useless clearRect before bitblt                ARC
  02Mar13 Added support for multiple animations in one context  ARC
  03Mar13 Added deleteAnimation and uniqueId methods
          reverted to non-buffered drawing                      ARC
  04Mar13 Added pause and step to animations                    ARC
  05Mar13 Added setStepTIme                                     ARC
  06Mar13 Buffer animation drawing and bitblt completed frames  ARC
  10Mar13 Use setProperty and setPropertyDefault methods        ARC
  11Mar13 Added scl parameter to compilePath and compileShape
          Added lineWidth as parameter to compilePath
          dropped strokeColor parm from drawShape
          changed order of parms in drawPath and drawShape
          Added fontWeight and color as compileText parms       ARC
  12Mar13 Added fontSize and fontWeight to settable properties  ARC
  27Mar13 Use native canvasText                                 ARC
  02Apr13 Give clearCanvas an optional fill color               ARC
  28Apr13 bugfix: compile 's' command missing +x, +y            Ales Seifert
  01May13 Make strokeWidth scale with any path scaling          ARC
  31May13 bugfix: typo in clipPath                              ARC
  01Jun13 Use "TEXT","IMG","PATH","SHAPE" instead of objType
          bugfix: _resized etc should be Objects not Arrays
          Many style changes to make JSLint happy               ARC
  02Jun13 Cursor position and csr offsets all in world coords
          bugfix: no check if draggable already in _draggables  ARC
  03Jun13 Tidy render code                                      ARC
  06Jun13 bugfix: enableDrag had bad toWorldCoords call and
          reference to invalid pxOrgX and pxOrgY.
          Cleanup Cango mousedown handler                       ARC
  23Jul13 Re-write based on Cango2v38 and features from Cango2D ARC
  26Jul13 Removed drag as a parameter from methods              ARC
  27Jul13 Add createLayer and deleteLayer methods               ARC
  01Aug13 Put Animation stuff back in (was to be out of Ver3)   ARC
  03Aug13 Added support for Sprites                             ARC
  04Aug13 Add createSprite and _paintSprite                     ARC
  05Aug13 Make Sprite an object with gc and buf properties
          bugfix: bad test for animation.id in deleteAnimation  ARC
  06Aug13 bugfix: img, text, sprite bounding box not scaled
          by render scale factor
          Remove sprites, use off screen drawing and bitblt     ARC
  07Jun13 Add toImgObj
          bugfix: img rotation convention in wrong direction    ARC
  08Aug13 Change setWorldCoords parameters to
          llx, lly, Xspan, Yspan to match Cango2D and Cango3D
          bugfix: txt rotation convention in wrong direction    ARC
  09Aug13 Swicth Xspan Yspan to spanX spanY to match Cango3D
          bugfix: rAF not passing good time, use Date.now       ARC
  12Aug13 Make rAF shim separate namespace (function)           ARC
  19Mar14 render to accept Obj2D or array of Obj2D and now
          array elements may be nested arrays of Obj2D etc      ARC
  20Mar14 bugfix: text imgX,imgY not scaling with font          ARC
  02Apr14 bugfix: transforms using invalid this.xscl,this.yscl
          (bug??) Make all Obj2D transforms 'iso'               ARC
  ==========================================================================*/

  var Cango, Drag2D, svgToCgo2D, shapeDefs,
      _resized,   // keep track of which canvases are initialised
      _buf,       // each screen canvas will have an off-screen buffer
      _draggable, // array of Obj2Ds that are draggable for each canvas
      _overlays;  // array of overlays for each canvas

(function()
{
  /*-----------------------------------------------------------------------------------------
   * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
   * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
   * requestAnimationFrame polyfill by Erik Möller
   * fixes from Paul Irish and Tino Zijdel
   *----------------------------------------------------------------------------------------*/
  var lastTime = 0;
  var vendors = ['webkit', 'moz'];
  var x;
  for(x = 0; x < vendors.length && !window.requestAnimationFrame; ++x)
  {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame =
      window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
  {
    window.requestAnimationFrame = function(callback)
    {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function(){callback(currTime + timeToCall);}, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame)
  {
    window.cancelAnimationFrame = function(id) {clearTimeout(id);};
  }

}());

 /*-----------------------------------------------------------------------------------------*/

(function()
{
  "use strict";

  var uniqueVal = 0;    // used to generate unique value for different Cango instances

  if (!Date.now)
  {
    Date.now = function now()
    {
      return new Date().getTime();
    };
  }

  var isArray = function(obj)
  {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  var isNumber = function(o)
  {
    return !isNaN(o) && o !== null && o !== "" && o !== false;
  };

  // simple add event handler that has the handlers called in the sequence that they were set
  var addLoadEvent = function(obj, func)
  {
  	var oldonload = obj.onload;

  	if (typeof(obj.onload) != "function")
    {
      obj.onload = func;
    }
  	else
    {
    	obj.onload = function(){ oldonload(); func(); };
    }
  };

  var addEvent = function(element, eventType, handler)
  {
    if (element.attachEvent)
    {
     return element.attachEvent('on'+eventType, handler);
    }
    return element.addEventListener(eventType, handler, false);
  };

  var removeEvent = function(element, eventType, handler)
  {
   if (element.removeEventListener)
   {
      element.removeEventListener (eventType, handler, false);
   }
   if (element.detachEvent)
   {
      element.detachEvent ('on'+eventType, handler);
   }
  };

  if (!Array.prototype.contains)
  {
    Array.prototype.contains = function(obj)
    {
      var i = this.length;
      while (i--)
      {
        if (this[i] === obj)
        {
          return true;
        }
      }
      return false;
    };
  }

  if (!('indexOf' in Array.prototype))
  {
    Array.prototype.indexOf= function(find, i /*opt*/)
    {
      var n;
      if (i===undefined)
      {
        i= 0;
      }
      if (i<0)
      {
        i+= this.length;
      }
      if (i<0)
      {
        i= 0;
      }
      for (n = this.length; i < n; i++)
      {
        if (i in this && this[i]===find)
        {
          return i;
        }
      }
      return -1;
    };
  }

  if (!Array.prototype.map)
  {
    Array.prototype.map = function(fun, thisArg)
    {
      var i;
      var len = this.length;
      if (typeof fun != "function")
      {
        throw new TypeError();
      }
      var res = [];
      var thisp = thisArg;
      for (i = 0; i < len; i++)
      {
        if (this.hasOwnProperty(i))
        {
          res[i] = fun.call(thisp, this[i], i, this);
        }
      }
      return res;
    };
  }

  if (typeof _resized != "object")
  {
     _resized = {};   // keep track of which canvases are initialised
  }

  if (typeof _buf != "object")
  {
     _buf = {};       // keep track of which canvases are buffered
  }

  if (typeof _draggable != "object")
  {
     _draggable = {};   // keep track of draggable objects on each canvas
  }

  if (typeof _overlays != "object")
  {
     _overlays = {};   // keep track of draggable objects on each canvas
  }

  if (shapeDefs === undefined)
  {
    shapeDefs = {'circle':  ["M", -0.5,0,
                            "C", -0.5, -0.27614, -0.27614, -0.5, 0, -0.5,
                            "C", 0.27614, -0.5, 0.5, -0.27614, 0.5, 0,
                            "C", 0.5, 0.27614, 0.27614, 0.5, 0, 0.5,
                            "C", -0.27614, 0.5, -0.5, 0.27614, -0.5, 0],
                'square':  ['M', 0.5, -0.5, 'l', 0, 1, -1, 0, 0, -1, 'z'],
                'triangle':['M', 0.5, -0.289, 'l', -0.5, 0.866, -0.5, -0.866, 'z'],
                'cross':   ['M', -0.5, 0, 'l', 1, 0, 'M', 0, -0.5, 'l', 0, 1],
                'ex':      ['M', -0.3535,-0.3535, 'L',0.3535,0.3535,
                            'M',-0.3535,0.3535, 'L',0.3535,-0.3535]};
  }

  function DrawCmd(cmdStr, coords)   // canvas syntax draw commands
  {
    this.drawFn = cmdStr;       // String version of the canvas command to call
    this.parms = coords || [];  // world coordinates in [cp1x,cp1y, cp2x,cp2y, ... x,y]
    this.parmsPx = [];          // parms transformed into pixel coords
  }

  /* =============================================================================
   * Convert Cgo2D data array ['M',x,y2, 'L',x,y2, ... 'Q',cx,cy2,x,y2, 'A',x,y ]
   * to array of canvas DrawCmd {drawFn:'moveTo', [x,y]}
   * ----------------------------------------------------------------------------*/
  function cgo2DtoDrawCmd(path, scl)
  {
    var x = 0,
        y = 0,
        px, py,
        c1x, c1y,
        rot, rx, ry, larc, swp,
        arc_segs,
        cmd, pc,
        cmdObj,
        seg, coords,
        commands = [],
        xScale = scl || 1,
        yScale = xScale,
        xOfs = 0,          // move the shape drawing origin
        yOfs = 0,
        i, j,
        segments = [];

    function segmentToBezier(cx, cy, th0, th1, rx, ry, sin_th, cos_th)
    {
      var a00 = cos_th * rx,
          a01 = -sin_th * ry,
          a10 = sin_th * rx,
          a11 = cos_th * ry,
          th_half = 0.5 * (th1 - th0),
          t = (8/3) * Math.sin(th_half * 0.5) * Math.sin(th_half * 0.5) / Math.sin(th_half),
          x1 = cx + Math.cos(th0) - t * Math.sin(th0),
          y1 = cy + Math.sin(th0) + t * Math.cos(th0),
          x3 = cx + Math.cos(th1),
          y3 = cy + Math.sin(th1),
          x2 = x3 + t * Math.sin(th1),
          y2 = y3 - t * Math.cos(th1);

      return [ a00 * x1 + a01 * y1, a10 * x1 + a11 * y1,
               a00 * x2 + a01 * y2, a10 * x2 + a11 * y2,
               a00 * x3 + a01 * y3, a10 * x3 + a11 * y3 ];
    }

    function arcToBezier(ox, oy, radx, rady, rotateX, large, sweep, x, y)
    {
      var th = rotateX * (Math.PI/180),
          sin_th = Math.sin(th),
          cos_th = Math.cos(th),
          rx = Math.abs(radx),
          ry = Math.abs(rady),
          px, py, pl,
          a00, a01, a10, a11,
          x0, y0, x1, y1,
          d,
          sfactor_sq,
          sfactor,
          xc, yc,
          th0, th1, th_arc,
          segments,
          result = [],
          i, th2, th3;

      px = cos_th * (ox - x) * 0.5 + sin_th * (oy - y) * 0.5;
      py = cos_th * (oy - y) * 0.5 - sin_th * (ox - x) * 0.5;
      pl = (px*px) / (rx*rx) + (py*py) / (ry*ry);
      if (pl > 1)
      {
        pl = Math.sqrt(pl);
        rx *= pl;
        ry *= pl;
      }
      a00 = cos_th / rx;
      a01 = sin_th / rx;
      a10 = -sin_th / ry;
      a11 = cos_th / ry;
      x0 = a00 * ox + a01 * oy;
      y0 = a10 * ox + a11 * oy;
      x1 = a00 * x + a01 * y;
      y1 = a10 * x + a11 * y;
      d = (x1-x0) * (x1-x0) + (y1-y0) * (y1-y0);
      sfactor_sq = 1 / d - 0.25;
      if (sfactor_sq < 0)
      {
        sfactor_sq = 0;
      }
      sfactor = Math.sqrt(sfactor_sq);
      if (sweep == large)
      {
        sfactor = -sfactor;
      }
      xc = 0.5 * (x0 + x1) - sfactor * (y1-y0);
      yc = 0.5 * (y0 + y1) + sfactor * (x1-x0);
      th0 = Math.atan2(y0-yc, x0-xc);
      th1 = Math.atan2(y1-yc, x1-xc);
      th_arc = th1-th0;
      if (th_arc < 0 && sweep == 1)
      {
        th_arc += 2*Math.PI;
      }
      else if (th_arc > 0 && sweep == 0)
      {
        th_arc -= 2 * Math.PI;
      }
      segments = Math.ceil(Math.abs(th_arc / (Math.PI * 0.5 + 0.001)));
      for (i=0; i<segments; i++)
      {
        th2 = th0 + i * th_arc / segments;
        th3 = th0 + (i+1) * th_arc / segments;
        result.push(segmentToBezier(xc, yc, th2, th3, rx, ry, sin_th, cos_th));
      }

      return result;
    }

    if (!isArray(path))
    {
      return commands;
    }
    // break the array into command segments
    if (typeof path[0] == 'number')
    {
      // special case of data only array. Test if 1st element is a number then
      // treat array as 'M', x0, y0, 'L', x1, y1, x2, y2, ... ]
      segments[0] = ['M', path[0], path[1]];
      var lineSeg = ['L'];
      for (j=2,i=2; i<path.length; i++)
      {
        if (typeof path[i] != 'number')
        {
          break;
        }
      }
      segments[1] = lineSeg.concat(path.slice(j,i));
    }
    else
    {
      for(j=0, i=1; i<path.length; i++)
      {
        if (typeof path[i] == 'string')
        {
          segments.push(path.slice(j,i));
          j = i;
        }
      }
      segments.push(path.slice(j,i));    // push the last command out
    }

    for (i=0; i<segments.length; i++)
    {
      seg = segments[i];
      cmd = seg[0];
      if ((i==0)&&(cmd != 'M'))   // check that the first move is absolute
      {
        cmd = 'M';
      }
      coords = seg.slice(1);      // skip the command copy coords
      if (coords)
      {
        coords = coords.map(parseFloat);
      }
      switch(cmd)
      {
        case 'M':
          x = xOfs + xScale*coords[0];
          y = yOfs + yScale*coords[1];
          px = py = null;
          cmdObj = new DrawCmd('moveTo', [x, y]);
          commands.push(cmdObj);
          coords.splice(0, 2);      // delete the 2 coords from the front of the array
          while (coords.length>0)
          {
            x = xOfs + xScale*coords[0];            // eqiv to muliple 'L' calls
            y = yOfs + yScale*coords[1];
            cmdObj = new DrawCmd('lineTo', [x, y]); // any coord pair after first move is regarded as line
            commands.push(cmdObj);
            coords.splice(0, 2);
          }
          break;
        case 'm':
          x += xScale*coords[0];
          y += yScale*coords[1];
          px = py = null;
          cmdObj = new DrawCmd('moveTo', [x, y]);
          commands.push(cmdObj);
          coords.splice(0, 2);      // delete the 2 coords from the front of the array
          while (coords.length>0)
          {
            x += xScale*coords[0];                  // eqiv to muliple 'l' calls
            y += yScale*coords[1];
            cmdObj = new DrawCmd('lineTo', [x, y]); // any coord pair after first move is regarded as line
            commands.push(cmdObj);
            coords.splice(0, 2);
          }
          break;
        case 'L':
          while (coords.length>0)
          {
            x = xOfs + xScale*coords[0];
            y = yOfs + yScale*coords[1];
            cmdObj = new DrawCmd('lineTo', [x, y]);
            commands.push(cmdObj);
            coords.splice(0, 2);
          }
          px = py = null;
          break;
        case 'l':
          while (coords.length>0)
          {
            x += xScale*coords[0];
            y += yScale*coords[1];
            cmdObj = new DrawCmd('lineTo', [x, y]);
            commands.push(cmdObj);
            coords.splice(0, 2);
          }
          px = py = null;
          break;
        case 'H':
          x = xOfs + xScale*coords[0];
          px = py = null ;
          cmdObj = new DrawCmd('lineTo', [x, y]);
          commands.push(cmdObj);
          break;
        case 'h':
          x += xScale*coords[0];
          px = py = null ;
          cmdObj = new DrawCmd('lineTo', [x, y]);
          commands.push(cmdObj);
          break;
        case 'V':
          y = yOfs + yScale*coords[0];
          px = py = null;
          cmdObj = new DrawCmd('lineTo', [x, y]);
          commands.push(cmdObj);
          break;
        case 'v':
          y += yScale*coords[0];
          px = py = null;
          cmdObj = new DrawCmd('lineTo', [x, y]);
          commands.push(cmdObj);
          break;
        case 'C':
          while (coords.length>0)
          {
            c1x = xOfs + xScale*coords[0];
            c1y = yOfs + yScale*coords[1];
            px = xOfs + xScale*coords[2];
            py = yOfs + yScale*coords[3];
            x = xOfs + xScale*coords[4];
            y = yOfs + yScale*coords[5];
            cmdObj = new DrawCmd('bezierCurveTo', [c1x, c1y, px, py, x, y]);
            commands.push(cmdObj);
            coords.splice(0, 6);
          }
          break;
        case 'c':
          while (coords.length>0)
          {
            c1x = x + xScale*coords[0];
            c1y = y + yScale*coords[1];
            px = x + xScale*coords[2];
            py = y + yScale*coords[3];
            x += xScale*coords[4];
            y += yScale*coords[5];
            cmdObj = new DrawCmd('bezierCurveTo', [c1x, c1y, px, py, x, y]);
            commands.push(cmdObj);
            coords.splice(0, 6);
          }
          break;
        case 'S':
          if (px == null || !pc.match(/[sc]/i))
          {
            px = x;                // already absolute coords
            py = y;
          }
          cmdObj = new DrawCmd('bezierCurveTo', [x-(px-x), y-(py-y),
                                                xOfs + xScale*coords[0], yOfs + yScale*coords[1],
                                                xOfs + xScale*coords[2], yOfs + yScale*coords[3]]);
          commands.push(cmdObj);
          px = xOfs + xScale*coords[0];
          py = yOfs + yScale*coords[1];
          x = xOfs + xScale*coords[2];
          y = yOfs + yScale*coords[3];
          break;
        case 's':
          if (px == null || !pc.match(/[sc]/i))
          {
            px = x;
            py = y;
          }
          cmdObj = new DrawCmd('bezierCurveTo', [x-(px-x), y-(py-y),
                                                x + xOfs + xScale*coords[0], y + yOfs + yScale*coords[1],
                                                x + xOfs + xScale*coords[2], y + yOfs + yScale*coords[3]]);
          commands.push(cmdObj);
          px = x + xScale*coords[0];
          py = y + yScale*coords[1];
          x += xScale*coords[2];
          y += yScale*coords[3];
          break;
        case 'Q':
          px = xOfs + xScale*coords[0];
          py = yOfs + yScale*coords[1];
          x = xOfs + xScale*coords[2];
          y = yOfs + yScale*coords[3];
          cmdObj = new DrawCmd('quadraticCurveTo', [px, py, x, y]);
          commands.push(cmdObj);
          break;
        case 'q':
          cmdObj = new DrawCmd('quadraticCurveTo', [x + xScale*coords[0], y + yScale*coords[1],
                                                    x + xScale*coords[2], y + yScale*coords[3]]);
          commands.push(cmdObj);
          px = x + xScale*coords[0];
          py = y + yScale*coords[1];
          x += xScale*coords[2];
          y += yScale*coords[3];
          break;
        case 'T':
          if ((px == null) || (!pc.match(/[qt]/i)))
          {
            px = x;
            py = y;
          }
          else
          {
            px = x-(px-x);
            py = y-(py-y);
          }
          cmdObj = new DrawCmd('quadraticCurveTo', [px, py,
                                                    xOfs + xScale*coords[0], yOfs + yScale*coords[1]]);
          commands.push(cmdObj);
          px = x-(px-x);
          py = y-(py-y);
          x = xOfs + xScale*coords[0];
          y = yOfs + yScale*coords[1];
          break;
        case 't':
          if (px == null || !pc.match(/[qt]/i))
          {
            px = x;
            py = y;
          }
          else
          {
            px = x-(px-x);
            py = y-(py-y);
          }
          cmdObj = new DrawCmd('quadraticCurveTo', [px, py,
                                                    x + xScale*coords[0], y + yScale*coords[1]]);
          commands.push(cmdObj);
          x += xScale*coords[0];
          y += yScale*coords[1];
          break;
        case 'A':
          while (coords.length>0)
          {
            px = x;
            py = y;
            rx = xScale*coords[0];
            ry = xScale*coords[1];
            rot = -coords[2];          // rotationX: swap for CCW +ve
            larc = coords[3];          // large arc    should be ok
            swp = 1 - coords[4];       // sweep: swap for CCW +ve
            x = xOfs + xScale*coords[5];
            y = yOfs + yScale*coords[6];
            arc_segs = arcToBezier(px, py, rx, ry, rot, larc, swp, x, y);
            for (j=0; j<arc_segs.length; j++)
            {
              cmdObj = new DrawCmd('bezierCurveTo', arc_segs[j]);
              commands.push(cmdObj);
            }
            coords.splice(0, 7);
          }
          break;
        case 'a':
          while (coords.length>0)
          {
            px = x;
            py = y;
            rx = xScale*coords[0];
            ry = xScale*coords[1];
            rot = -coords[2];          // rotationX: swap for CCW +ve
            larc = coords[3];          // large arc    should be ok
            swp = 1 - coords[4];       // sweep: swap for CCW +ve
            x += xScale*coords[5];
            y += yScale*coords[6];
            arc_segs = arcToBezier(px, py, rx, ry, rot, larc, swp, x, y);
            for (j=0; j<arc_segs.length; j++)
            {
              cmdObj = new DrawCmd('bezierCurveTo', arc_segs[j]);
              commands.push(cmdObj);
            }
            coords.splice(0, 7);
          }
          break;
        case 'Z':
          cmdObj = new DrawCmd('closePath', []);
          commands.push(cmdObj);
          break;
        case 'z':
          cmdObj = new DrawCmd('closePath', []);
          commands.push(cmdObj);
          break;
      }
      pc = cmd;     // save the previous command for possible reflected control points
    }
    return commands;
  }

  function Obj2D(cgo, commands, objtype, isotropic, fillColor, strokeColor, lorg)
  {
    this.cgo = cgo;                // save the Cango context
    this.type = "SHAPE";           // enum of type to instruct the render method
    this.drawCmds = commands;      // array of DrawCmd objects or an Img object or Text String
    this.bBoxCmds = [];            // DrawCmd array for the text or img bounding box
    this.dwgOrg = {x:0, y:0};      // drawing origin (0,0) may get translated
    this.iso = false;              // true = maintain aspect ratio
    this.strokeCol = "black";      // renderer will stroke a path in this color
    this.fillCol = "gray";         // only used if type = SHAPE
    this.strokeWidth = 1;          // in case fat outline is wanted for Path or Shape outline
    this.strokeCap = "butt";       // freeze current style in case something fancy is wanted
    this.width = 0;                // only used for type = IMG, TEXT, set to 0 until image loaded
    this.height = 0;               //     "
    this.imgX = 0;                 // TEXT & IMG use these for obj.translate, obj.rotate, obj.scale
    this.imgY = 0;                 //     "
    this.imgXscale = 1;            //     "
    this.imgYscale = 1;            //     "
    this.imgDegs = 0;              //     "
    this.fontSize = 10;            // fontSize in points (TEXT only)
    this.fontWeight = 400;         // fontWeight 100..900 (TEXT only)
    this.lorg = lorg || 1;         // only used for type = IMG and TEXT
    this.dragNdrop = null;

    if (cgo)
    {
      this.type = objtype || "SHAPE";
      this.iso = (isotropic == true);
      // check for iso error
      if ((this.type == "IMG")||(this.type == "TEXT"))
      {
        this.iso = true;
      }

      if ((fillColor !== undefined)&&(fillColor != null))
      {
        this.fillCol = fillColor;
      }
      else
      {
        this.fillCol = cgo.paintCol;
      }

      if ((strokeColor !== undefined)&&(strokeColor != null))
      {
        this.strokeCol = strokeColor;
      }
      else if (this.type == "SHAPE")
      {
        this.strokeCol = this.fillCol; // shapes default to stroke and fill the same
      }
      else
      {
        this.strokeCol = cgo.penCol;   // path and text default to current pen color
      }

      this.strokeWidth = cgo.penWid;
      this.strokeCap = cgo.lineCap;
      if (this.type == "TEXT")
      {
        this.strokeCap = 'round';                // text must be stroked round to look good
      }
    }
  }

  Obj2D.prototype.translate = function(x, y)
  {
    var cmd;
    var i, j;

    if ((this.type == "IMG")||(this.type == "TEXT"))
    {
      // no points to shift just remember the offset to use when rendering
      this.imgX += (x/this.cgo.xscl);     // IMG and TEXT types do a translate during render
      this.imgY += (-y/this.cgo.yscl);
      // now transform the text bounding box (just moveTo and lineTo, no cPts)
      for(j=0; j < this.bBoxCmds.length; j++)   // step through the draw segments
      {
        // check for ep since 'closePath' has no end point)
        if (this.bBoxCmds[j].parms.length)
        {
          this.bBoxCmds[j].parms[0] += x;
          this.bBoxCmds[j].parms[1] += y;
          this.bBoxCmds[j].parmsPx[0] = this.vpLLx+this.xoffset+this.bBoxCmds[j].parms[0]*this.cgo.xscl;
          this.bBoxCmds[j].parmsPx[1] = this.vpLLy+this.yoffset+this.bBoxCmds[j].parms[1]*this.cgo.xscl; // transforms are 'iso'
        }
      }
    }
    else
    {
      for (i=0; i<this.drawCmds.length; i++)
      {
        cmd = this.drawCmds[i];  // for clarity
        for (j=0; j<cmd.parms.length/2; j++)
        {
          cmd.parms[2*j] += x;
          cmd.parms[2*j+1] += y;
          cmd.parmsPx[2*j] = this.vpLLx+this.xoffset+cmd.parms[2*j]*this.cgo.xscl;
          cmd.parmsPx[2*j+1] = this.vpLLy+this.yoffset+cmd.parms[2*j+1]*this.cgo.xscl;   // all transforms are 'iso'
        }
      }
    }
  };

  Obj2D.prototype.rotate = function(degs)
  {
    var cmd,
        A = Math.PI*degs/180.0,   // radians
        sinA = Math.sin(A),
        cosA = Math.cos(A),
        x, y, i, j;

    if ((this.type == "IMG")||(this.type == "TEXT"))
    {
      // no points to shift just remember the value to use when rendering
      this.imgDegs += degs;
    }
    else
    {
      for (i=0; i<this.drawCmds.length; i++)
      {
        cmd = this.drawCmds[i];  // for clarity
        for (j=0; j<cmd.parms.length/2; j++)
        {
          x = cmd.parms[2*j];
          y = cmd.parms[2*j+1];
          cmd.parms[2*j] = x*cosA - y*sinA;
          cmd.parms[2*j+1] = x*sinA + y*cosA;
          cmd.parmsPx[2*j] = this.vpLLx+this.xoffset+cmd.parms[2*j]*this.cgo.xscl;
          cmd.parmsPx[2*j+1] = this.vpLLy+this.yoffset+cmd.parms[2*j+1]*this.cgo.xscl;   // all transforms are 'iso'
        }
      }
    }
  };

  Obj2D.prototype.scale = function(xScl, yScl)
  {
    var cmd,
        xScale = xScl || 1,
        yScale = yScl || xScale,   // default to isotropic scaling
        i, j;

    if ((this.type == "IMG")||(this.type == "TEXT"))
    {
      // no points to shift just remeber values to use when rendering
      this.imgXscale *= xScale;
      this.imgYscale *= yScale;
      this.imgX *= xScale;
      this.imgY *= yScale;
      // now transform the text bounding box (just moveTo and lineTo, no cPts)
      for(j=0; j < this.bBoxCmds.length; j++)   // step through the draw segments
      {
        // check for ep since 'closePath' has no end point)
        if (this.bBoxCmds[j].parms.length)
        {
          this.bBoxCmds[j].parms[0] *= xScale;
          this.bBoxCmds[j].parms[1] *= yScale;
          this.bBoxCmds[j].parmsPx[0] = this.vpLLx+this.xoffset+this.bBoxCmds[j].parms[0]*this.cgo.xscl;
          this.bBoxCmds[j].parmsPx[1] = this.vpLLy+this.yoffset+this.bBoxCmds[j].parms[1]*this.cgo.xscl;   // all transforms are 'iso'
        }
      }
    }
    else
    {
      for (i=0; i<this.drawCmds.length; i++)
      {
        cmd = this.drawCmds[i];  // for clarity
        for (j=0; j<cmd.parms.length/2; j++)
        {
          cmd.parms[2*j] *= xScale;
          cmd.parms[2*j+1] *= yScale;
          cmd.parmsPx[2*j] = this.vpLLx+this.xoffset+cmd.parms[2*j]*this.cgo.xscl;
          cmd.parmsPx[2*j+1] = this.vpLLy+this.yoffset+cmd.parms[2*j+1]*this.cgo.xscl;
        }
      }
      if (this.type == "PATH")                // let line thickness of Paths scale too
      {
        this.strokeWidth *=xScale;
      }
    }
  };

  Obj2D.prototype.appendPath = function(obj, delMove)
  {
    if ((this.type == "IMG")||(this.type == "TEXT")||(obj.type == "IMG")||(obj.type == "TEXT"))
    {
      return;
    }
    if (delMove)  // delete the inital 'moveTo' command
    {
      this.drawCmds = this.drawCmds.concat(obj.drawCmds.slice(1));
    }
    else
    {
      this.drawCmds = this.drawCmds.concat(obj.drawCmds);
    }
  };

  Obj2D.prototype.revWinding = function()
  {
    // reverse the direction of drawing around a path, stops holes in shapes being filled
    var cmds,
        zCmd = null,
        revCmds = [],
        j, len,
        dParms, dCmd;

    function revPairs(ary)
    {
      if (ary.length == 2)
      {
        return ary;
      }
      var revAry = [];
      var i, j;
      for (i=0, j=ary.length/2-1; j>=0; i++, j--)
      {
        revAry[2*i] = ary[2*j];
        revAry[2*i+1] = ary[2*j+1];
      }
      return revAry;
    }

    if ((this.type == "IMG")||(this.type == "TEXT"))
    {
      return;
    }
    if (this.drawCmds[this.drawCmds.length-1].drawFn.toUpperCase() == "Z")
    {
      cmds = this.drawCmds.slice(0, -1);  // leave off Z
      zCmd = this.drawCmds.slice(-1);
    }
    else
    {
      cmds = this.drawCmds.slice(0);  // copy the whole array
    }
    // now step back along the path
    j = cmds.length-1;
    len = cmds[j].parms.length;
    dParms = [cmds[j].parms[len-2], cmds[j].parms[len-1]];
    dCmd = new DrawCmd("moveTo", dParms);
    revCmds.push(dCmd);
    cmds[j].parms = cmds[j].parms.slice(0,-2);  // weve used the last point so slice it off
    while (j>0)
    {
      dParms = revPairs(cmds[j].parms);
      len = cmds[j-1].parms.length;
      dParms.push(cmds[j-1].parms[len-2], cmds[j-1].parms[len-1]); // push last of next cmd
      dCmd = new DrawCmd(cmds[j].drawFn, dParms);
      revCmds.push(dCmd);
      cmds[j-1].parms = cmds[j-1].parms.slice(0,-2);  // weve used the last point so slice it off
      j--;
    }
    // add the 'z' if it was a closed path
    if (zCmd)
    {
      revCmds.push(zCmd);
    }

    this.drawCmds = revCmds;
  };

  Obj2D.prototype.enableDrag = function(drag)
  {
    this.dragNdrop = drag;
    // fill in the Drag2D properties for use by callBacks
    this.dragNdrop.parent = this;
    // include this in objects to be checked on mousedown
    // the Drag2D has the cango context saved as 'this.cgo'
    _draggable[drag.cgo.cId].push(this);
  };

  Obj2D.prototype.disableDrag = function()
  {
    var aidx;

    function getIndex(ary, obj)
    {
      var i, j;
      for (i=0, j=ary.length; i<j; i++)
      {
        if (ary[i] === obj)
        {
          return i;
        }
      }
      return -1;
    }

    if (!this.dragNdrop)
    {
      return;
    }
    // remove this object from array to be checked on mousedown
    // the Drag2D has the cango context saved as 'this.cgo'
    aidx = getIndex(_draggable[this.dragNdrop.cgo.cId], this);
    _draggable[this.dragNdrop.cgo.cId].splice(aidx, 1);
    this.dragNdrop = null;
  };

  Obj2D.prototype.setProperty = function(propertyName, value)
  {
    if ((typeof propertyName !== "string")||(value === undefined)||(value == null))
    {
      return;
    }

    switch (propertyName.toLowerCase())
    {
      case "fillcolor":
        if ((typeof value != "string")&&(typeof value != "object"))  // gradient will be an object
        {
          return;
        }
        this.fillCol = value;
        break;
      case "strokecolor":
        if ((typeof value != "string")&&(typeof value != "object"))  // gradient will be an object
        {
          return;
        }
        this.strokeCol = value;
        break;
      case "strokewidth":
        this.strokeWidth = value;
        break;
      case "linecap":
        if (typeof value != "string")
        {
          return;
        }
        if ((value == "butt")||(value =="round")||(value == "square"))
        {
          this.strokeCap = value;
        }
        break;
      case "fontsize":
        this.fontSize = Math.abs(value);
        break;
      case "fontweight":
        if ((typeof value == "string")||((value>=100)&&(value<=900)))
        {
          this.fontWeight = value;
        }
        break;
      default:
        return;
    }
  };

  Obj2D.prototype.dup = function()
  {
    var newObj = new Obj2D();

    function clone(orgItem)
    {
      var newItem = (isArray(orgItem)) ? [] : {};
      var i;
      for (i in orgItem)
      {
        if ((orgItem[i] && typeof orgItem[i] == "object")&&(i != 'cgo'))
        {
          newItem[i] = clone(orgItem[i]);
        }
        else
        {
          newItem[i] = orgItem[i];
        }
      }
      return newItem;
    }

    newObj.cgo = this.cgo;
    newObj.type = this.type;
    newObj.drawCmds = clone(this.drawCmds);
    newObj.bBoxCmds = clone(this.bBoxCmds);
    newObj.dwgOrg = clone(this.dwgOrg);
    newObj.iso = this.iso;
    newObj.strokeCol = this.strokeCol;
    newObj.fillCol = this.fillCol;
    newObj.strokeWidth = this.strokeWidth;
    newObj.strokeCap = this.strokeCap;
    newObj.width = this.width;
    newObj.height = this.height;
    newObj.imgX = this.imgX;
    newObj.imgY = this.imgY;
    newObj.imgXscale = this.imgXscale;
    newObj.imgYscale = this.imgYscale;
    newObj.imgDegs = this.imgDegs;
    newObj.lorg = this.lorg;

    return newObj;
  };

//===============================================================================

  Cango = function(canvasId)
  {
    this.cId = canvasId;
    this.cnvs = document.getElementById(canvasId);
    if (this.cnvs == null)
    {
      alert("can't find canvas "+canvasId);
      return;
    }
    this.rawWidth = this.cnvs.offsetWidth;
    this.rawHeight = this.cnvs.offsetHeight;
    this.aRatio = this.rawWidth/this.rawHeight;
    this.buffered = true; // draw animation to off-screen buffer then bitblt complete frames
    if (!_resized.hasOwnProperty(this.cId))
    {
      // make canvas native aspect ratio equal style box aspect ratio.
      // Note: rawWidth and rawHeight are floats, assignment to ints will truncate
      this.cnvs.setAttribute('width', this.rawWidth);    // reset canvas pixels width
      this.cnvs.setAttribute('height', this.rawHeight);  // don't use style for this
      // create element for this canvas, this prevents resize for each Cango instance
      _resized[this.cId] = true;
      // create off screen drawing buffer
      if (this.buffered)
      {
        _buf[this.cId] = document.createElement('canvas');      // create buffer in memory
        _buf[this.cId].setAttribute('width', this.rawWidth);    // set number of graphics pixels
        _buf[this.cId].setAttribute('height', this.rawHeight);  // to match screen canvas
      }
      // create an array to hold all the draggable objects for each canvas
      _draggable[this.cId] = [];
      // create an array to hold all the overlay canvases for each background canvas
      _overlays[this.cId] = [];
    }
    if (this.buffered)
    {
      this.bufCtx = _buf[this.cId].getContext('2d');  // animation drawing done off screen
    }
    this.ctx = this.cnvs.getContext('2d');    // draw direct to screen canvas
    this.vpW = this.rawWidth;         // vp width in pixels (default to full canvas size)
    this.vpH = this.rawHeight;        // vp height in pixels
    this.vpLLx = 0;                   // vp lower left from canvas left in pixels
    this.vpLLy = this.rawHeight;      // vp lower left from canvas top
    this.xscl = 1;                    // world x axis scale factor, default to pixels, +ve right
    this.yscl = -1;                   // world y axis scale factor, default to pixels, +ve up
    this.xoffset = 0;                 // world x origin offset from viewport left in pixels
    this.yoffset = 0;                 // world y origin offset from viewport bottom in pixels
    // *** to move to world coord x,y ***
    // 1. from pixel x origin (canvas left) add vpLLx (gets to viewport left)
    // 2. add xoffset to get to pixel location of world X origin
    // 3. add x*xscl pixels to get to world x location.
    // ==> x (in world coords) == vpLLx + xoffset + x*xscl (pixels)
    // ==> y (in world coords) == vpLLy + yoffset + y*yscl (pixels).
    this.ctx.textAlign = "left";     // all offsets are handled in code so dragNdrop works
    this.ctx.textBaseline = "top";

    this.penCol = "rgba(0, 0, 0, 1.0)";         // black
    this.penWid = 1;                  // pixels
    this.lineCap = "butt";
    this.paintCol = "rgba(128, 128, 128, 1.0)"; // gray
    this.fontSize = 10;               // pt
    this.fontWeight = 400;            // 100..900, 400 = normal,700 = bold
    this.fontFamily = "'Lucinda Console', monospace";

    this.animations = [];             // array of animations to be drawn
    this.timer = null;                // need to save the rAF id for cancelling
    this.modes = {PAUSED:1, STOPPED:2, PLAYING:3, STEPPING:4};     // animation modes
    this.animMode = this.modes.STOPPED;
    this.prevAnimMode = this.modes.STOPPED;
    this.startTime = 0;   // animation start time (relative to 1970)
    this.currTime = 0;    // timestamp of frame on screen
    this.stepTime = 50;   // animation step time interval (in msec)

    var savThis = this;

    this.getUnique = function()
    {
      uniqueVal += 1;     // a private 'global'
      return uniqueVal;
    }

    this.cnvs.onmousedown = function(evt)
    {
      var event, csrPos, testObj, len, j;

      function getCursorPos(event)
      {
        // pass in any mouse event, returns the position of the cursor in raw pixel coords
        var rect = savThis.cnvs.getBoundingClientRect();

        return {x: event.clientX - rect.left, y: event.clientY - rect.top};
      }

      function hitTest(pathObj)
      {
        var i;
        // create the path (don't stroke it - no-one will see) to test for hit
        savThis.ctx.beginPath();
        if ((pathObj.type == 'TEXT')||(pathObj.type == 'IMG'))   // use bounding box not drawCmds
        {
          for (i=0; i<pathObj.bBoxCmds.length; i++)
          {
            savThis.ctx[pathObj.bBoxCmds[i].drawFn].apply(savThis.ctx, pathObj.bBoxCmds[i].parmsPx);
          }
        }
        else
        {
          for (i=0; i<pathObj.drawCmds.length; i++)
          {
            savThis.ctx[pathObj.drawCmds[i].drawFn].apply(savThis.ctx, pathObj.drawCmds[i].parmsPx);
          }
        }
/*
    // for diagnostics on hit region, uncomment
    savThis.ctx.strokeStyle = 'red';
    savThis.ctx.lineWidth = 4;
    savThis.ctx.stroke();
*/
        return savThis.ctx.isPointInPath(csrPos.x, csrPos.y);
      }

      event = evt || window.event;
      csrPos = getCursorPos(event);  // savThis is any Cango ctx on the canvas
      len = _draggable[savThis.cId].length;
      // run through all the registered objects and test if cursor pos is in their path
      for (j = len-1; j >= 0; j--)       // search last drawn first, it will be on top
      {
        testObj = _draggable[savThis.cId][j];    // for readability
        if (hitTest(testObj))
        {
          // call the grab handler for this object (check it is still enabled)
          if (testObj.dragNdrop)
          {
            testObj.dragNdrop.grab(event);
            break;
          }
        }
      }
    };
  };

  Cango.prototype.toViewportCoords = function(x, y)
  {
    // transform x,y in world coords to viewport coords (x axis 0 to 100, y axis same scale factor)
    var xPx = this.vpLLx+this.xoffset+x*this.xscl;
    var yPx = this.vpLLy+this.yoffset+y*this.yscl;

    return {x: 100*xPx/this.rawWidth, y: 100*(this.rawHeight-yPx)/this.rawWidth};
  };

  Cango.prototype.toPixelCoords = function(x, y)
  {
    // transform x,y in world coords to canvas pixel coords (top left is 0,0 y axis +ve down)
    var xPx = this.vpLLx+this.xoffset+x*this.xscl;
    var yPx = this.vpLLy+this.yoffset+y*this.yscl;

    return {x: xPx, y: yPx};
  };

  Cango.prototype.toWorldCoords = function(xPx, yPx)
  {
    // transform xPx,yPx in raw canvas pixels to world coords (lower left is 0,0 +ve up)
    var xW = (xPx - this.vpLLx - this.xoffset)/this.xscl;
    var yW = (yPx - this.vpLLy - this.yoffset)/this.yscl;

    return {x: xW, y: yW};
  };

  Cango.prototype.getCursorPosWC = function(evt)
  {
    // pass in any mouse event, returns the position of the cursor in raw pixel coords
    var e = evt||window.event;
    var rect = this.cnvs.getBoundingClientRect();

    var xW = (e.clientX - rect.left - this.vpLLx - this.xoffset)/this.xscl;
    var yW = (e.clientY - rect.top - this.vpLLy - this.yoffset)/this.yscl;

    return {x: xW, y: yW};
  };

  Cango.prototype.clearCanvas = function(fillColor)
  {
    if (fillColor != undefined)
    {
      this.ctx.fillStyle = fillColor;
      this.ctx.fillRect(0, 0, this.rawWidth, this.rawHeight);
    }
    else
    {
      this.ctx.clearRect(0, 0, this.rawWidth, this.rawHeight);
    }
    // all drawing erased, but graphics contexts remain intact
    // clear the draggable array, draggables put back when rendered
    if (this.cId != 'sprite')
    {
      _draggable[this.cId].length = 0;
    }
  };

  Cango.prototype.setViewport = function(lowerLeftX, lowerLeftY, w, h)
  {
    if (h && w && (h > 0) && (w > 0))
    {
      this.vpW = w*this.rawWidth/100;
      this.vpH = h*this.rawWidth/100;
      this.vpLLx = lowerLeftX*this.rawWidth/100;
      this.vpLLy = this.rawHeight-lowerLeftY*this.rawWidth/100;
    }
    else
    {
      this.vpW = this.rawWidth;
      this.vpH = this.rawHeight;
      this.vpLLx = 0;
      this.vpLLy = this.rawHeight;
    }
    this.setWorldCoords();     // if new viewport, world coords are garbage, so reset to defaults
  };

  Cango.prototype.fillViewport = function(fillColor)
  {
    var newCol = this.paintCol;
    // set background color and fill the viewport to that color or gradient
    if ((fillColor != undefined)&&(fillColor != null))
    {
      newCol = fillColor;
    }
    this.ctx.save();
    this.ctx.fillStyle = newCol;
    this.ctx.fillRect(this.vpLLx, this.vpLLy-this.vpH, this.vpW, this.vpH); // fill: top, left, wid, hgt
    this.ctx.restore();
  };

  Cango.prototype.setWorldCoords = function(lowerLeftX, lowerLeftY, spanX, spanY)
  {
    var vpLLxWC = lowerLeftX || 0,     // viewport lower left x in world coords
        vpLLyWC = lowerLeftY || 0;     // viewport lower left y in world coords

    if (spanX && (spanX > 0))
    {
      this.xscl = this.vpW/spanX;
    }
    else
    {
      this.xscl = 1;                    // use pixel units
    }
    if (spanY && (spanY > 0))
    {
      this.yscl = -this.vpH/spanY;
    }
    else
    {
      this.yscl = -this.xscl;          // square pixels
    }
    this.xoffset = -vpLLxWC*this.xscl;
    this.yoffset = -vpLLyWC*this.yscl;
  };

  Cango.prototype.setPropertyDefault = function(propertyName, value)
  {
    if ((typeof propertyName != "string")||(value == undefined)||(value == null))
    {
      return;
    }

    switch (propertyName.toLowerCase())
    {
      case "fillcolor":
        if ((typeof value == "string")||(typeof value == "object"))  // gradient will be an object
        {
          this.paintCol = value;
        }
        break;
      case "strokecolor":
        if ((typeof value == "string")||(typeof value == "object"))  // gradient will be an object
        {
          this.penCol = value;
        }
        break;
      case "strokewidth":
        this.penWid = value;
        break;
      case "linecap":
        if ((typeof value == "string")&&((value == "butt")||(value =="round")||(value == "square")))
        {
          this.lineCap = value;
        }
        break;
      case "fontfamily":
        if (typeof value == "string")
        {
          this.fontFamily = value;
        }
        break;
      case "fontsize":
        this.fontSize = value;
        break;
      case "fontweight":
        if ((typeof value == "string")||((value >= 100)&&(value <= 900)))
        {
          this.fontWeight = value;
        }
        break;
      case "steptime":
        if ((value >= 15)&&(value <= 500))
        {
          this.stepTime = value;
        }
        break;
      default:
        return;
    }
  };

  Cango.prototype.linearGradientFill = function(x1, y1, x2, y2, x, y, scl, isotropic)
  {
    var xOfs = x || 0,
        yOfs = y || 0,
        xScl = scl || 1,
        yScl = scl || 1,
        p1x, p1y,
        p2x, p2y;

    if ((isotropic != undefined)&&(isotropic == 'iso'))
    {
      yScl *= -this.xscl/this.yscl;
    }
    // pixel version of world coordinate parms
    p1x = xOfs+x1*xScl;
    p1y = yOfs+y1*yScl;
    p2x = xOfs+x2*xScl;
    p2y = yOfs+y2*yScl;

    return this.ctx.createLinearGradient(this.xscl*p1x, this.yscl*p1y, this.xscl*p2x, this.yscl*p2y);
  };

  Cango.prototype.radialGradientFill = function(x1, y1, r1, x2, y2, r2, x, y, scl, isotropic)
  {
    var xOfs = x || 0,
        yOfs = y || 0,
        xScl = scl || 1,
        yScl = scl || 1,
        p1x, p1y, p1r,
        p2x, p2y, p2r;

    if ((isotropic != undefined)&&(isotropic == 'iso'))
    {
      yScl *= -this.xscl/this.yscl;
    }
    // world coordinate parms (equivalent to compile methods)
    p1x = xOfs+x1*xScl;
    p1y = yOfs+y1*yScl;
    p1r = r1*this.xscl*xScl;
    p2x = xOfs+x2*xScl;
    p2y = yOfs+y2*yScl;
    p2r = r2*this.xscl*xScl;

    return this.ctx.createRadialGradient(this.xscl*p1x, this.yscl*p1y, p1r, this.xscl*p2x, this.yscl*p2y, p2r);
  };

  Cango.prototype.render = function(pathObj, x, y, scl, degs)
  {
    var savThis = this,
        drawObjAry = [],
        i;

    function loadCallback(obj, x, y, scl, degs)
    {
      return  function(){
                          savThis._paintImg(obj, x, y, scl, degs);
                        };
    }

    // task:function, ary: array with elements
  	function iterate(obj)
  	{
  	  var x, childNode;
      if (isArray(obj))          // array of Obj2D or mixed Obj2D and more arrays
      {
    		for (x=0; x<obj.length; x++)
    		{
    			childNode = obj[x];
      	  if (childNode.drawCmds !== undefined)    // test for Obj2Ds to draw
          {
            drawObjAry.push(childNode);       // just push into the array to be drawn
          }
          else if (isArray(childNode))
          {
    				iterate(childNode);
          }
    		}
      }
      else
      {
        drawObjAry.push(obj);
      }
  	}

    // handle Obj2D or nested arrays of Obj2Ds
    iterate(pathObj);

    for (i=0; i<drawObjAry.length; i++)
    {
      if (drawObjAry[i].type == "IMG")
      {
        if (drawObjAry[i].width>0)  // image loaded and width set?
        {
          this._paintImg(drawObjAry[i], x, y, scl, degs);
        }
        else
        {
          addLoadEvent(drawObjAry[i].drawCmds, loadCallback(drawObjAry[i], x, y, scl, degs));
        }
      }
      else if (drawObjAry[i].type == "TEXT")
      {
        this._paintText(drawObjAry[i], x, y, scl, degs);
      }
      else    // PATH, SHAPE
      {
        this._paintPath(drawObjAry[i], x, y, scl, degs);
      }
    }
  };

  Cango.prototype._paintImg = function(pathObj, x, y, scl, degrees)
  {
    // should only be called after image has been loaded into drawCmds
    var A, sinA, cosA,
        img = pathObj.drawCmds,            // this is the place the image is stored in object
        xPos = x || 0,
        yPos = y || 0,
        xScale = scl || 1,
        scale = xScale*pathObj.imgXscale,  // imgXscale is from Obj2D.scale (permanent)
        degs = degrees || 0,
        j, tp;

    function rotXY(x,y)
    {
      return [x*cosA - y*sinA, x*sinA + y*cosA];
    }

    degs += pathObj.imgDegs;
    this.ctx.save();   // save the clean ctx
    // move the whole coordinate system to the xPos,yPos
    this.ctx.translate(this.vpLLx+this.xoffset+xPos*this.xscl, this.vpLLy+this.yoffset+yPos*this.yscl);
    if (degs)
    {
      A = degs*Math.PI/180.0;   // radians
      sinA = Math.sin(A);
      cosA = Math.cos(A);
      this.ctx.rotate(-A);   // rotate
    }
    // now insert the image origin with lorg offsets and scaled in width
    this.ctx.drawImage(img, this.xscl*scale*pathObj.imgX, this.xscl*scale*pathObj.imgY,
                            this.xscl*scale*pathObj.width, this.xscl*scale*pathObj.height);
    this.ctx.restore();    // undo the transforms

    // now transform the text bounding box (skip final closePath, no cPts)
    for(j=0; j < pathObj.bBoxCmds.length-1; j++)   // step through the draw segments
    {
      if (degs)
      {
        tp = rotXY(pathObj.bBoxCmds[j].parms[0], pathObj.bBoxCmds[j].parms[1]);
      }
      else
      {
        tp = pathObj.bBoxCmds[j].parms;
      }
      pathObj.bBoxCmds[j].parmsPx[0] = this.vpLLx+this.xoffset+tp[0]*scale*this.xscl+xPos*this.xscl;
      pathObj.bBoxCmds[j].parmsPx[1] = this.vpLLy+this.yoffset-tp[1]*scale*this.xscl+yPos*this.yscl;
    }
    // save world coords of the drawing origin for drag n drop
    pathObj.dwgOrg.x = xPos;
    pathObj.dwgOrg.y = yPos;

    if (pathObj.dragNdrop != null)
    {
      // now push it into Cango.draggable array, its checked by canvas mousedown event handler
      if (!_draggable[this.cId].contains(pathObj))
      {
        _draggable[this.cId].push(pathObj);
      }
    }
  };

  Cango.prototype._paintPath = function(pathObj, x, y, scl, degrees)
  {
    // used for type: PATH, SHAPE
    var A, sinA, cosA,
        xPos = x || 0,
        yPos = y || 0,
        scale = scl || 1,
        degs = degrees || 0,
        fill = null,
        i, j, x1, y1,
        xTmp, yTmp,
        drawCmdsLen,
        parmsLen,
        xPx = this.vpLLx+this.xoffset+xPos*this.xscl,
        yPx = this.vpLLy+this.yoffset+yPos*this.yscl,
        xsl = this.xscl,
        ysl = pathObj.iso? -this.xscl : this.yscl;
    // don't use canvas matrix rotation or the gradient patterns will be rotated
    if (degs)
    {
      A = degs*Math.PI/180.0;   // radians
      sinA = Math.sin(A);
      cosA = Math.cos(A);
    }
    this.ctx.save();   // save current context
    // use canvas translation and scaling so gradient fill follow the object drawing origin and size
    this.ctx.translate(xPx, yPx);
    this.ctx.scale(scale, scale);
    // build the path by converting the world coord parms of each DrawCmd to parmPx
    // these can then be uses in drag and drop pointInpath testing
    this.ctx.beginPath();
    drawCmdsLen = pathObj.drawCmds.length;
    for (i=0; i < drawCmdsLen; i++)
    {
      parmsLen = pathObj.drawCmds[i].parms.length;
      for (j=0; j<parmsLen; j+=2)  // convert x,y coord pairs to pixel coords
      {
        xTmp = pathObj.drawCmds[i].parms[j];
        yTmp = pathObj.drawCmds[i].parms[j+1];
        if (degs)
        {
          x1 = xTmp*cosA - yTmp*sinA;
          y1 = xTmp*sinA + yTmp*cosA;
          xTmp = x1;
          yTmp = y1;
        }
        pathObj.drawCmds[i].parmsPx[j] = xTmp*xsl;
        pathObj.drawCmds[i].parmsPx[j+1] = yTmp*ysl;
      }
      this.ctx[pathObj.drawCmds[i].drawFn].apply(this.ctx, pathObj.drawCmds[i].parmsPx); // draw the path
    }
    // if a SHAPE, fill with color
    if (pathObj.type == "SHAPE")
    {
      // pathObj.fillCol may be a function that generates dynamic color (so call it)
      if (pathObj.fillCol instanceof Function)
      {
        fill = pathObj.fillCol(arguments);
      }
      else
      {
        fill = pathObj.fillCol;
      }
      this.ctx.fillStyle = fill;
      this.ctx.fill();
    }
    // try to avoid calling color function twice (if just filled 'fill' will be a color)
    if ((pathObj.fillCol == pathObj.strokeCol)&&(fill != null))
    {
      this.ctx.strokeStyle = fill;
    }
    else
    {
      // pathObj.fillCol may be a function that generates dynamic color (so call it)
      if (pathObj.strokeCol instanceof Function)
      {
        this.ctx.strokeStyle = pathObj.strokeCol(arguments);
      }
      else
      {
        this.ctx.strokeStyle = pathObj.strokeCol;
      }
    }
    this.ctx.lineWidth = Math.abs(pathObj.strokeWidth); // strokeWidth set at compile time
    this.ctx.lineCap = pathObj.strokeCap;
    this.ctx.stroke();
     // undo the translation and scaling
    this.ctx.restore();

    // correct the pixel outline for any shift of drawing origin
    for (i=0; i < drawCmdsLen; i++)
    {
      parmsLen = pathObj.drawCmds[i].parms.length;
      for (j=0; j < parmsLen; j+=2)      // convert x,y coord pairs to world coords
      {
        pathObj.drawCmds[i].parmsPx[j] = pathObj.drawCmds[i].parmsPx[j]*scale + xPx;
        pathObj.drawCmds[i].parmsPx[j+1] = pathObj.drawCmds[i].parmsPx[j+1]*scale + yPx;
      }
    }
    // save world coords of the drawing origin for drag n drop
    pathObj.dwgOrg.x = xPos;
    pathObj.dwgOrg.y = yPos;
    if (pathObj.dragNdrop != null)
    {
      // now push it into Cango.draggable array, its checked by canvas mousedown event handler
      if (!_draggable[this.cId].contains(pathObj))
      {
        _draggable[this.cId].push(pathObj);
      }
    }
  };

  Cango.prototype._paintText = function(pathObj, x, y, scl, degrees)
  {
    var A, sinA, cosA,
        xPos = x || 0,
        yPos = y || 0,
        scale = scl || 1,
        degs = degrees || 0,
        j, tp;

    function rotXY(x,y)
    {
      return [x*cosA - y*sinA, x*sinA + y*cosA];
    }

    // translate, rotate, scale must be handled at render time
    this.ctx.save();   // save current context
    this.ctx.translate(this.vpLLx+this.xoffset+xPos*this.xscl, this.vpLLy+this.yoffset+yPos*this.yscl);
    this.ctx.scale(scale, scale);
    this.ctx.save();   // save current rotation if any
    degs += pathObj.imgDegs;
    if (degs)
    {
      A = degs*Math.PI/180.0;   // radians
      sinA = Math.sin(A);
      cosA = Math.cos(A);
      this.ctx.rotate(-A);   // rotate
    }
    this.ctx.font = pathObj.fontWeight.toString()+" "+pathObj.fontSize+"px "+this.fontFamily;
    // set the fillStyle to strokeColor for text
    // pathObj.fillCol may be a function that generates dynamic color (so call it)
    if (pathObj.strokeCol instanceof Function)
    {
      this.ctx.fillStyle = pathObj.strokeCol(arguments);
    }
    else
    {
      this.ctx.fillStyle = pathObj.strokeCol;
    }
    // now actually fill the text
    this.ctx.fillText(pathObj.drawCmds, pathObj.imgX*this.xscl, pathObj.imgY*this.yscl);
    this.ctx.restore();   // undo the rotation
     // undo the translation and scaling
    this.ctx.restore();

    // now transform the text bounding box (skip final closePath, no cPts)
    for(j=0; j < pathObj.bBoxCmds.length-1; j++)   // step through the draw segments
    {
      if (degs)
      {
        tp = rotXY(pathObj.bBoxCmds[j].parms[0], pathObj.bBoxCmds[j].parms[1]);
      }
      else
      {
        tp = pathObj.bBoxCmds[j].parms;
      }
      // parms for text are stored in pixels so don't scale bounding box by xscl
      pathObj.bBoxCmds[j].parmsPx[0] = this.vpLLx+this.xoffset+tp[0]*scale+xPos*this.xscl;
      pathObj.bBoxCmds[j].parmsPx[1] = this.vpLLy+this.yoffset-tp[1]*scale+yPos*this.yscl;
    }
    // save world coords of the drawing origin (often useful in drag n drop)
    pathObj.dwgOrg.x = xPos;
    pathObj.dwgOrg.y = yPos;
    if (pathObj.dragNdrop != null)
    {
      // now push it into Cango.draggable array, its checked by canvas mousedown event handler
      if (!_draggable[this.cId].contains(pathObj))
      {
        _draggable[this.cId].push(pathObj);
      }
    }
  };

  Cango.prototype.compilePath = function(path, color, scl, lineWidth, isotropic)
  {
    var iso = (isotropic === 'iso'),
        scale = scl || 1,
        cvsCmds,
        pathObj;
    // now send these off to the svg segs to canvas DrawCmd processor
    cvsCmds = cgo2DtoDrawCmd(path, scale);
    pathObj = new Obj2D(this, cvsCmds, "PATH", iso, null, color, null);
    pathObj.strokeWidth = lineWidth || this.penWid;

    return pathObj;
  };

  Cango.prototype.compileShape = function(path, fillColor, strokeColor, scl, isotropic)
  {
    var iso = (isotropic === 'iso'),
        scale = scl || 1,
        cvsCmds,
        pathObj;

    // now send these off to the svg segs-to-canvas DrawCmd processor
    cvsCmds = cgo2DtoDrawCmd(path, scale);
    pathObj = new Obj2D(this, cvsCmds, "SHAPE", iso, fillColor, strokeColor, null);

    return pathObj;
  };

  Cango.prototype.compileText = function(str, color, fontSz, fontWt, lorigin)
  {
    var size = fontSz || this.fontSize,     // fontSize in pts
        weight,
        lorg = lorigin || 1,
        pathObj,
        wid, hgt,   // Note: char cell is ~1.5* fontSize pixels high
        wid2, hgt2,
        lorgWC,
        dx, dy;

    if (typeof str != 'string')
    {
      return;
    }
    weight = this.fontWeight;   // default = 400
    if (typeof fontWt == 'string')
    {
      weight = fontWt;           // 'bold' etc
    }
    else if (isNumber(fontWt) && (fontWt > 99) && (fontWt < 901))
    {
      weight = fontWt;           // 100 .. 900
    }
    size *= 1.3;    // convert to pixels

    this.ctx.save();
    // set the drawing context to measure the size
    this.ctx.font = size+"px "+this.fontFamily;
    wid = this.ctx.measureText(str).width;   // need these for dragNdrop
    this.ctx.restore();

    hgt = size;   // Note: char cell is ~1.5* fontSize pixels high
    wid2 = wid/2;
    hgt2 = hgt/2;
    lorgWC = [0, [0, 0],    [wid2, 0],   [wid, 0],
                 [0, hgt2], [wid2, hgt2], [wid, hgt2],
                 [0, hgt],  [wid2, hgt],  [wid, hgt]];
    dx = -lorgWC[lorg][0];
    dy = -lorgWC[lorg][1];

    pathObj = new Obj2D(this, str, "TEXT", true, null, color, lorg);
    pathObj.imgX = dx/this.xscl;      // world coords offset to drawing origin
    pathObj.imgY = dy/this.yscl;
    pathObj.width = wid;
    pathObj.height = hgt;
    pathObj.fontSize = size;
    pathObj.fontWeight = weight;
    // construct the DrawCmds for the text bounding box
    pathObj.bBoxCmds[0] = new DrawCmd("moveTo", [dx, -dy]);           // upper left
    pathObj.bBoxCmds[1] = new DrawCmd("lineTo", [dx, -dy-hgt]);       // lower left
    pathObj.bBoxCmds[2] = new DrawCmd("lineTo", [dx+wid, -dy-hgt]);   // lower right
    pathObj.bBoxCmds[3] = new DrawCmd("lineTo", [dx+wid, -dy]);       // upper right
    pathObj.bBoxCmds[4] = new DrawCmd("closePath", []);

    return pathObj;
  };

  Cango.prototype.compileImg = function(imgURL, w, lorigin)
  {
    var lorg = lorigin || 1,
        img = new Image(),
        imgObj = new Obj2D(this, img, "IMG", true, null, null, lorg);   // iso=true, colors=null

    function configImgObj()  // call when image loaded
    {
      var wid = w || imgObj.drawCmds.width,    // its loaded now so width is valid
          hgt = wid*imgObj.drawCmds.height/imgObj.drawCmds.width,  // keep aspect ratio
          wid2 = wid/2,
          hgt2 = hgt/2,
          dx, dy,
          lorgWC = [0, [0, 0],    [wid2, 0],   [wid, 0],
                       [0, hgt2], [wid2, hgt2], [wid, hgt2],
                       [0, hgt],  [wid2, hgt],  [wid, hgt]];
      dx = -lorgWC[lorg][0];
      dy = -lorgWC[lorg][1];
      imgObj.imgX = dx;     // world coords offset to drawing origin
      imgObj.imgY = dy;
      imgObj.width = wid;
      imgObj.height = hgt;
      // construct the DrawCmds for the text bounding box
      imgObj.bBoxCmds[0] = new DrawCmd("moveTo", [dx, -dy]);           // ul
      imgObj.bBoxCmds[1] = new DrawCmd("lineTo", [dx, -dy-hgt]);       // ll
      imgObj.bBoxCmds[2] = new DrawCmd("lineTo", [dx+wid, -dy-hgt]);   // lr
      imgObj.bBoxCmds[3] = new DrawCmd("lineTo", [dx+wid, -dy]);       // ur
      imgObj.bBoxCmds[4] = new DrawCmd("closePath", []);
    }

    if (typeof imgURL != 'string')
    {
      return;
    }
    imgObj.drawCmds.src = "";
    addLoadEvent(imgObj.drawCmds, configImgObj);
    // start to load the image
    imgObj.drawCmds.src = imgURL;

    return imgObj;
  };

  Cango.prototype.drawPath = function(path, x, y, color, scl, isotropic)
  {
    var pathObj = this.compilePath(path, color, scl, null, isotropic);
    this.render(pathObj, x, y);
    return pathObj;
  };

  Cango.prototype.drawShape = function(path, x, y, fillColor, scl, isotropic)
  {
    // outline the same as fill color
    var pathObj = this.compileShape(path, fillColor, fillColor, scl, isotropic);
    this.render(pathObj, x, y);
    return pathObj;
  };

  Cango.prototype.drawText = function(str, x, y, color, ptSize, lorg)
  {
    var pathObj = this.compileText(str, color, ptSize, null, lorg);
    this.render(pathObj, x, y);
    return pathObj;
  };

  Cango.prototype.drawImg = function(imgURL, x, y, w, lorigin)  // just load img then calls _paintImg
  {
    var savThis = this,
        xOfs = x || 0,
        yOfs = y || 0,
        lorg = lorigin || 1,
        img = new Image(),
        imgObj = new Obj2D(this, img, "IMG", true, null, null, lorg);

    function configImgObj()  // call when image loaded
    {
      // only drawImg or compileImg can set width, render must wait till img loaded
      var wid = w || imgObj.drawCmds.width,    // its loaded, now width should be valid
          hgt = wid*imgObj.drawCmds.height/imgObj.drawCmds.width,
          wid2 = wid/2,
          hgt2 = hgt/2,
          dx, dy,
          lorgWC = [0, [0, 0],    [wid2, 0],   [wid, 0],
                       [0, hgt2], [wid2, hgt2], [wid, hgt2],
                       [0, hgt],  [wid2, hgt],  [wid, hgt]];
      dx = -lorgWC[lorg][0];
      dy = -lorgWC[lorg][1];
      imgObj.imgX = dx;     // world coords offset to drawing origin
      imgObj.imgY = dy;
      imgObj.width = wid;   // world coords (save in object properties)
      imgObj.height = hgt;
      // construct the DrawCmds for the text bounding box
      imgObj.bBoxCmds[0] = new DrawCmd("moveTo", [dx, -dy]);           // ul
      imgObj.bBoxCmds[1] = new DrawCmd("lineTo", [dx, -dy-hgt]);       // ll
      imgObj.bBoxCmds[2] = new DrawCmd("lineTo", [dx+wid, -dy-hgt]);   // lr
      imgObj.bBoxCmds[3] = new DrawCmd("lineTo", [dx+wid, -dy]);       // ur
      imgObj.bBoxCmds[4] = new DrawCmd("closePath", []);
      // now render the image, scale is set by width value (in world coords), 0 degs rotation
      // must use _paintImg not render to get the correct rotation values
      savThis._paintImg(imgObj, xOfs, yOfs, 1, 1, 0);  // scl = 1, degs = 0
    }

    imgObj.drawCmds.src = "";
    // don't render image until dimensions are know (for scaling etc)
    addLoadEvent(imgObj.drawCmds, configImgObj);
    // start to load the image
    imgObj.drawCmds.src = imgURL;

    return imgObj;
  };

  Cango.prototype.clipPath = function(pathObj)
  {
    var pxlCoords = [],
        i, j;

    if ((this.type == "IMG")||(this.type == "TEXT"))
    {
      return;
    }
    this.ctx.save();             // not required when resetClip is supported
    this.ctx.beginPath();
    for (i=0; i<pathObj.drawCmds.length; i++)
    {
      for (j=0; j<pathObj.drawCmds[i].parms.length; j+=2)  // convert x,y coord pairs to pixel coords
      {
        pxlCoords[j] = this.vpLLx+this.xoffset+this.xscl*pathObj.drawCmds[i].parms[j];
        if (pathObj.iso)
        {
          pxlCoords[j+1] = this.vpLLy+this.yoffset-this.xscl*pathObj.drawCmds[i].parms[j+1];
        }
        else
        {
          pxlCoords[j+1] = this.vpLLy+this.yoffset+this.yscl*pathObj.drawCmds[i].parms[j+1];
        }
      }
      this.ctx[pathObj.drawCmds[i].drawFn].apply(this.ctx, pxlCoords); // actually draw the path
    }
    this.ctx.clip();
  };

  Cango.prototype.resetClip = function()
  {
    // this.ctx.resetClip();       // not supported in bowsers yet (Feb13)
    this.ctx.restore();            // use this until resetClip is supported
  };

  Cango.prototype.createLayer = function()
  {
    var ovlHTML, overlay, newCvs,
        w = this.rawWidth,
        h = this.rawHeight,
        unique, ovlId,
        topCvs = this.cnvs,
        topId;

    unique = this.getUnique();
    ovlId = this.cId+"_ovl_"+unique;
    ovlHTML = "<canvas id='"+ovlId+"' style='position:absolute' width='"+w+"' height='"+h+"'></canvas>";
    if (_overlays[this.cId].length)
    {
      topId = _overlays[this.cId][_overlays[this.cId].length-1];
      topCvs = document.getElementById(topId);
    }
    topCvs.insertAdjacentHTML('afterend', ovlHTML);
    // make it the same size as the background canvas
    newCvs = document.getElementById(ovlId);
    newCvs.style.backgroundColor = "transparent";
    newCvs.style.left = this.cnvs.offsetLeft+'px';
    newCvs.style.top = this.cnvs.offsetTop+'px';
    newCvs.style.width = this.cnvs.offsetWidth+'px';
    newCvs.style.height = this.cnvs.offsetHeight+'px';
    // save the ID in an array to facilitate removal
    _overlays[this.cId].push(ovlId);

    return ovlId;    // return the new canvas id for call to new Cango(id)
  };

  Cango.prototype.deleteLayer = function(ovlyId)
  {
    var ovlNode, idx;

    idx = _overlays[this.cId].indexOf(ovlyId);
    if (idx !== -1)
    {
      ovlNode = document.getElementById(ovlyId);
      if (ovlNode)       // there is a id stored but no actual canvas
      {
        ovlNode.parentNode.removeChild(ovlNode);
      }
      // now delete overlays array element
      _overlays[this.cId].splice(idx,1);       // delete the id
    }
  };

  // copy the basic graphics context values (for an overlay)
  Cango.prototype.dupCtx = function(src_graphCtx)
  {
    // copy all the graphics context parameters into the overlay ctx.
    this.vpLLx = src_graphCtx.vpLLx;      // vp lower left from canvas left in pixels
    this.vpLLy = src_graphCtx.vpLLy;      // vp lower left from canvas top
    this.xscl = src_graphCtx.xscl;        // world x axis scale factor
    this.yscl = src_graphCtx.yscl;        // world y axis scale factor
    this.xoffset = src_graphCtx.xoffset;  // world x origin offset from viewport left in pixels
    this.yoffset = src_graphCtx.yoffset;  // world y origin offset from viewport bottom in pixels
    this.penCol = src_graphCtx.penCol.slice(0);   // copy value not reference
    this.penWid = src_graphCtx.penWid;    // pixels
    this.lineCap = src_graphCtx.lineCap.slice(0);
    this.paintCol = src_graphCtx.paintCol.slice(0);
    this.fontFamily = src_graphCtx.fontFamily.slice(0);
    this.fontSize = src_graphCtx.fontSize;
    this.fontWeight = src_graphCtx.fontWeight;
  };

  function interpolate(vals, t, dur)     // vals is an array of key frame values
  {
    var numSlabs, slabDur, slab, frac;

    if (isArray(vals))  // array
    {
      if (t == 0)
      {
        return vals[0];
      }
      if (t >= dur)
      {
        return vals[vals.length-1];  // freeze at end value
      }
      numSlabs = vals.length-1;
      slabDur = dur/numSlabs;
      slab = Math.floor(t/slabDur);
      frac = (t - slab*slabDur)/slabDur;
      return vals[slab] + frac*(vals[slab+1] - vals[slab]);
    }
    //  else single value (not animated)
    return vals;
  }

  function DeclAnimation(obj, xVals, yVals, sclVals, rotVals, delayTime, duration, repeat)
  {
    var savThis = this,
        xValues = xVals || 0,
        yValues = yVals || 0,
        sclValues = sclVals || 1,
        rotValues = rotVals || 0;

    this.getState = function(time, state)   // reference to a state passed to avoid creating new objects
    {
      var localTime, t;

      if (time == 0)   // re-starting after a stop
      {
        savThis.startTime = 0;
      }
      localTime = time - savThis.startTime;       // handles local looping
      if ((localTime > savThis.dur+savThis.delay) && (savThis.dur > 0) && savThis.loop)  // dur = 0 go forever
      {
        savThis.startTime = time;   // we will re-start
        localTime = 0;      // this will force re-start at frame 0
      }
      t = 0;
      if (localTime > savThis.delay)  // repeat initial frame if there is a delay to start
      {
        t = localTime - savThis.delay;
      }
      if (isArray(xValues))
      {
        state.x = interpolate(xValues, t, savThis.dur);
      }
      else
      {
        state.x = xValues;      // single value or null
      }
      if (isArray(yValues))
      {
        state.y = interpolate(yValues, t, savThis.dur);
      }
      else
      {
        state.y = yValues;      // single value or null
      }
      if (isArray(sclValues))
      {
        state.scl = interpolate(sclValues, t, savThis.dur);
      }
      else
      {
        state.scl = sclValues;  // single value or null
      }
      if (isArray(rotValues))
      {
        state.rot = interpolate(rotValues, t, savThis.dur);
      }
      else
      {
        state.rot = rotValues;  // single value or null
      }
    };

    this.delay = delayTime || 0;
    this.dur = duration || 0;     // 0 = go forever
    this.loop = repeat || false;
    this.startTime = 0;
    this.obj = obj;
  }

  Cango.prototype.animate = function(obj, xValues, yValues, sclValues, rotValues, delayTime, duration, loopStr)
  {
    var delay = delayTime || 0,
        dur = duration || 0,     // 0 = go forever
        loop = false,
        newAnim;

    if ((loopStr != undefined)&&(loopStr == 'loop'))
    {
      loop = true;
    }
    newAnim = new DeclAnimation(obj, xValues, yValues, sclValues, rotValues, delay, dur, loop);
    // give it a unique ID
    newAnim.id = this.cId+"_"+this.getUnique();
    // push this into the Cango animations array
    this.animations.push(newAnim);

    return newAnim.id;   // so the animation just created can be deleted if required
  };

  Cango.prototype.stopAnimation = function()
  {
    window.cancelAnimationFrame(this.timer);
    this.prevAnimMode = this.animMode;
    this.animMode = this.modes.STOPPED;
    // reset the currTime so play and step know to start again
    this.currTime = 0;
  };

  Cango.prototype.pauseAnimation = function()
  {
    window.cancelAnimationFrame(this.timer);
    this.prevAnimMode = this.animMode;
    this.animMode = this.modes.PAUSED;
  };

  Cango.prototype.stepAnimation = function()
  {
    var savThis = this,
        nextState = {x:0, y:0, scl:1, rot:0};

    // this is the actual animator that draws the frame
    function drawIt()
    {
      var time = Date.now(),    // use this as a time stamp, browser don't all pass the same time code
          localTime,
          A, temp, i;

      if (savThis.prevAnimMode == savThis.modes.STOPPED)
      {
        savThis.startTime = time;                // forces localTime = 0 to start from beginning
      }
      localTime =  time - savThis.startTime;
      // do all the drawing for this frame
      savThis.clearCanvas();
      if (savThis.buffered)
      {
        // drawing will be off screen, clear buffer too
        savThis.bufCtx.clearRect(0, 0, savThis.rawWidth, savThis.rawHeight);
        // swap buffers while drawing done off scrreen
        temp = savThis.ctx;
        savThis.ctx = savThis.bufCtx;
      }
      for (i=0; i<savThis.animations.length; i++)
      {
        A = savThis.animations[i];       // is an animation object with getState method
        A.getState(localTime, nextState);
        savThis.render(A.obj, nextState.x, nextState.y, nextState.scl, nextState.rot);
      }
      if (savThis.buffered)
      {
        // drawing done, switch them back
        savThis.ctx = temp;
        // now bit-blt the image in buffer to the on-screen canvas
        savThis.ctx.drawImage(_buf[savThis.cId], 0, 0);
      }
      savThis.currTime = localTime;      // timestamp of what is currently on screen
      savThis.prevAnimMode = savThis.modes.PAUSED;
      savThis.animMode = savThis.modes.PAUSED;
    }

    // eqivalent to play for one frame and pause
    if (this.animMode == this.modes.PLAYING)
    {
      return;
    }
    // make the buffered drawing context match the screen ctx
    if (this.buffered)
    {
      this.bufCtx.strokeStyle = this.penCol;
      this.bufCtx.fillStyle = this.paintCol;
      this.bufCtx.lineWidth = this.penWid;
      this.bufCtx.lineCap = this.lineCap;
    }
    if (this.animMode == this.modes.PAUSED)
    {
      this.startTime = Date.now() - this.currTime;  // move time as if currFrame just drawn
    }
    this.prevAnimMode = this.animMode;
    this.animMode = this.modes.STEPPING;

    setTimeout(drawIt, this.stepTime);
  };

  Cango.prototype.playAnimation = function()
  {
    // anim is an object with id, obj, getState etc properties
    // each object in the animations array is rendered even if anim.mode = stopped
    // since the canvas is cleared every frame and the stopped ones would disappear
    // to have them disappear use deleteAnimation()
    // all animations get passed the same value of local time each frame to keep sync
    // this routine is the 'stepper' from timeline
    var savThis = this,
        nextState = {x:0, y:0, scl:1, rot:0};

    // this is the actual animator that draws each frame
    function drawIt(time)
    {
      var time = Date.now(),    // use this as a time stamp, browser don't all pass the same time code
          localTime,
          A, temp, i;

      if (savThis.prevAnimMode == savThis.modes.STOPPED)
      {
        savThis.startTime = time;                // forces localTime = 0 to start from beginning
      }
      localTime =  time - savThis.startTime;
      // do all the drawing for this frame
      savThis.clearCanvas();
      if (savThis.buffered)
      {
        // drawing will be off screen, clear buffer too
        savThis.bufCtx.clearRect(0, 0, savThis.rawWidth, savThis.rawHeight);
        // swap buffers while drawing done off scrreen
        temp = savThis.ctx;
        savThis.ctx = savThis.bufCtx;
      }
      for (i=0; i<savThis.animations.length; i++)
      {
        A = savThis.animations[i];       // is an animation object with getState method
        A.getState(localTime, nextState);
        savThis.render(A.obj, nextState.x, nextState.y, nextState.scl, nextState.rot);
      }
      if (savThis.buffered)
      {
        // drawing done, switch them back
        savThis.ctx = temp;
        // now bit-blt the image in buffer to the on-screen canvas
        savThis.ctx.drawImage(_buf[savThis.cId], 0, 0);
      }
      // drawing done
      savThis.currTime = localTime;      // timestamp of what is currently on screen
      savThis.prevAnimMode = savThis.modes.PLAYING;
      savThis.timer = window.requestAnimationFrame(drawIt);
    }

    if (this.animMode == this.modes.PLAYING)
    {
      return;
    }

    // make the buffered drawing context match the screen ctx
    if (this.buffered)
    {
      this.bufCtx.strokeStyle = this.penCol;
      this.bufCtx.fillStyle = this.paintCol;
      this.bufCtx.lineWidth = this.penWid;
      this.bufCtx.lineCap = this.lineCap;
    }
    if (this.animMode == this.modes.PAUSED)
    {
      this.startTime = Date.now() - this.currTime;  // move time as if currFrame just drawn
    }

    this.prevAnimMode = this.animMode;
    this.animMode = this.modes.PLAYING;

    this.timer = window.requestAnimationFrame(drawIt);
  };

  Cango.prototype.deleteAnimation = function(animId)
  {
    var idx = -1,
        i;

    this.stopAnimation();
    for (i=0; i<this.animations.length; i++)
    {
      if (this.animations[i].id == animId)
      {
        idx = i;
        break;
      }
    }
    if (idx == -1)
    {
      // not found
      return;
    }
    this.animations.splice(idx,1);       // delete the animation object
  };

  Cango.prototype.deleteAllAnimations = function()
  {
    this.stopAnimation();
    this.animations = [];
  };

  Cango.prototype.toImgObj = function(obj)
  {
    if ((obj.type != 'PATH')&&(obj.type != 'SHAPE'))
    {
      return;
    }

    // find the bounding box
    var top, rgt, bot, lft,
        dx, dy, w, h,
        xsc = this.xscl,
        ysc = obj.iso? -this.xscl : this.yscl,
        spr = {},
        img = new Image(),
        imgObj = new Obj2D(this, img, "IMG", true),   // iso=true
        i, j;

    function configImgObj()  // call when image loaded
    {
      var wid = imgObj.drawCmds.width,    // its loaded now so width is valid
          hgt = imgObj.drawCmds.height;  // keep aspect ratio

      imgObj.imgX = dx;     // world coords offset to drawing origin
      imgObj.imgY = dy-hgt;
      imgObj.width = wid;
      imgObj.height = hgt;
      // construct the DrawCmds for the text bounding box
      imgObj.bBoxCmds[0] = new DrawCmd("moveTo", [dx, -dy+hgt]);           // ul
      imgObj.bBoxCmds[1] = new DrawCmd("lineTo", [dx, -dy]);       // ll
      imgObj.bBoxCmds[2] = new DrawCmd("lineTo", [dx+wid, -dy]);   // lr
      imgObj.bBoxCmds[3] = new DrawCmd("lineTo", [dx+wid, -dy+hgt]);       // ur
      imgObj.bBoxCmds[4] = new DrawCmd("closePath", []);
    }

    // find pixel dimensions of the obj bounding box
    lft = rgt = obj.drawCmds[0].parms[0];
    bot = top = obj.drawCmds[0].parms[1];
    for (i=1; i < obj.drawCmds.length; i++)
    {
      for (j=0; j < obj.drawCmds[i].parms.length; j += 2)
      {
        // step through each draw command and find max and min end point or control point
        if (obj.drawCmds[i].parms[j] > rgt)
        {
          rgt = obj.drawCmds[i].parms[j];
        }
        if  (obj.drawCmds[i].parms[j] < lft)
        {
          lft = obj.drawCmds[i].parms[j];
        }
        if (obj.drawCmds[i].parms[j+1] > top)
        {
          top = obj.drawCmds[i].parms[j+1];
        }
        if  (obj.drawCmds[i].parms[j+1] < bot)
        {
          bot = obj.drawCmds[i].parms[j+1];
        }
      }
    }

    dx = lft*xsc-2,         // add a couple of pixels for aliasing
    dy = bot*ysc+2,
    w = (rgt - lft)*xsc+4;
    h = -(top - bot)*ysc+4;

    spr.width = w,        // pixels
    spr.height = h;
    spr.buf = document.createElement('canvas');    // create buffer in memory
    spr.buf.setAttribute('width', spr.width);
    spr.buf.setAttribute('height', spr.height);
    spr.gc = {};
    // now patch up a pseudo Cango context for _paintPath
    spr.gc.cId = 'sprite';
    spr.gc.cnvs = spr.buf;
    spr.gc.ctx = spr.gc.cnvs.getContext('2d');    // draw direct to screen canvas
    spr.gc.rawWidth = spr.width;          // width and height are like Image object
    spr.gc.rawHeight = spr.height;
    spr.gc.vpW = spr.gc.rawWidth;         // vp width in pixels (default to full canvas size)
    spr.gc.vpH = spr.gc.rawHeight;        // vp height in pixels
    spr.gc.vpLLx = 0;                     // vp lower left from canvas left in pixels
    spr.gc.vpLLy = spr.gc.rawHeight;      // vp lower left from canvas top
    spr.gc.xoffset = -dx;      // drawn at current pixel resolution
    spr.gc.yoffset = -dy;
    spr.gc.xscl = this.xscl;
    spr.gc.yscl = this.yscl;
    // use parent Cango values for drawing
    spr.gc.penCol = this.penCol.slice(0);   // copy value not reference
    spr.gc.penWid = this.penWid;    // pixels
    spr.gc.lineCap = this.lineCap.slice(0);
    spr.gc.paintCol = this.paintCol.slice(0);

//    this.clearCanvas.call(spr.gc, 'pink');   // for diagnostics
    // render the obj
    this._paintPath.call(spr.gc, obj);  // paint obj dwgOrg at 0,0
    // load the buffer canvas as an image into an Obj2D type 'IMG'
    imgObj.drawCmds.src = "";
    // img is rendered at pixel resolution (*xscl). The reference widht is in world coords
    // corrected by the scale factor 'imgXscale', so fix this for current world coords
    imgObj.imgXscale = 1/this.xscl;

    addLoadEvent(imgObj.drawCmds, configImgObj);
    // start to load the image
    imgObj.drawCmds.src = spr.gc.cnvs.toDataURL();

    return imgObj;
  };


  Drag2D = function(cangoGC, grabFn, dragFn, dropFn)
  {
    var savThis = this;

    this.cgo = cangoGC;
    this.parent = null;
    this.grabCallback = grabFn || null;
    this.dragCallback = dragFn || null;
    this.dropCallback = dropFn || null;
    this.dwgOrg = {x:0, y:0};           // parent (Obj2D) drawing origin in world coords
    this.grabOfs = {x:0, y:0};          // csr offset from parent (maybe Obj or Group) drawing origin

    // these closures are called in the scope of the Drag2D instance so this is valid
    this.grab = function(evt)
    {
      var event = evt||window.event;

      this.dwgOrg = this.parent.dwgOrg;

      this.cgo.cnvs.onmouseup = function(e){savThis.drop(e);};
      var csrPosWC = this.cgo.getCursorPosWC(event);      // update mouse pos to pass to the owner
      // copy the parent drawing origin (for convenience)
      this.grabOfs = {x:csrPosWC.x - this.dwgOrg.x,
                      y:csrPosWC.y - this.dwgOrg.y};

      if (this.grabCallback)
      {
        this.grabCallback(csrPosWC);    // call in the scope of dragNdrop object
      }
      this.cgo.cnvs.onmousemove = function(e){savThis.drag(e);};
      if (event.preventDefault)       // prevent default browser action (W3C)
      {
        event.preventDefault();
      }
      else                        // shortcut for stopping the browser action in IE
      {
        window.event.returnValue = false;
      }
      return false;
    };

    this.drag = function(event)
    {
      var csrPosWC = this.cgo.getCursorPosWC(event);  // update mouse pos to pass to the owner
      if (this.dragCallback)
      {
        this.dragCallback(csrPosWC);
      }
    };

    this.drop = function(event)
    {
      var csrPosWC = this.cgo.getCursorPosWC(event);  // update mouse pos to pass to the owner
      this.cgo.cnvs.onmouseup = null;
      this.cgo.cnvs.onmousemove = null;
      if (this.dropCallback)
      {
        this.dropCallback(csrPosWC);
      }
    };
  };

  svgToCgo2D = function(svgPath, xRef, yRef)
  {
    var cgoData = [],
        segs, strs,
        cmd, seg, cmdLetters, coords,
        xScale = 1,
        yScale = -1,                      // flip all the y coords to +ve up
        xOfs = xRef || 0,                 // move the drawing reference point
        yOfs = yRef || 0,
        k;

    function segsToCgo2D(segs, xRef, yRef, xScl, yScl)
    {
      var x = 0,
          y = 0,
          px, py,
          c1x, c1y,
          rot, rx, ry, larc, swp,
          seg, cmd, pc,
          commands = [],
          xScale = xScl || 1,
          yScale = yScl || xScale,   // in case only single scale factor passed
          xOfs = xRef || 0,          // move the shape drawing origin
          yOfs = yRef || 0,
          i, coords;

      for (i=0; i<segs.length; i++)
      {
        seg = segs[i];
        cmd = seg[0];
        if ((i==0)&&(cmd != 'M'))   // check that the first move is absolute
        {
          cmd = 'M';
        }
        coords = seg.slice(1);      // skip the command copy coords
        if (coords)
        {
          coords = coords.map(parseFloat);
        }
        switch(cmd)
        {
          case 'M':
            x = xOfs + xScale*coords[0];
            y = yOfs + yScale*coords[1];
            px = py = null;
            commands.push('M', x, y);
            coords.splice(0, 2);      // delete the 2 coords from the front of the array
            while (coords.length>0)
            {
              x = xOfs + xScale*coords[0];                // eqiv to muliple 'L' calls
              y = yOfs + yScale*coords[1];
              commands.push('L', x, y);
              coords.splice(0, 2);
            }
            break;
          case 'm':
            x += xScale*coords[0];
            y += yScale*coords[1];
            px = py = null;
            commands.push('M', x, y);
            coords.splice(0, 2);      // delete the 2 coords from the front of the array
            while (coords.length>0)
            {
              x += xScale*coords[0];              // eqiv to muliple 'l' calls
              y += yScale*coords[1];
              commands.push('L', x, y);
              coords.splice(0, 2);
            }
            break;
          case 'L':
            while (coords.length>0)
            {
              x = xOfs + xScale*coords[0];
              y = yOfs + yScale*coords[1];
              commands.push('L', x, y);
              coords.splice(0, 2);
            }
            px = py = null;
            break;
          case 'l':
            while (coords.length>0)
            {
              x += xScale*coords[0];
              y += yScale*coords[1];
              commands.push('L', x, y);
              coords.splice(0, 2);
            }
            px = py = null;
            break;
          case 'H':
            x = xOfs + xScale*coords[0];
            px = py = null ;
            commands.push('L', x, y);
            break;
          case 'h':
            x += xScale*coords[0];
            px = py = null ;
            commands.push('L', x, y);
            break;
          case 'V':
            y = yOfs + yScale*coords[0];
            px = py = null;
            commands.push('L', x, y);
            break;
          case 'v':
            y += yScale*coords[0];
            px = py = null;
            commands.push('L', x, y);
            break;
          case 'C':
            while (coords.length>0)
            {
              c1x = xOfs + xScale*coords[0];
              c1y = yOfs + yScale*coords[1];
              px = xOfs + xScale*coords[2];
              py = yOfs + yScale*coords[3];
              x = xOfs + xScale*coords[4];
              y = yOfs + yScale*coords[5];
              commands.push('C', c1x, c1y, px, py, x, y);
              coords.splice(0, 6);
            }
            break;
          case 'c':
            while (coords.length>0)
            {
              c1x = x + xScale*coords[0];
              c1y = y + yScale*coords[1];
              px = x + xScale*coords[2];
              py = y + yScale*coords[3];
              x += xScale*coords[4];
              y += yScale*coords[5];
              commands.push('C', c1x, c1y, px, py, x, y);
              coords.splice(0, 6);
            }
            break;
          case 'S':
            if (px == null || !pc.match(/[sc]/i))
            {
              px = x;                // already absolute coords
              py = y;
            }
            commands.push('C', x-(px-x), y-(py-y),
                              xOfs + xScale*coords[0], yOfs + yScale*coords[1],
                              xOfs + xScale*coords[2], yOfs + yScale*coords[3]);
            px = xOfs + xScale*coords[0];
            py = yOfs + yScale*coords[1];
            x = xOfs + xScale*coords[2];
            y = yOfs + yScale*coords[3];
            break;
          case 's':
            if (px == null || !pc.match(/[sc]/i))
            {
              px = x;
              py = y;
            }
            commands.push('C', x-(px-x), y-(py-y),
                              x + xOfs + xScale*coords[0], y +yOfs + yScale*coords[1],
                              x + xOfs + xScale*coords[2], y +yOfs + yScale*coords[3]);
            px = x + xScale*coords[0];
            py = y + yScale*coords[1];
            x += xScale*coords[2];
            y += yScale*coords[3];
            break;
          case 'Q':
            px = xOfs + xScale*coords[0];
            py = yOfs + yScale*coords[1];
            x = xOfs + xScale*coords[2];
            y = yOfs + yScale*coords[3];
            commands.push('Q', px, py, x, y);
            break;
          case 'q':
            commands.push('Q', [x + xScale*coords[0], y + yScale*coords[1],
                                x + xScale*coords[2], y + yScale*coords[3]]);
            px = x + xScale*coords[0];
            py = y + yScale*coords[1];
            x += xScale*coords[2];
            y += yScale*coords[3];
            break;
          case 'T':
            if (px == null || !pc.match(/[qt]/i))
            {
              px = x;
              py = y;
            }
            else
            {
              px = x-(px-x);
              py = y-(py-y);
            }
            commands.push('Q', px, py, xOfs + xScale*coords[0], yOfs + yScale*coords[1]);
            px = x-(px-x);
            py = y-(py-y);
            x = xOfs + xScale*coords[0];
            y = yOfs + yScale*coords[1];
            break;
          case 't':
            if (px == null || !pc.match(/[qt]/i))
            {
              px = x;
              py = y;
            }
            else
            {
              px = x-(px-x);
              py = y-(py-y);
            }
            commands.push('Q', px, py, x + xScale*coords[0], y + yScale*coords[1]);
            x += xScale*coords[0];
            y += yScale*coords[1];
            break;
          case 'A':
            while (coords.length>0)
            {
              px = x;
              py = y;
              rx = xScale*coords[0];
              ry = xScale*coords[1];
              rot = coords[2];            // don't switch to CCW +ve cgo2DToDrawCmd will
              larc = coords[3];
              swp = coords[4];            // sweep: don't switch swap to CCW +ve
              x = xOfs + xScale*coords[5];
              y = yOfs + yScale*coords[6];
              commands.push('A', rx, ry, rot, larc, swp, x, y);
              coords.splice(0, 7);
            }
            break;
          case 'a':
            while (coords.length>0)
            {
              px = x;
              py = y;
              rx = xScale*coords[0];
              ry = xScale*coords[1];
              rot = coords[2];          // don't switch to CCW +ve cgo2DToDrawCmd will
              larc = coords[3];
              swp = coords[4];          // sweep: don't switch swap to CCW +ve
              x += xScale*coords[5];
              y += yScale*coords[6];
              commands.push('A', rx, ry, rot, larc, swp, x, y);
              coords.splice(0, 7);
            }
            break;
          case 'Z':
            commands.push('Z');
            break;
          case 'z':
            commands.push('Z');
            break;
        }
        pc = cmd;     // save the previous command for possible reflected control points
      }
      return commands;
    }

    if (typeof svgPath != 'string')
    {
      return cgoData;
    }
    // this is a preprocessor to get an svg Path string into 'Cgo2D' format
    segs = [];
    strs = svgPath.split(/(?=[a-df-z])/i);  // avoid e in exponents
    // now array of strings with command letter start to each
    for (k=0; k<strs.length; k++)
    {
      seg = strs[k];
      // get command letter into an array
      cmdLetters = seg.match(/[a-z]/i);
      if (!cmdLetters)
      {
        return cgoData;
      }
      cmd = cmdLetters.slice(0,1);
      if ((k==0)&&(cmd[0] != 'M'))   // check that the first move is absolute
      {
        cmd[0] = 'M';
      }
      coords = seg.match(/[\-\+]?[0-9]*\.?[0-9]+([eE][\-\+]?[0-9]+)?/gi);
      if (coords)
      {
        coords = coords.map(parseFloat);
      }
      segs.push(cmd.concat(coords));
    }

    // now send these off to the svg segs to Cgo2D
    cgoData = segsToCgo2D(segs, xOfs, -yOfs, xScale, yScale);

    return cgoData;  // array in Cgo2D format ['M', x, y, 'L', x, y, ....]
  };

}());
