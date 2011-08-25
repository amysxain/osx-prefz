/*

File: Stretcher.js

Abstract: Script code for a reusable Stretcher object.

Version: 1.0

© Copyright 2005 Apple Computer, Inc. All rights reserved.

IMPORTANT:  This Apple software is supplied to 
you by Apple Computer, Inc. ("Apple") in 
consideration of your agreement to the following 
terms, and your use, installation, modification 
or redistribution of this Apple software 
constitutes acceptance of these terms.  If you do 
not agree with these terms, please do not use, 
install, modify or redistribute this Apple 
software.

In consideration of your agreement to abide by 
the following terms, and subject to these terms, 
Apple grants you a personal, non-exclusive 
license, under Apple's copyrights in this 
original Apple software (the "Apple Software"), 
to use, reproduce, modify and redistribute the 
Apple Software, with or without modifications, in 
source and/or binary forms; provided that if you 
redistribute the Apple Software in its entirety 
and without modifications, you must retain this 
notice and the following text and disclaimers in 
all such redistributions of the Apple Software. 
Neither the name, trademarks, service marks or 
logos of Apple Computer, Inc. may be used to 
endorse or promote products derived from the 
Apple Software without specific prior written 
permission from Apple.  Except as expressly 
stated in this notice, no other rights or 
licenses, express or implied, are granted by 
Apple herein, including but not limited to any 
patent rights that may be infringed by your 
derivative works or by other works in which the 
Apple Software may be incorporated.

The Apple Software is provided by Apple on an "AS 
IS" basis.  APPLE MAKES NO WARRANTIES, EXPRESS OR 
IMPLIED, INCLUDING WITHOUT LIMITATION THE IMPLIED 
WARRANTIES OF NON-INFRINGEMENT, MERCHANTABILITY 
AND FITNESS FOR A PARTICULAR PURPOSE, REGARDING 
THE APPLE SOFTWARE OR ITS USE AND OPERATION ALONE 
OR IN COMBINATION WITH YOUR PRODUCTS.

IN NO EVENT SHALL APPLE BE LIABLE FOR ANY 
SPECIAL, INDIRECT, INCIDENTAL OR CONSEQUENTIAL 
DAMAGES (INCLUDING, BUT NOT LIMITED TO, 
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS 
OF USE, DATA, OR PROFITS; OR BUSINESS 
INTERRUPTION) ARISING IN ANY WAY OUT OF THE USE, 
REPRODUCTION, MODIFICATION AND/OR DISTRIBUTION OF 
THE APPLE SOFTWARE, HOWEVER CAUSED AND WHETHER 
UNDER THEORY OF CONTRACT, TORT (INCLUDING 
NEGLIGENCE), STRICT LIABILITY OR OTHERWISE, EVEN 
IF APPLE HAS BEEN ADVISED OF THE POSSIBILITY OF 
SUCH DAMAGE.

*/ 

/*
 ***************************************************************
 * <Stretcher object definition.  Stretches a div up and down> *
 ***************************************************************
 */
 

/*
 * Stretcher constructor; parameters:
 *
 * -- element: The element to stretch
 * -- stretchDistance: Distance (in pixels) the content should stretch
 * -- stretchDuration: How long (in ms) the stretch animation should take
 * -- onFinished: A callback (if no callback is needed, pass null)
 *
 */
function Stretcher (element, stretchDistance, stretchDuration, onFinished) {
	this.element = element;

	this.startTime = 0;
	this.timer = null;
	
	this.duration = stretchDuration;
	this.multiplier = 1;
	this.stretchTime = 0;
	
	this.stretchDistance = stretchDistance;
	
	// min and max position can be changed to alter the stretched/shrunk sizes;
	// getComputedStyle depends on the target (in this case, the stretcher element)
	// being visible, so don't instantiate the Stretcher until the content is shown
	this.minPosition = parseInt(document.defaultView.getComputedStyle(this.element, "").getPropertyValue("height"));
	this.maxPosition = this.minPosition + this.stretchDistance;
	
	// Set variables to what they'd be in the beginning "shrunk" state
	this.positionFrom = this.minPosition;
	this.positionNow = this.minPosition;
	this.positionTo = this.minPosition;
		
	this.onFinished = onFinished;
}

/*
 * This should only be called via a Stretcher instance, i.e. "instance.stretch(event)"
 * Calling Stretcher_stretch() directly will result in "this" evaluating to the window
 * object, and the function will fail; parameters:
 * 
 * -- event: the mouse click that starts everything off (from an onclick handler)
 *		We check for the shift key to do a slo-mo stretch
 */
Stretcher.prototype.stretch = function (event) {
	if (event && event != undefined && event.shiftKey) {
		// enable slo-mo
		this.multiplier = 20;
	} else this.multiplier = 1;
	
	var timeNow = (new Date).getTime();
	
	if (this.timer != null) {
		// We're already stretching in some direction;
		// change the destination position and restart the timer
		clearInterval(this.timer);
		this.timer = null;
		this.stretchTime -= (timeNow - this.startTime);
		this.positionFrom = this.positionNow;
	} else {
		this.stretchTime = this.duration * this.multiplier;
		this.positionFrom = this.positionNow;
	}

	// Change from our previous direction
	if (this.positionTo == this.minPosition) {
		this.positionTo = this.maxPosition;
	} else {
		this.positionTo = this.minPosition;
	}

	// If we're expanding, resize the window to make room for the newly-sized content
	// We don't want to do this before shrinking because we'll clip the content
	// Check for the widget object because this will be annoying in Safari
	if (window.widget && (this.positionTo == this.maxPosition)) {
		window.resizeTo(parseInt(document.defaultView.getComputedStyle(this.element, "").getPropertyValue("width")), this.positionTo);
	}

	this.startTime = timeNow - 13; // set it back one frame.
		
	// We need to store this in a local variable so the timer
	// does not lose scope when invoking tick
	var localThis = this;
	this.tick();
	this.timer = setInterval (function() { localThis.tick(); }, 13);

}
		
/*
 * Tick does all the incremental resize work
 * This function is very similar to the tick() function in the Fader sample
 */
Stretcher.prototype.tick = function () {
	var T;
	var ease;
	var time  = (new Date).getTime();
	var frame;
		
	T = limit_3(time-this.startTime, 0, this.stretchTime);
	ease = 0.5 - (0.5 * Math.cos(Math.PI * T / this.stretchTime));

	if (T >= this.stretchTime) {
		// go to the finished position when the timer is up
		this.positionNow = this.positionTo;
		clearInterval (this.timer);
		this.timer = null;
		// If we're shrinking, we resize the window AFTER the animation is complete
		// Otherwise we'll clip the content as it shrinks
		if (window.widget && this.positionTo == this.minPosition) {
			window.resizeTo(parseInt(document.defaultView.getComputedStyle(this.element, "").getPropertyValue("width")), this.positionNow);
		}
		if (this.onFinished) {
			// call after the last frame is drawn
			var localThis = this;
			setTimeout (function() { localThis.onFinished(); }, 0);
		}
	} else {
		this.positionNow = parseInt(computeNextFloat(this.positionFrom, this.positionTo, ease));
	}

	this.element.style.height = this.positionNow + "px";
}

/*
 * Report whether or not the Stretcher is in its maximized position
 * DO NOT call this function to determine whether or not the Stretcher is 
 * currently animating; set the onFinished handler to be notified when animation
 * is complete
 */
Stretcher.prototype.isStretched = function() {
	return (this.positionNow == this.maxPosition);
}

/*
 * Support functions for the stretch animation
 */
function limit_3 (a, b, c) {
    return a < b ? b : (a > c ? c : a);
}

function computeNextFloat (from, to, ease) {
    return from + (to - from) * ease;
}