/*============================================================
  Filename: dspUtils-10.js
  By: A.R.Collins

  Digital Signal Processing utilities.

  Kindly give credit to Dr A.R.Collins <http://www.arc.id.au/>
  Report bugs to tony at arc.id.au
  Date   |Description                                     |By
  ------------------------------------------------------------
  13Aug08 Rev1.0 First release                             ARC
  26Aug08 Added time domain filter                         ARC
  24Sep08 Simplified 'K' calc in fft to be K=K/2           ARC
  06Nov10 Added overlapSave filter                         ARC
  08Nov10 calcFilter returns full coefficient array        ARC
  14Nov10 declare Le1 as a local                           ARC
  19Nov10 Added freqTranslate()                            ARC
  22Jul13 Tidy code for JSLint                             ARC
  ============================================================*/

function fft(Ind, Npair, Ar, Ai) {
    /*=========================================
     * Calculate the floating point complex FFT
     * Ind = +1 => FORWARD FFT
     * Ind = -l => INVERSE FFT
     * Data is passed in Npair Complex pairs
     * where Npair is power of 2 (2^N)
     * data is indexed from 0 to Npair-1
     * Real data in Ar
     * Imag data in Ai.
     *
     * Output data is returned in the same arrays,
     * DC in bin 0, +ve freqs in bins 1..Npair/2
     * -ve freqs in Npair/2+1 .. Npair-1.
     *
     * ref: Rabiner & Gold
     * "THEORY AND APPLICATION OF DIGITAL
     *  SIGNAL PROCESSING" p367
     *
     * Translated to JavaScript by A.R.Collins
     * <http://www.arc.id.au>
     *========================================*/

    var Pi = Math.PI,
        Num1,
        Num2,
        i,
        j,
        k,
        L,
        m,
        Le,
        Le1,
        Tr,
        Ti,
        Ur,
        Ui,
        Xr,
        Xi;

    m = isPwrOf2(Npair);
    if (m < 0) {
        alert('Npair must be power of 2 from 4 to 4096');
        return;
    }

    Num1 = Npair - 1;
    Num2 = Npair / 2;
    // if IFT conjugate prior to transforming:
    if (Ind < 0) {
        for (i = 0; i < Npair; i++) {
            Ai[i] *= -1;
        }
    }

    j = 0; // In place bit reversal of input data
    for (i = 0; i < Num1; i++) {
        if (i < j) {
            Tr = Ar[j];
            Ti = Ai[j];
            Ar[j] = Ar[i];
            Ai[j] = Ai[i];
            Ar[i] = Tr;
            Ai[i] = Ti;
        }
        k = Num2;
        while (k < j + 1) {
            j = j - k;
            k = k / 2;
        }
        j = j + k;
    }

    Le = 1;
    for (L = 1; L <= m; L++) {
        Le1 = Le;
        Le += Le;
        Ur = 1;
        Ui = 0;
        Wr = Math.cos(Pi / Le1);
        Wi = -Math.sin(Pi / Le1);
        for (j = 1; j <= Le1; j++) {
            for (i = j - 1; i <= Num1; i += Le) {
                Ip = i + Le1;
                Tr = Ar[Ip] * Ur - Ai[Ip] * Ui;
                Ti = Ar[Ip] * Ui + Ai[Ip] * Ur;
                Ar[Ip] = Ar[i] - Tr;
                Ai[Ip] = Ai[i] - Ti;
                Ar[i] = Ar[i] + Tr;
                Ai[i] = Ai[i] + Ti;
            }
            Xr = Ur * Wr - Ui * Wi;
            Xi = Ur * Wi + Ui * Wr;
            Ur = Xr;
            Ui = Xi;
        }
    }
    // conjugate and normalise
    if (Ind < 0) {
        for (i = 0; i < Npair; i++) {
            Ai[i] *= -1;
        }
    } else {
        for (i = 0; i < Npair; i++) {
            Ar[i] /= Npair;
            Ai[i] /= Npair;
        }
    }
}

function isPwrOf2(n) {
    var m = -1;
    for (m = 2; m < 13; m++) {
        if (Math.pow(2, m) == n) {
            return m;
        }
    }
    return -1;
}

function calcFilter(Fs, Fa, Fb, M, Att) {
    /*
     * This function calculates Kaiser windowed
     * FIR filter coefficients for a single passband
     * based on
     * "DIGITAL SIGNAL PROCESSING, II" IEEE Press pp 123-126.
     *
     * Fs=Sampling frequency
     * Fa=Low freq ideal cut off (0=low pass)
     * Fb=High freq ideal cut off (Fs/2=high pass)
     * Att=Minimum stop band attenuation (>21dB)
     * M=Number of points in filter (ODD number)
     * H[] holds the output coefficients (they are symetric only half generated)
     */
    var Np = (M - 1) / 2,
        A = [],
        Alpha,
        j,
        pi = Math.PI,
        Inoalpha,
        H = [];

    // Calculate the impulse response of the ideal filter
    A[0] = (2 * (Fb - Fa)) / Fs;
    for (j = 1; j <= Np; j++) {
        A[j] = (Math.sin((2 * j * pi * Fb) / Fs) - Math.sin((2 * j * pi * Fa) / Fs)) / (j * pi);
    }
    // Calculate the desired shape factor for the Kaiser-Bessel window
    if (Att < 21) {
        Alpha = 0;
    } else if (Att > 50) {
        Alpha = 0.1102 * (Att - 8.7);
    } else {
        Alpha = 0.5842 * Math.pow(Att - 21, 0.4) + 0.07886 * (Att - 21);
    }
    // Window the ideal response with the Kaiser-Bessel window
    Inoalpha = Ino(Alpha);
    for (j = 0; j <= Np; j++) {
        H[Np + j] = (A[j] * Ino(Alpha * Math.sqrt(1 - (j * j) / (Np * Np)))) / Inoalpha;
    }
    for (j = 0; j < Np; j++) {
        H[j] = H[M - 1 - j];
    }

    return H;
}

function Ino(x) {
    /*
     * This function calculates the zeroth order Bessel function
     */
    var d = 0,
        ds = 1,
        s = 1;
    do {
        d += 2;
        ds *= (x * x) / (d * d);
        s += ds;
    } while (ds > s * 1e-6);
    return s;
}

function kbWnd(Np, alpha) {
    /*
     * This function calculates the Kaiser-Bessel
     * window coefficients
     * Np = number of window points (Even)
     * Alpha useful range 1.5 to 4
     */
    var t,
        den,
        j,
        nOn2,
        wr = [];

    den = Ino(Math.PI * alpha);
    nOn2 = Np / 2;
    wr[0] = 0;
    wr[nOn2] = 2;
    for (j = 1; j < nOn2; j++) {
        t = Ino(Math.PI * alpha * Math.sqrt(1 - (j * j) / (nOn2 * nOn2)));
        wr[nOn2 + j] = (2 * t) / den;
        wr[nOn2 - j] = wr[nOn2 + j];
    }
    return wr;
}

function hannWnd(Np) {
    /*
     * This function calculates the Hanning
     * window coefficients
     * Np = number of window points (Even)
     */
    var mid,
        j,
        nOn2,
        wr = new Array(Np);

    nOn2 = Np / 2;
    wr[0] = 0;
    wr[nOn2] = 2;
    for (j = 1; j < nOn2; j++) {
        wr[nOn2 + j] = 1 + Math.cos((Math.PI * j) / nOn2); // cos^2(n*pi/N) = 0.5+0.5*cos(n*2*pi/N)
        wr[nOn2 - j] = wr[nOn2 + j];
    }
    return wr;
}

function corrFilter(H, ip, op, nPts, subSmp) {
    /*
     * This function implements digital filtering by correlation with optional
     * sub-sampled output
     *
     * H[] holds the double sided filter coeffs, M = H.length (number of points in FIR)
     * ip[] holds input data (length > nPts + M )
     * op[] is output buffer
     * nPts is the length of the required output data
     * subSmp is the subsampling rate subSmp=8 means output every 8th sample
     */

    var M = H.length,
        sum = 0, // accumulator
        i,
        j;

    if (subSmp == undefined || subSmp < 2) {
        subSmp = 1;
    }

    for (j = 0; j < nPts; j++) {
        for (i = 0; i < M; i++) {
            sum += H[i] * ip[subSmp * j + i];
        }
        op[j] = sum;
        sum = 0;
    }
}

function convFilter(H, ip, op, nPts, subSmp) {
    /*
     * This function implements digital filtering by convolution with optional
     * sub-sampled output
     *
     * H[] holds the double sided filter coeffs, M = H.length (number of points in FIR)
     * ip[] holds input data (length > nPts + M )
     * op[] is output buffer
     * nPts is the length of the required output data
     * subSmp is the subsampling rate subSmp=8 means output every 8th sample
     */

    var M = H.length,
        sum = 0, // accumulator
        i,
        j;

    if (subSmp == undefined || subSmp < 2) {
        subSmp = 1;
    }

    for (j = M; j < nPts + M; j++) {
        for (i = 0; i < M; i++) {
            sum += H[i] * ip[subSmp * j - i];
        }
        op[j - M] = sum;
        sum = 0;
    }
}

function overlapSaveFilter(H, ipReal, ipImag, opReal, opImag, nPts) {
    /*
     * This function implements digital filtering by the overlap-save method
     * with optional sub-sampled output
     *
     * H[] holds the filter coeffs, M = H.length (number of points in FIR)
     * ipReal[] & ipImag[] holds the complex input data, length > subSmp*(nPts + M)
     * opReal[] & opImag[] is the complex output buffer
     * nPts is the length of the required output data
     */

    var M = H.length,
        Np = (M - 1) / 2,
        tSize = 1024, // tSize is the FFT size to be used
        slab = tSize - M + 1,
        numPasses = Math.ceil(nPts / slab),
        max,
        i,
        j,
        tr,
        ti,
        ar = [],
        ai = [],
        br = [], // filter impulse response spectrum
        bi = [],
        iPtr = 0, // ptr to start of next ip block
        oPtr = 0; // ptr to start of op buffer
    // generate the spectrum of the filter impulse response
    // initialise filter spectrum
    for (j = 0; j < 1024; j++) {
        br[j] = 0;
        bi[j] = 0;
    }
    // put filter coeffs in real array (centered on x=0, wrapping around 1024 pts)
    max = Math.abs(H[Np]); // H[Np] is center point of filter impulse response
    br[0] = H[Np] / max;
    for (j = 1; j <= Np; j++) {
        br[j] = H[Np + j] / max;
        br[tSize - j] = br[j];
    }
    fft(1, tSize, br, bi);

    // zero the first Np points of the output array (they wont get data)
    for (i = 0; i < Np; i++) {
        opReal[i] = 0;
        opImag[i] = 0;
    }
    oPtr = Np; // move the oPtr ready for first slab

    for (j = 0; j < numPasses; j++) {
        // load the fft buffers
        for (i = 0; i < tSize; i++) {
            ar[i] = ipReal[iPtr + i];
            ai[i] = ipImag[iPtr + i];
        }
        iPtr += slab; // move the ip ptr ready for next slab
        fft(1, tSize, ar, ai);
        // multiply spectrum by filter spectrum
        for (i = 0; i < tSize; i++) {
            tr = ar[i] * br[i] - ai[i] * bi[i];
            ti = ar[i] * bi[i] + ai[i] * br[i];
            ar[i] = tr;
            ai[i] = ti;
        }
        // inverse FFT back to time domain
        fft(-1, tSize, ar, ai);

        // unload just the slab of uncorrupt data
        for (i = 0; i < slab; i++) {
            if (oPtr + i >= nPts) {
                break;
            }
            opReal[oPtr + i] = ar[Np + i];
            opImag[oPtr + i] = ai[Np + i];
        }
        oPtr += slab; // move the op ptr ready for next slab
    }
}

function freqTranslate(xReal, yReal, yImag, Npts, Fsmp, Fc) {
    /*
     * xReal holds signal data sampled at Fsmp smpl/sec
     * This function frequency translates Npts from xReal
     * shifting frequency fc down to 0 Hz.
     */
    var dT = 1.0 / Fsmp, // Fsmp is the sample frequency
        k;
    // Fc = center frequency of spectral region to be zoom analysed
    for (k = 0; k < Npts; k++) {
        yReal[k] = xReal[k] * Math.cos(2 * Math.PI * Fc * k * dT);
        yImag[k] = -xReal[k] * Math.sin(2 * Math.PI * Fc * k * dT);
    }
}
