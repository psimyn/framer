(function () {
'use strict';

function mouldingHeight(frame) {
    let length = Number(frame.artHeight) + 2 * frame.profile;
    if (frame.hasMat) {
      length += (frame.matTop + frame.matBottom);
    }
    return length
  }

  function mouldingWidth(frame) {
    let length = Number(frame.artWidth) + 2 * frame.profile;
    if (frame.hasMat) {
      length += (2 * frame.matSides);
    }
    return length
  }

  function getMoulding(frame) {
    return {
      width: mouldingWidth(frame),
      height: mouldingHeight(frame),
      profile: frame.profile,
      overlap: frame.overlap,
    }
  }

function applyComputations ( state, newState, oldState ) {
	if ( ( 'frame' in newState && typeof state.frame === 'object' || state.frame !== oldState.frame ) ) {
		state.canvasWidth = newState.canvasWidth = template$1.computed.canvasWidth( state.frame );
	}
	
	if ( ( 'frame' in newState && typeof state.frame === 'object' || state.frame !== oldState.frame ) ) {
		state.canvasHeight = newState.canvasHeight = template$1.computed.canvasHeight( state.frame );
	}
}

var template$1 = (function () {
window.vars = window.vars || {
  sku: 'mouldingblack',
};

return {

  data() {
    return {
    }
  },

  computed: {
    canvasWidth: (frame) => {
      return 2 * frame.artWidth
    },
    canvasHeight: (frame) => {
      return 2 * frame.artHeight
    }
  },

  onrender() {
    let torndown = false;
    this.on('teardown', () => torndown = true);

    this.observe('frame', (frame) => {
      this.refs.canvas.width = this.refs.canvas.width;
      const ctx = this.refs.canvas.getContext('2d');
      this.drawArt(frame);
      if (frame.hasMat)
        this.drawMat(frame);
      this.drawMoulding(frame).then(() => {
        if (frame.wall)
          this.drawWall(frame);
      });
    });
  },

  methods: {
    center(width, height) {
      const centerX = this.refs.canvas.width / 2;
      const centerY = this.refs.canvas.height / 2;
      const top = centerY - height / 2;
      const bottom = centerY + height / 2;
      const left = centerX - width / 2;
      const right = centerX + width / 2;
      return {top, bottom, left, right}
    },

    drawArt(frame) {
      const ctx = this.refs.canvas.getContext('2d');

      let {top, bottom, left, right} = this.center(frame.artWidth, frame.artHeight);

      ctx.fillStyle = '#999999';
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(right, top);
      ctx.lineTo(right, bottom);
      ctx.lineTo(left, bottom);
      ctx.closePath();
      ctx.fill();
      if (frame.image)
        ctx.drawImage(frame.image, left, top, frame.artWidth, frame.artHeight);
    },

    drawMat(frame) {
      const ctx = this.refs.canvas.getContext('2d');
      const art = this.center(frame.artWidth, frame.artHeight);

      const left = art.left - frame.matSides;
      const right = art.right + frame.matSides;
      const top = art.top - frame.matTop;
      const bottom = art.bottom + frame.matBottom;

      ctx.fillStyle = '#fff';
      ctx.beginPath();

      ctx.moveTo(left, top);
      ctx.lineTo(right, top);
      ctx.lineTo(right, bottom);
      ctx.lineTo(left, bottom);
      ctx.closePath();
      ctx.moveTo(art.left, art.top);
      ctx.lineTo(art.left, art.bottom);
      ctx.lineTo(art.right, art.bottom);
      ctx.lineTo(art.right, art.top);
      ctx.closePath();
      ctx.fill();

    },

    drawWall(frame) {
      const canvas = this.refs.wallCanvas;
      const art = this.refs.canvas;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(frame.wall, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(this.refs.canvas, (canvas.width / 2) - art.width / 2, 40, art.width, art.width);  
    },

    createPattern(image, width, rotate) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = width;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotate * Math.PI / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      return ctx.createPattern(canvas, 'repeat')
    },

    // todo: whoever came up with this function sig should be fired 
    drawMouldingSide(profile, mouldingImage, rotate, translate, lines) {
      const ctx = this.refs.canvas.getContext('2d');
      ctx.save();
      ctx.beginPath();
      ctx.shadowColor = 'rgba(66, 55, 55, 0.12)';
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 8;
      ctx.moveTo(lines[0][0], lines[0][1]);
      ctx.lineTo(lines[1][0], lines[1][1]);
      ctx.lineTo(lines[2][0], lines[2][1]);
      ctx.lineTo(lines[3][0], lines[3][1]);
      ctx.closePath();
      ctx.fillStyle = this.createPattern(mouldingImage, profile, rotate);
      ctx.translate(translate[0] % profile, translate[1] % profile);
      ctx.fill();
      ctx.restore();
    },

    drawMoulding(frame) {
      const ctx = this.refs.canvas.getContext('2d');
      const {width, height, profile, overlap} = getMoulding(frame); 

      const moulding = this.center(Number(frame.artWidth) + 2 * profile, Number(frame.artHeight) + 2 * profile);

      if (frame.hasMat) {
        moulding.top -= frame.matTop;
        moulding.bottom += frame.matBottom;
        moulding.left -= frame.matSides;
        moulding.right += frame.matSides;
      }

      // TODO: get the tile image from state instead of this garbage
      return new Promise((resolve, reject) => {
        const tile = new Image();
        tile.src = 'tile.jpg';
        tile.onload = () => {
          // left side
          this.drawMouldingSide(profile, tile, 0, [moulding.left, 0], [
            [moulding.left, moulding.top],
            [moulding.left + profile, moulding.top + profile],
            [moulding.left + profile, moulding.bottom - profile],
            [moulding.left, moulding.bottom]
          ]);

          // top
          this.drawMouldingSide(profile, tile, 90, [0, moulding.top], [
            [moulding.left, moulding.top],
            [moulding.right, moulding.top],
            [moulding.right - profile, moulding.top + profile],
            [moulding.left + profile, moulding.top + profile]
          ]);

          // right 
          this.drawMouldingSide(profile, tile, 180, [moulding.right, 0], [
            [moulding.right, moulding.top],
            [moulding.right, moulding.bottom],
            [moulding.right - profile, moulding.bottom - profile],
            [moulding.right - profile, moulding.top + profile]
          ]);

          this.drawMouldingSide(profile, tile, 270, [0, moulding.bottom], [
            [moulding.right, moulding.bottom],
            [moulding.left, moulding.bottom],
            [moulding.left + profile, moulding.bottom - profile],
            [moulding.right - profile, moulding.bottom - profile]
          ]);
          resolve();
        };
        tile.onerror = function() {
          // TODO: placeholder frame??
        };
      })
    }
  }
}
}());

let addedCss = false;
function addCss () {
	var style = document.createElement( 'style' );
	style.textContent = "                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     \n  canvas[svelte-1943234976], [svelte-1943234976] canvas {\n    position: static; left: 0; top: 0;\n    outline: solid 1px rgba(200, 200, 200, 0.8);\n  }\n\n  .wall[svelte-1943234976], [svelte-1943234976] .wall {\n    max-width: 100vw;\n    max-height: 100vh;\n  }\n\n  .artwork[svelte-1943234976], [svelte-1943234976] .artwork {\n    display: none;\n  }\n";
	document.head.appendChild( style );

	addedCss = true;
}

function renderMainFragment$1 ( root, component, target ) {
	var canvas = document.createElement( 'canvas' );
	canvas.setAttribute( 'svelte-1943234976', '' );
	component.refs.canvas = canvas;
	canvas.className = "artwork";
	canvas.width = "1000";
	canvas.height = "1000";
	
	target.appendChild( canvas );
	
	var text = document.createTextNode( "\n" );
	target.appendChild( text );
	
	var canvas1 = document.createElement( 'canvas' );
	canvas1.setAttribute( 'svelte-1943234976', '' );
	component.refs.wallCanvas = canvas1;
	canvas1.className = "wall";
	canvas1.width = "1200";
	canvas1.height = "1200";
	
	target.appendChild( canvas1 );

	return {
		update: function ( changed, root ) {
			
		},

		teardown: function ( detach ) {
			if ( component.refs.canvas === canvas ) component.refs.canvas = null;
			if ( detach ) canvas.parentNode.removeChild( canvas );
			
			if ( detach ) text.parentNode.removeChild( text );
			
			if ( component.refs.wallCanvas === canvas1 ) component.refs.wallCanvas = null;
			if ( detach ) canvas1.parentNode.removeChild( canvas1 );
		}
	};
}

function Renderer ( options ) {
	var component = this;
this.refs = {};
	var state = Object.assign( template$1.data(), options.data );
applyComputations( state, state, {} );

	var observers = {
		immediate: Object.create( null ),
		deferred: Object.create( null )
	};

	var callbacks = Object.create( null );

	function dispatchObservers ( group, newState, oldState ) {
		for ( var key in group ) {
			if ( !( key in newState ) ) continue;

			var newValue = newState[ key ];
			var oldValue = oldState[ key ];

			if ( newValue === oldValue && typeof newValue !== 'object' ) continue;

			var callbacks = group[ key ];
			if ( !callbacks ) continue;

			for ( var i = 0; i < callbacks.length; i += 1 ) {
				var callback = callbacks[i];
				if ( callback.__calling ) continue;

				callback.__calling = true;
				callback.call( component, newValue, oldValue );
				callback.__calling = false;
			}
		}
	}

	this.fire = function fire ( eventName, data ) {
		var handlers = eventName in callbacks && callbacks[ eventName ].slice();
		if ( !handlers ) return;

		for ( var i = 0; i < handlers.length; i += 1 ) {
			handlers[i].call( this, data );
		}
	};

	this.get = function get ( key ) {
		return key ? state[ key ] : state;
	};

	this.set = function set ( newState ) {
		var oldState = state;
		state = Object.assign( {}, oldState, newState );
		
		applyComputations( state, newState, oldState );
		
		dispatchObservers( observers.immediate, newState, oldState );
		if ( mainFragment ) mainFragment.update( newState, state );
		dispatchObservers( observers.deferred, newState, oldState );
	};

	this.observe = function ( key, callback, options ) {
		var group = ( options && options.defer ) ? observers.deferred : observers.immediate;

		( group[ key ] || ( group[ key ] = [] ) ).push( callback );

		if ( !options || options.init !== false ) {
			callback.__calling = true;
			callback.call( component, state[ key ] );
			callback.__calling = false;
		}

		return {
			cancel: function () {
				var index = group[ key ].indexOf( callback );
				if ( ~index ) group[ key ].splice( index, 1 );
			}
		};
	};

	this.on = function on ( eventName, handler ) {
		var handlers = callbacks[ eventName ] || ( callbacks[ eventName ] = [] );
		handlers.push( handler );

		return {
			cancel: function () {
				var index = handlers.indexOf( handler );
				if ( ~index ) handlers.splice( index, 1 );
			}
		};
	};

	this.teardown = function teardown ( detach ) {
		this.fire( 'teardown' );

		mainFragment.teardown( detach !== false );
		mainFragment = null;

		state = {};
	};

	if ( !addedCss ) addCss();
	
	var mainFragment = renderMainFragment$1( state, this, options.target );
	
	if ( options.parent ) {
		options.parent.__renderHooks.push({ fn: template$1.onrender, context: this });
	} else {
		template$1.onrender.call( this );
	}
}

Renderer.prototype = template$1.methods;

var template$3 = (function () {
  return {
    data() {
      return {
        frame: {
        }
      }
    }
  }
}());

let addedCss$2 = false;
function addCss$2 () {
	var style = document.createElement( 'style' );
	style.textContent = "                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       \n  label[svelte-3408034690], [svelte-3408034690] label {\n    display: block;\n  }\n\n  .mat-section[svelte-3408034690], [svelte-3408034690] .mat-section {\n    max-height: 0;\n    overflow: hidden;\n  }\n\n  .inline[svelte-3408034690], [svelte-3408034690] .inline {\n    display: flex;\n  }\n\n  .inline >  *[svelte-3408034690], .inline >  [svelte-3408034690] *, .inline[svelte-3408034690] > *, [svelte-3408034690] .inline >  * {\n    margin: 0 12px;\n  }\n\n  #hasMat:checked ~  .mat-section[svelte-3408034690], #hasMat:checked ~  [svelte-3408034690] .mat-section, #hasMat[svelte-3408034690]:checked ~ .mat-section, [svelte-3408034690] #hasMat:checked ~  .mat-section {\n    max-height: 600px;\n\n  }\n\n";
	document.head.appendChild( style );

	addedCss$2 = true;
}

function renderMainFragment$3 ( root, component, target ) {
	var input = document.createElement( 'input' );
	input.setAttribute( 'svelte-3408034690', '' );
	input.id = "hasMat";
	input.type = "checkbox";
	input.className = "invisible";
	var input_updating = false;
	
	function inputChangeHandler () {
		input_updating = true;
		var frame = component.get( 'frame' );
		frame.hasMat = input.checked;
		component.set({ frame: frame });
		input_updating = false;
	}
	
	input.addEventListener( 'change', inputChangeHandler, false );
	input.checked = root.frame.hasMat;
	
	target.appendChild( input );
	
	var text = document.createTextNode( "\n" );
	target.appendChild( text );
	
	var label = document.createElement( 'label' );
	label.setAttribute( 'svelte-3408034690', '' );
	label.htmlFor = "hasMat";
	
	var text1 = document.createTextNode( root.frame.hasMat ? 'Remove' : 'Add' );
	label.appendChild( text1 );
	
	label.appendChild( document.createTextNode( " matboard" ) );
	
	target.appendChild( label );
	
	var text3 = document.createTextNode( "\n" );
	target.appendChild( text3 );
	
	var div = document.createElement( 'div' );
	div.setAttribute( 'svelte-3408034690', '' );
	div.className = "mat-section";
	
	var div1 = document.createElement( 'div' );
	div1.className = "inline";
	
	var div2 = document.createElement( 'div' );
	
	var label1 = document.createElement( 'label' );
	
	label1.appendChild( document.createTextNode( "Top" ) );
	
	div2.appendChild( label1 );
	
	div2.appendChild( document.createTextNode( "\n      " ) );
	
	var input1 = document.createElement( 'input' );
	input1.type = "number";
	var input1_updating = false;
	
	function input1ChangeHandler () {
		input1_updating = true;
		var frame = component.get( 'frame' );
		frame.matTop = input1.value;
		component.set({ frame: frame });
		input1_updating = false;
	}
	
	input1.addEventListener( 'change', input1ChangeHandler, false );
	input1.value = root.frame.matTop;
	
	div2.appendChild( input1 );
	
	div1.appendChild( div2 );
	
	div1.appendChild( document.createTextNode( "\n    " ) );
	
	var div3 = document.createElement( 'div' );
	
	var label2 = document.createElement( 'label' );
	
	label2.appendChild( document.createTextNode( "Sides" ) );
	
	div3.appendChild( label2 );
	
	div3.appendChild( document.createTextNode( "\n      " ) );
	
	var input2 = document.createElement( 'input' );
	input2.type = "number";
	var input2_updating = false;
	
	function input2ChangeHandler () {
		input2_updating = true;
		var frame = component.get( 'frame' );
		frame.matSides = input2.value;
		component.set({ frame: frame });
		input2_updating = false;
	}
	
	input2.addEventListener( 'change', input2ChangeHandler, false );
	input2.value = root.frame.matSides;
	
	div3.appendChild( input2 );
	
	div1.appendChild( div3 );
	
	div1.appendChild( document.createTextNode( "\n    " ) );
	
	var div4 = document.createElement( 'div' );
	
	var label3 = document.createElement( 'label' );
	
	label3.appendChild( document.createTextNode( "Bottom" ) );
	
	div4.appendChild( label3 );
	
	div4.appendChild( document.createTextNode( "\n      " ) );
	
	var input3 = document.createElement( 'input' );
	input3.type = "number";
	var input3_updating = false;
	
	function input3ChangeHandler () {
		input3_updating = true;
		var frame = component.get( 'frame' );
		frame.matBottom = input3.value;
		component.set({ frame: frame });
		input3_updating = false;
	}
	
	input3.addEventListener( 'change', input3ChangeHandler, false );
	input3.value = root.frame.matBottom;
	
	div4.appendChild( input3 );
	
	div1.appendChild( div4 );
	
	div.appendChild( div1 );
	
	target.appendChild( div );

	return {
		update: function ( changed, root ) {
			if ( !input_updating ) input.checked = root.frame.hasMat;
			
			text1.data = root.frame.hasMat ? 'Remove' : 'Add';
			
			if ( !input1_updating ) input1.value = root.frame.matTop;
			
			if ( !input2_updating ) input2.value = root.frame.matSides;
			
			if ( !input3_updating ) input3.value = root.frame.matBottom;
		},

		teardown: function ( detach ) {
			input.removeEventListener( 'change', inputChangeHandler, false );
			if ( detach ) input.parentNode.removeChild( input );
			
			if ( detach ) text.parentNode.removeChild( text );
			
			if ( detach ) label.parentNode.removeChild( label );
			
			if ( detach ) text3.parentNode.removeChild( text3 );
			
			if ( detach ) div.parentNode.removeChild( div );
			
			
			
			
			
			
			
			input1.removeEventListener( 'change', input1ChangeHandler, false );
			
			
			
			
			
			input2.removeEventListener( 'change', input2ChangeHandler, false );
			
			
			
			
			
			input3.removeEventListener( 'change', input3ChangeHandler, false );
		}
	};
}

function MatForm ( options ) {
	var component = this;
	var state = Object.assign( template$3.data(), options.data );

	var observers = {
		immediate: Object.create( null ),
		deferred: Object.create( null )
	};

	var callbacks = Object.create( null );

	function dispatchObservers ( group, newState, oldState ) {
		for ( var key in group ) {
			if ( !( key in newState ) ) continue;

			var newValue = newState[ key ];
			var oldValue = oldState[ key ];

			if ( newValue === oldValue && typeof newValue !== 'object' ) continue;

			var callbacks = group[ key ];
			if ( !callbacks ) continue;

			for ( var i = 0; i < callbacks.length; i += 1 ) {
				var callback = callbacks[i];
				if ( callback.__calling ) continue;

				callback.__calling = true;
				callback.call( component, newValue, oldValue );
				callback.__calling = false;
			}
		}
	}

	this.fire = function fire ( eventName, data ) {
		var handlers = eventName in callbacks && callbacks[ eventName ].slice();
		if ( !handlers ) return;

		for ( var i = 0; i < handlers.length; i += 1 ) {
			handlers[i].call( this, data );
		}
	};

	this.get = function get ( key ) {
		return key ? state[ key ] : state;
	};

	this.set = function set ( newState ) {
		var oldState = state;
		state = Object.assign( {}, oldState, newState );
		
		dispatchObservers( observers.immediate, newState, oldState );
		if ( mainFragment ) mainFragment.update( newState, state );
		dispatchObservers( observers.deferred, newState, oldState );
	};

	this.observe = function ( key, callback, options ) {
		var group = ( options && options.defer ) ? observers.deferred : observers.immediate;

		( group[ key ] || ( group[ key ] = [] ) ).push( callback );

		if ( !options || options.init !== false ) {
			callback.__calling = true;
			callback.call( component, state[ key ] );
			callback.__calling = false;
		}

		return {
			cancel: function () {
				var index = group[ key ].indexOf( callback );
				if ( ~index ) group[ key ].splice( index, 1 );
			}
		};
	};

	this.on = function on ( eventName, handler ) {
		var handlers = callbacks[ eventName ] || ( callbacks[ eventName ] = [] );
		handlers.push( handler );

		return {
			cancel: function () {
				var index = handlers.indexOf( handler );
				if ( ~index ) handlers.splice( index, 1 );
			}
		};
	};

	this.teardown = function teardown ( detach ) {
		this.fire( 'teardown' );

		mainFragment.teardown( detach !== false );
		mainFragment = null;

		state = {};
	};

	if ( !addedCss$2 ) addCss$2();
	
	var mainFragment = renderMainFragment$3( state, this, options.target );
}

var template$4 = (function () {
  return {
    data() {
      return {
        image: '',
        imageUrl: '',
        label: 'Select image',
      }
    },

    onrender() {
      this.observe('image', (image) => {
        if (!image) return
        const input = this.refs.imageInput;
        const fileReader = new FileReader();
        fileReader.readAsDataURL(input.files[0]);
        fileReader.onloadend = (event) => {
          this.set({imageUrl: event.target.result});
        };
      });

      this.observe('imageUrl', (imageUrl) => {
        const img = document.createElement('img');
        img.src = imageUrl; 
        img.onload = () => {
          this.set({
            imageEl: img
          });
        };
      });
    }
  }
}());

let addedCss$3 = false;
function addCss$3 () {
	var style = document.createElement( 'style' );
	style.textContent = "                                                                                                                                                               \n  .invisible[svelte-1680157581], [svelte-1680157581] .invisible {\n    width: 0.1px;\n    height: 0.1px;\n    opacity: 0;\n    overflow: hidden;\n    position: absolute;\n    z-index: -1;\n  }\n";
	document.head.appendChild( style );

	addedCss$3 = true;
}

function renderMainFragment$4 ( root, component, target ) {
	var div = document.createElement( 'div' );
	div.setAttribute( 'svelte-1680157581', '' );
	
	var input = document.createElement( 'input' );
	component.refs.imageInput = input;
	input.id = "imageInput";
	input.className = "invisible";
	input.type = "file";
	var input_updating = false;
	
	function inputChangeHandler () {
		input_updating = true;
		component.set({ image: input.value });
		input_updating = false;
	}
	
	input.addEventListener( 'change', inputChangeHandler, false );
	input.value = root.image;
	
	div.appendChild( input );
	
	div.appendChild( document.createTextNode( "\n  " ) );
	
	var label = document.createElement( 'label' );
	label.htmlFor = "imageInput";
	
	var text1 = document.createTextNode( root.label );
	label.appendChild( text1 );
	
	div.appendChild( label );
	
	target.appendChild( div );

	return {
		update: function ( changed, root ) {
			if ( !input_updating ) input.value = root.image;
			
			text1.data = root.label;
		},

		teardown: function ( detach ) {
			if ( detach ) div.parentNode.removeChild( div );
			
			if ( component.refs.imageInput === input ) component.refs.imageInput = null;
			input.removeEventListener( 'change', inputChangeHandler, false );
			
			
		}
	};
}

function FileInput ( options ) {
	var component = this;
this.refs = {};
	var state = Object.assign( template$4.data(), options.data );

	var observers = {
		immediate: Object.create( null ),
		deferred: Object.create( null )
	};

	var callbacks = Object.create( null );

	function dispatchObservers ( group, newState, oldState ) {
		for ( var key in group ) {
			if ( !( key in newState ) ) continue;

			var newValue = newState[ key ];
			var oldValue = oldState[ key ];

			if ( newValue === oldValue && typeof newValue !== 'object' ) continue;

			var callbacks = group[ key ];
			if ( !callbacks ) continue;

			for ( var i = 0; i < callbacks.length; i += 1 ) {
				var callback = callbacks[i];
				if ( callback.__calling ) continue;

				callback.__calling = true;
				callback.call( component, newValue, oldValue );
				callback.__calling = false;
			}
		}
	}

	this.fire = function fire ( eventName, data ) {
		var handlers = eventName in callbacks && callbacks[ eventName ].slice();
		if ( !handlers ) return;

		for ( var i = 0; i < handlers.length; i += 1 ) {
			handlers[i].call( this, data );
		}
	};

	this.get = function get ( key ) {
		return key ? state[ key ] : state;
	};

	this.set = function set ( newState ) {
		var oldState = state;
		state = Object.assign( {}, oldState, newState );
		
		dispatchObservers( observers.immediate, newState, oldState );
		if ( mainFragment ) mainFragment.update( newState, state );
		dispatchObservers( observers.deferred, newState, oldState );
	};

	this.observe = function ( key, callback, options ) {
		var group = ( options && options.defer ) ? observers.deferred : observers.immediate;

		( group[ key ] || ( group[ key ] = [] ) ).push( callback );

		if ( !options || options.init !== false ) {
			callback.__calling = true;
			callback.call( component, state[ key ] );
			callback.__calling = false;
		}

		return {
			cancel: function () {
				var index = group[ key ].indexOf( callback );
				if ( ~index ) group[ key ].splice( index, 1 );
			}
		};
	};

	this.on = function on ( eventName, handler ) {
		var handlers = callbacks[ eventName ] || ( callbacks[ eventName ] = [] );
		handlers.push( handler );

		return {
			cancel: function () {
				var index = handlers.indexOf( handler );
				if ( ~index ) handlers.splice( index, 1 );
			}
		};
	};

	this.teardown = function teardown ( detach ) {
		this.fire( 'teardown' );

		mainFragment.teardown( detach !== false );
		mainFragment = null;

		state = {};
	};

	if ( !addedCss$3 ) addCss$3();
	
	var mainFragment = renderMainFragment$4( state, this, options.target );
	
	if ( options.parent ) {
		options.parent.__renderHooks.push({ fn: template$4.onrender, context: this });
	} else {
		template$4.onrender.call( this );
	}
}

var template$2 = (function () {
 
  return {
    components: {
      MatForm,
      FileInput
    },

    data() {
      return {
        wall: '',
        image: '',
        imageUrl: 'data:image/jpeg;base64,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',
        wallUrl: 'bricks.jpg',
        frame: {
        }
      }
    },

    onrender() {
      this.observe('image', (image) => {
        if (!image) return
        const input = this.refs.imageInput;
        const fileReader = new FileReader();
        fileReader.readAsDataURL(input.files[0]);
        fileReader.onloadend = (event) => {
          this.set({imageUrl: event.target.result});
        };
      });

      this.observe('imageUrl', (imageUrl) => {
        const img = document.createElement('img');
        img.src = imageUrl; 
        img.onload = () => {
          const frame = this.get('frame');
          frame.image = img;
          this.set({
            frame
          });
        };
      });

      this.observe('wallUrl', (imageUrl) => {
        const img = document.createElement('img');
        img.src = imageUrl; 
        img.onload = () => {
          const frame = this.get('frame');
          frame.wall = img;
          this.set({
            frame
          });
        };
      });
    }
  }
}());

let addedCss$1 = false;
function addCss$1 () {
	var style = document.createElement( 'style' );
	style.textContent = "                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     \n  .invisible[svelte-3447689895], [svelte-3447689895] .invisible {\n    width: 0.1px;\n    height: 0.1px;\n    opacity: 0;\n    overflow: hidden;\n    position: absolute;\n    z-index: -1;\n  }\n";
	document.head.appendChild( style );

	addedCss$1 = true;
}

function renderMainFragment$2 ( root, component, target ) {
	var form = document.createElement( 'form' );
	form.setAttribute( 'svelte-3447689895', '' );
	
	var fileInput_initialData = {
		label: "Select Art/Photo/Print"
	};
	
	if ( 'imageUrl' in root ) fileInput_initialData.imageUrl = root.imageUrl;
	if ( 'image' in root.frame ) fileInput_initialData.imageEl = root.frame.image;
	
	var fileInput = new template$2.components.FileInput({
		target: form,
		parent: component,
		data: fileInput_initialData
	});
	var fileInput_updating = false;
	
	component.__bindings.push( function () {
		fileInput.observe( 'imageUrl', function ( value ) {
			fileInput_updating = true;
			component.set({ imageUrl: value });
			fileInput_updating = false;
		});
	});
	var fileInput_updating = false;
	
	component.__bindings.push( function () {
		fileInput.observe( 'imageEl', function ( value ) {
			fileInput_updating = true;
			var frame = component.get( 'frame' );
			frame.image = value;
			component.set({ frame: frame });
			fileInput_updating = false;
		});
	});
	
	form.appendChild( document.createTextNode( "\n " ) );
	
	var fileInput1_initialData = {
		label: "Select Wall"
	};
	
	if ( 'wallUrl' in root ) fileInput1_initialData.wallUrl = root.wallUrl;
	if ( 'wall' in root.frame ) fileInput1_initialData.imageEl = root.frame.wall;
	
	var fileInput1 = new template$2.components.FileInput({
		target: form,
		parent: component,
		data: fileInput1_initialData
	});
	var fileInput1_updating = false;
	
	component.__bindings.push( function () {
		fileInput1.observe( 'wallUrl', function ( value ) {
			fileInput1_updating = true;
			component.set({ wallUrl: value });
			fileInput1_updating = false;
		});
	});
	var fileInput1_updating = false;
	
	component.__bindings.push( function () {
		fileInput1.observe( 'imageEl', function ( value ) {
			fileInput1_updating = true;
			var frame = component.get( 'frame' );
			frame.wall = value;
			component.set({ frame: frame });
			fileInput1_updating = false;
		});
	});
	
	form.appendChild( document.createTextNode( "\n " ) );
	
	var div = document.createElement( 'div' );
	
	var label = document.createElement( 'label' );
	
	label.appendChild( document.createTextNode( "Art width" ) );
	
	div.appendChild( label );
	
	div.appendChild( document.createTextNode( "\n   " ) );
	
	var input = document.createElement( 'input' );
	var input_updating = false;
	
	function inputChangeHandler () {
		input_updating = true;
		var frame = component.get( 'frame' );
		frame.artWidth = input.value;
		component.set({ frame: frame });
		input_updating = false;
	}
	
	input.addEventListener( 'input', inputChangeHandler, false );
	input.value = root.frame.artWidth;
	
	div.appendChild( input );
	
	form.appendChild( div );
	
	form.appendChild( document.createTextNode( "\n " ) );
	
	var div1 = document.createElement( 'div' );
	
	var label1 = document.createElement( 'label' );
	
	label1.appendChild( document.createTextNode( "Art height" ) );
	
	div1.appendChild( label1 );
	
	div1.appendChild( document.createTextNode( "\n   " ) );
	
	var input1 = document.createElement( 'input' );
	var input1_updating = false;
	
	function input1ChangeHandler () {
		input1_updating = true;
		var frame = component.get( 'frame' );
		frame.artHeight = input1.value;
		component.set({ frame: frame });
		input1_updating = false;
	}
	
	input1.addEventListener( 'input', input1ChangeHandler, false );
	input1.value = root.frame.artHeight;
	
	div1.appendChild( input1 );
	
	form.appendChild( div1 );
	
	form.appendChild( document.createTextNode( "\n " ) );
	
	var div2 = document.createElement( 'div' );
	
	var select = document.createElement( 'select' );
	var select_updating = false;
	
	function selectChangeHandler () {
		select_updating = true;
		var selectedOption = select.selectedOptions[0] || select.options[0];
		var frame = component.get( 'frame' );
		frame.unit = selectedOption && selectedOption.__value;
		component.set({ frame: frame });
		select_updating = false;
	}
	
	select.addEventListener( 'change', selectChangeHandler, false );
	select.value = root.frame.unit;
	component.__bindings.push( selectChangeHandler );
	
	var option = document.createElement( 'option' );
	option.__value = "mm";
	option.value = option.__value;
	
	option.appendChild( document.createTextNode( "mm" ) );
	
	select.appendChild( option );
	
	select.appendChild( document.createTextNode( "\n     " ) );
	
	var option1 = document.createElement( 'option' );
	option1.__value = "cm";
	option1.value = option1.__value;
	
	option1.appendChild( document.createTextNode( "cm" ) );
	
	select.appendChild( option1 );
	
	select.appendChild( document.createTextNode( "\n     " ) );
	
	var option2 = document.createElement( 'option' );
	option2.__value = "inch";
	option2.value = option2.__value;
	
	option2.appendChild( document.createTextNode( "inch" ) );
	
	select.appendChild( option2 );
	
	div2.appendChild( select );
	
	form.appendChild( div2 );
	
	form.appendChild( document.createTextNode( "\n\n " ) );
	
	var matForm_initialData = {};
	
	if ( 'frame' in root ) matForm_initialData.frame = root.frame;
	
	var matForm = new template$2.components.MatForm({
		target: form,
		parent: component,
		data: matForm_initialData
	});
	var matForm_updating = false;
	
	component.__bindings.push( function () {
		matForm.observe( 'frame', function ( value ) {
			matForm_updating = true;
			component.set({ frame: value });
			matForm_updating = false;
		});
	});
	
	target.appendChild( form );

	return {
		update: function ( changed, root ) {
			if ( !fileInput_updating && 'imageUrl' in changed ) {
				fileInput.set({ imageUrl: root.imageUrl });
			}
			if ( !fileInput_updating && 'frame' in changed ) {
				fileInput.set({ imageEl: root.frame.image });
			}
			
			if ( !fileInput1_updating && 'wallUrl' in changed ) {
				fileInput1.set({ wallUrl: root.wallUrl });
			}
			if ( !fileInput1_updating && 'frame' in changed ) {
				fileInput1.set({ imageEl: root.frame.wall });
			}
			
			if ( !input_updating ) input.value = root.frame.artWidth;
			
			if ( !input1_updating ) input1.value = root.frame.artHeight;
			
			if ( !select_updating ) select.value = root.frame.unit;
			
			if ( !matForm_updating && 'frame' in changed ) {
				matForm.set({ frame: root.frame });
			}
		},

		teardown: function ( detach ) {
			if ( detach ) form.parentNode.removeChild( form );
			
			fileInput.teardown( false );
			
			fileInput1.teardown( false );
			
			
			
			
			
			input.removeEventListener( 'input', inputChangeHandler, false );
			
			
			
			
			
			input1.removeEventListener( 'input', input1ChangeHandler, false );
			
			
			
			select.removeEventListener( 'change', selectChangeHandler, false );
			
			
			
			
			
			
			
			matForm.teardown( false );
		}
	};
}

function FramerForm ( options ) {
	var component = this;
	var state = Object.assign( template$2.data(), options.data );

	var observers = {
		immediate: Object.create( null ),
		deferred: Object.create( null )
	};

	var callbacks = Object.create( null );

	function dispatchObservers ( group, newState, oldState ) {
		for ( var key in group ) {
			if ( !( key in newState ) ) continue;

			var newValue = newState[ key ];
			var oldValue = oldState[ key ];

			if ( newValue === oldValue && typeof newValue !== 'object' ) continue;

			var callbacks = group[ key ];
			if ( !callbacks ) continue;

			for ( var i = 0; i < callbacks.length; i += 1 ) {
				var callback = callbacks[i];
				if ( callback.__calling ) continue;

				callback.__calling = true;
				callback.call( component, newValue, oldValue );
				callback.__calling = false;
			}
		}
	}

	this.fire = function fire ( eventName, data ) {
		var handlers = eventName in callbacks && callbacks[ eventName ].slice();
		if ( !handlers ) return;

		for ( var i = 0; i < handlers.length; i += 1 ) {
			handlers[i].call( this, data );
		}
	};

	this.get = function get ( key ) {
		return key ? state[ key ] : state;
	};

	this.set = function set ( newState ) {
		var oldState = state;
		state = Object.assign( {}, oldState, newState );
		
		dispatchObservers( observers.immediate, newState, oldState );
		if ( mainFragment ) mainFragment.update( newState, state );
		dispatchObservers( observers.deferred, newState, oldState );
		
		while ( this.__bindings.length ) this.__bindings.pop()();
		
		while ( this.__renderHooks.length ) {
			var hook = this.__renderHooks.pop();
			hook.fn.call( hook.context );
		}
	};

	this.observe = function ( key, callback, options ) {
		var group = ( options && options.defer ) ? observers.deferred : observers.immediate;

		( group[ key ] || ( group[ key ] = [] ) ).push( callback );

		if ( !options || options.init !== false ) {
			callback.__calling = true;
			callback.call( component, state[ key ] );
			callback.__calling = false;
		}

		return {
			cancel: function () {
				var index = group[ key ].indexOf( callback );
				if ( ~index ) group[ key ].splice( index, 1 );
			}
		};
	};

	this.on = function on ( eventName, handler ) {
		var handlers = callbacks[ eventName ] || ( callbacks[ eventName ] = [] );
		handlers.push( handler );

		return {
			cancel: function () {
				var index = handlers.indexOf( handler );
				if ( ~index ) handlers.splice( index, 1 );
			}
		};
	};

	this.teardown = function teardown ( detach ) {
		this.fire( 'teardown' );

		mainFragment.teardown( detach !== false );
		mainFragment = null;

		state = {};
	};

	if ( !addedCss$1 ) addCss$1();
	
	this.__renderHooks = [];
	
	this.__bindings = [];
	var mainFragment = renderMainFragment$2( state, this, options.target );
	while ( this.__bindings.length ) this.__bindings.pop()();
	
	while ( this.__renderHooks.length ) {
		var hook = this.__renderHooks.pop();
		hook.fn.call( hook.context );
	}
	
	if ( options.parent ) {
		options.parent.__renderHooks.push({ fn: template$2.onrender, context: this });
	} else {
		template$2.onrender.call( this );
	}
}

var template = (function () {
  return {
    data() {
      return {
        frame: {
          image: '',
          unit: 'mm',
          artWidth: 500,
          artHeight: 500,
          hasMat: false,
          matTop: 50,
          matSides: 50,
          matBottom: 70,
          profile: 36,
          overlap: 5
        }
      }
    },

    components: {
      Renderer,
      FramerForm,
    }
  }
}());

function renderMainFragment ( root, component, target ) {
	var renderer_initialData = {};
	
	if ( 'frame' in root ) renderer_initialData.frame = root.frame;
	
	var renderer = new template.components.Renderer({
		target: target,
		parent: component,
		data: renderer_initialData
	});
	var renderer_updating = false;
	
	component.__bindings.push( function () {
		renderer.observe( 'frame', function ( value ) {
			renderer_updating = true;
			component.set({ frame: value });
			renderer_updating = false;
		});
	});
	
	var text = document.createTextNode( "\n" );
	target.appendChild( text );
	
	var framerForm_initialData = {};
	
	if ( 'frame' in root ) framerForm_initialData.frame = root.frame;
	
	var framerForm = new template.components.FramerForm({
		target: target,
		parent: component,
		data: framerForm_initialData
	});
	var framerForm_updating = false;
	
	component.__bindings.push( function () {
		framerForm.observe( 'frame', function ( value ) {
			framerForm_updating = true;
			component.set({ frame: value });
			framerForm_updating = false;
		});
	});

	return {
		update: function ( changed, root ) {
			if ( !renderer_updating && 'frame' in changed ) {
				renderer.set({ frame: root.frame });
			}
			
			if ( !framerForm_updating && 'frame' in changed ) {
				framerForm.set({ frame: root.frame });
			}
		},

		teardown: function ( detach ) {
			renderer.teardown( true );
			
			if ( detach ) text.parentNode.removeChild( text );
			
			framerForm.teardown( true );
		}
	};
}

function Framer ( options ) {
	var component = this;
	var state = Object.assign( template.data(), options.data );

	var observers = {
		immediate: Object.create( null ),
		deferred: Object.create( null )
	};

	var callbacks = Object.create( null );

	function dispatchObservers ( group, newState, oldState ) {
		for ( var key in group ) {
			if ( !( key in newState ) ) continue;

			var newValue = newState[ key ];
			var oldValue = oldState[ key ];

			if ( newValue === oldValue && typeof newValue !== 'object' ) continue;

			var callbacks = group[ key ];
			if ( !callbacks ) continue;

			for ( var i = 0; i < callbacks.length; i += 1 ) {
				var callback = callbacks[i];
				if ( callback.__calling ) continue;

				callback.__calling = true;
				callback.call( component, newValue, oldValue );
				callback.__calling = false;
			}
		}
	}

	this.fire = function fire ( eventName, data ) {
		var handlers = eventName in callbacks && callbacks[ eventName ].slice();
		if ( !handlers ) return;

		for ( var i = 0; i < handlers.length; i += 1 ) {
			handlers[i].call( this, data );
		}
	};

	this.get = function get ( key ) {
		return key ? state[ key ] : state;
	};

	this.set = function set ( newState ) {
		var oldState = state;
		state = Object.assign( {}, oldState, newState );
		
		dispatchObservers( observers.immediate, newState, oldState );
		if ( mainFragment ) mainFragment.update( newState, state );
		dispatchObservers( observers.deferred, newState, oldState );
		
		while ( this.__bindings.length ) this.__bindings.pop()();
		
		while ( this.__renderHooks.length ) {
			var hook = this.__renderHooks.pop();
			hook.fn.call( hook.context );
		}
	};

	this.observe = function ( key, callback, options ) {
		var group = ( options && options.defer ) ? observers.deferred : observers.immediate;

		( group[ key ] || ( group[ key ] = [] ) ).push( callback );

		if ( !options || options.init !== false ) {
			callback.__calling = true;
			callback.call( component, state[ key ] );
			callback.__calling = false;
		}

		return {
			cancel: function () {
				var index = group[ key ].indexOf( callback );
				if ( ~index ) group[ key ].splice( index, 1 );
			}
		};
	};

	this.on = function on ( eventName, handler ) {
		var handlers = callbacks[ eventName ] || ( callbacks[ eventName ] = [] );
		handlers.push( handler );

		return {
			cancel: function () {
				var index = handlers.indexOf( handler );
				if ( ~index ) handlers.splice( index, 1 );
			}
		};
	};

	this.teardown = function teardown ( detach ) {
		this.fire( 'teardown' );

		mainFragment.teardown( detach !== false );
		mainFragment = null;

		state = {};
	};

	this.__renderHooks = [];
	
	this.__bindings = [];
	var mainFragment = renderMainFragment( state, this, options.target );
	while ( this.__bindings.length ) this.__bindings.pop()();
	
	while ( this.__renderHooks.length ) {
		var hook = this.__renderHooks.pop();
		hook.fn.call( hook.context );
	}
}

let target;
try {
  const images = document.querySelector('.images');
  const main = images.parentNode;

  target = document.createElement('div');
  main.insertBefore(target, images);
} catch(e) {
  target = document.querySelector('.framerapp'); 
}
window.Framer = new Framer({
	target
});

}());
//# sourceMappingURL=bundle.js.map
