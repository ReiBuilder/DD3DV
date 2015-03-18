/**
 * Created by Abyss on 15-2-23.
 *
 * It is a separate part of DD3DVEngine.
 * It uses to make a words-net to show the words have been supported by Rei.
 * It is based on Effect, and includes something experiment would be used in Effect later.
 *
 * 2015-03-10
 * Words.js is moved to project DD3DV.
 *
 */

DD3DV.WordsNet = function (parameters) {

    this._camera = parameters.camera;
    this._scene = parameters.scene;

    this._wordNodes = [];
    this._currentFocusWord = null;

    this._domElementId = parameters.domElementId;
    this._clientWidth = null;
    this._clientHeight = null;
    this._left = 0;
    this._top = 0;

    this._hitMeshCollection = [];
};

DD3DV.WordsNet.prototype = {

    constructor: DD3DV.WordsNet,

    initWordsNet: function () {
        var geter = document.getElementById(this._domElementId);
        while (geter && geter.tagName !== 'BODY') {

            this._left += geter.offsetLeft;
            this._top += geter.offsetTop;
            geter = geter.offsetParent;
        }

        this._left += window.pageXOffset;
        this._top -= window.pageYOffset;

        var container = document.getElementById(this._domElementId);
        this._clientWidth = container.clientWidth;
        this._clientHeight = container.clientHeight;
    },

    add: function(wordNode)
    {
        this._wordNodes.push(wordNode);
    },

    getWordNodeByName: function(name) {

        for(var i = 0, j = this._wordNodes.length; i < j; i++)
        {
            if(this._wordNodes[i]._name == name)
            {
                return this._wordNodes[i];
            }
        }
        return null;
    },

    addWordNetToScene: function()
    {
        for(var i = 0, j = this._wordNodes.length; i < j; i++)
        {
            this._wordNodes[i].init();
            this._scene.add(this._wordNodes[i]._sprite);
            this._scene.add(this._wordNodes[i]._hitmesh);
            this._hitMeshCollection.push(this._wordNodes[i]._hitmesh);
        }
    },

    update: function(x,y)
    {
        for(var i = 0, j = this._hitMeshCollection.length; i< j; i++)
        {
            this._hitMeshCollection[i].lookAt(this._camera.position);
        }

        var vector;

        var processedX = ((x - this._left) / this._clientWidth) * 2 - 1;
        var processedY = -((y - this._top) / this._clientHeight) * 2 + 1;

        vector = new THREE.Vector3( processedX, processedY, 0.5 );

        var projector = new THREE.Projector();
        projector.unprojectVector(vector, this._camera);

        var rayCaster = new THREE.Raycaster(this._camera.position, vector.sub( this._camera.position ).normalize());

        var intersects = rayCaster.intersectObjects( this._hitMeshCollection );

        if ( intersects.length > 0 ) {
            var targetNodeName = intersects[ 0 ].object.name;
            if ( this._currentFocusWord != targetNodeName) {

                if (this._currentFocusWord) {
                    //set the last focused hitMesh and sprite to original position
                    var lastFocusedWordNode = this.getWordNodeByName(this._currentFocusWord);
                    var oPos = lastFocusedWordNode._originalPosition;

                    lastFocusedWordNode._sprite.position.set(oPos.x, oPos.y, oPos.z);
                    lastFocusedWordNode._hitmesh.position.set(oPos.x, oPos.y, oPos.z);
                }

                //put current focused hitMesh and sprite to new position
                var focusedWordNode = this.getWordNodeByName(targetNodeName);

                var oPos = focusedWordNode._originalPosition;;
                var x = (this._camera.position.x + oPos.x)/2;
                var y = (this._camera.position.y + oPos.y)/2;
                var z = (this._camera.position.z + oPos.z)/2;
                var z_sprite = z-1;

                focusedWordNode._hitmesh.position.set(x,y,z);
                focusedWordNode._sprite.position.set(x,y,z_sprite);//z_sprite//

                this._currentFocusWord = targetNodeName;
            }

        }
        else {
            if ( this._currentFocusWord )
            {
                var lastFocusedWordNode = this.getWordNodeByName(this._currentFocusWord);
                var oPos = lastFocusedWordNode._originalPosition;

                lastFocusedWordNode._sprite.position.set(oPos.x, oPos.y, oPos.z);
                lastFocusedWordNode._hitmesh.position.set(oPos.x, oPos.y, oPos.z);
            }
            this._currentFocusWord = null;
        }
    }
}


////////////////////////////////////////////////
//               the WordNode                 //
////////////////////////////////////////////////


DD3DV.WordNode = function(parameters) {

    this._parameters = parameters;
    this._name = parameters.name;
    this._word = parameters.word;
    this._description = parameters.description;

    this._originalPosition = parameters.position;

    this._isAddedToScene = false;
    this._isDeleteFromScene = false;

    this._wordLength;
    this._symbolWidth = 30;
    this._symbolWidthForHitMesh = 42;
    this._fontSize = 24;
    this._buffer = 15;

    this._totalWidth;
    this._totalWidthForHitMesh;
    this._totalHeight;

    this._sprite = null;
    this._hitmesh = null;

}


DD3DV.WordNode.prototype = {

    constructor: DD3DV.WordNode,

    init : function()
    {
        this._wordLength = this._word.length;
        this._totalWidth = this._symbolWidth * this._wordLength + 2 * this._buffer;
        this._totalWidthForHitMesh = this._symbolWidthForHitMesh * this._wordLength + 2 * this._buffer;
        this._totalHeight = this._fontSize + 2 * this._buffer;

        this.createSprite();
        this.createHitMesh();

    },

    makeFrame: function(context, width, height, r)
    {
        context.beginPath();
        context.moveTo(r,0);//A
        context.lineTo(r + width, 0);//B
        context.quadraticCurveTo(r + width + r, 0, r + width + r, r);//C
        context.lineTo(width + 2 * r, height + r);//D
        context.quadraticCurveTo(width + 2 * r, height + 2 * r, width + r, height + 2 * r);//E
        context.lineTo(r, height + 2 * r);//F
        context.quadraticCurveTo(0, height + 2 * r, 0, height + r);//G
        context.lineTo(0, r);//H
        context.quadraticCurveTo(0, 0, r, 0);//A again
        context.closePath();
        context.fill();
        context.stroke();
    },

    getTexture: function () {

        var canvas = document.createElement('canvas');

        canvas.width = this._totalWidth;
        canvas.height = this._totalHeight;
        var context = canvas.getContext('2d');

        context.strokeStyle = "rgba(0,255,0,1.0)";
        context.fillStyle = "rgba(255,255,255,1.0)";
        context.lineWidth = 3;

        this.makeFrame(context,this._symbolWidth * this._wordLength,this._fontSize,this._buffer);

        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = this._fontSize + "pt Arial";
        context.fillStyle = "black";
        context.fillText(this._word, this._totalWidth/2, this._totalHeight/2);

        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    },


    createSprite : function() {

        var texture = this.getTexture();

        var material = new THREE.SpriteMaterial({
            map: texture
        });

        this._sprite = new THREE.Sprite(material);

        this._sprite.name = this._name;

        this._sprite.scale.set(10 * this._wordLength, 10);//think how to compute this.

        this._sprite.position.set(this._originalPosition.x,this._originalPosition.y,this._originalPosition.z);
    },

    createHitMesh :function()
    {
        this._hitmesh = new THREE.Mesh(
            new THREE.PlaneGeometry(this._totalWidthForHitMesh/5, this._totalHeight/5),
            new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.5 } ));
        this._hitmesh.visible = false;

        this._hitmesh.geometry.computeBoundingBox();
        this._hitmesh.geometry.computeBoundingSphere();

        this._hitmesh.name = this._name;

        this._hitmesh.position.set(this._originalPosition.x,this._originalPosition.y,this._originalPosition.z);//
    }
};